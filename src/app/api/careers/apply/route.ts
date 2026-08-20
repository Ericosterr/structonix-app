import { NextResponse } from "next/server";
import { Resend } from "resend";
import { company } from "@config/company";
import { careerApplicationServerSchema } from "@/components/forms/schemas/career-application";
import {
  buildCareerApplicationEmailHtml,
  buildCareerApplicationEmailText,
  buildCareerApplicationSubject,
  getCareerCvExtension,
  isAllowedCareerCvFile,
} from "@/lib/career-application";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { isRecaptchaRequired, verifyRecaptchaToken } from "@/lib/recaptcha";
import { getResendConfig, maskResendConfig } from "@/lib/resend-config";

export const runtime = "nodejs";

type CareerStage =
  | "START"
  | "FORMDATA_PARSED"
  | "VALIDATION_OK"
  | "FILE_OK"
  | "ANTISPAM_OK"
  | "RECAPTCHA_OK"
  | "RESEND_CONFIG_OK"
  | "RESEND_SEND_START"
  | "RESEND_SEND_OK";

function getResendErrorFields(error: unknown): {
  errorName?: string;
  errorMessage: string;
  statusCode?: number;
} {
  if (!error || typeof error !== "object") {
    return { errorMessage: "Unknown Resend error." };
  }

  const record = error as Record<string, unknown>;
  const errorMessage =
    (typeof record.message === "string" && record.message) ||
    (typeof record.error === "string" && record.error) ||
    "Unknown Resend error.";

  return {
    errorName: typeof record.name === "string" ? record.name : undefined,
    errorMessage,
    statusCode:
      typeof record.statusCode === "number" ? record.statusCode : undefined,
  };
}

function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/** Resend JSON API expects base64 string; raw Buffer serializes incorrectly via JSON.stringify. */
function toResendAttachmentContent(buffer: Buffer): string {
  return buffer.toString("base64");
}

/** ASCII-safe attachment filename (Cyrillic names can break some providers). */
function toSafeAttachmentFilename(originalName: string): string {
  const extension = getCareerCvExtension(originalName) || ".pdf";
  const base = originalName
    .slice(0, Math.max(0, originalName.length - extension.length))
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]+/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "cv"}${extension}`;
}

function contentTypeForCv(filename: string, mimeType: string): string | undefined {
  if (mimeType && mimeType !== "application/octet-stream") {
    return mimeType;
  }

  const extension = getCareerCvExtension(filename);
  if (extension === ".pdf") {
    return "application/pdf";
  }
  if (extension === ".doc") {
    return "application/msword";
  }
  if (extension === ".docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return undefined;
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const clientIp = getClientIp(request);
  let stage: CareerStage = "START";

  console.info("[careers/apply] Incoming request", {
    requestId,
    clientIp,
    stage,
    contentType: request.headers.get("content-type"),
  });

  try {
    if (isRateLimited(`careers:${clientIp}`)) {
      console.warn("[careers/apply] Rate limit exceeded", {
        requestId,
        stage,
        clientIp,
      });
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (parseError) {
      console.error("[careers/apply] Failed to parse multipart body", {
        requestId,
        stage,
        error: parseError instanceof Error ? parseError.message : "parse_error",
      });
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    stage = "FORMDATA_PARSED";

    const payload = {
      jobKey: String(formData.get("jobKey") ?? ""),
      jobTitle: String(formData.get("jobTitle") ?? ""),
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      age: String(formData.get("age") ?? ""),
      coverLetter: String(formData.get("coverLetter") ?? ""),
      locale: String(formData.get("locale") ?? ""),
      website: String(formData.get("website") ?? ""),
      recaptchaToken: formData.get("recaptchaToken")
        ? String(formData.get("recaptchaToken"))
        : undefined,
    };

    const parsed = careerApplicationServerSchema.safeParse(payload);

    if (!parsed.success) {
      console.error("[careers/apply] Validation failed", {
        requestId,
        stage,
        issues: parsed.error.flatten(),
      });
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const data = parsed.data;
    stage = "VALIDATION_OK";

    if (data.website) {
      console.info("[careers/apply] Honeypot triggered; skipping email send", {
        requestId,
        stage,
      });
      return NextResponse.json({ success: true });
    }
    stage = "ANTISPAM_OK";

    const cvEntry = formData.get("cv");
    if (!(cvEntry instanceof File)) {
      console.error("[careers/apply] Missing CV file", { requestId, stage });
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const cvCheck = isAllowedCareerCvFile({
      name: cvEntry.name,
      type: cvEntry.type,
      size: cvEntry.size,
    });

    if (!cvCheck.ok) {
      console.error("[careers/apply] CV rejected", {
        requestId,
        stage,
        reason: cvCheck.reason,
        size: cvEntry.size,
        mimeType: cvEntry.type || "(empty)",
        extension: getCareerCvExtension(cvEntry.name) || "(none)",
      });

      if (cvCheck.reason === "size") {
        return NextResponse.json({ error: "CV too large." }, { status: 413 });
      }
      if (cvCheck.reason === "type") {
        return NextResponse.json({ error: "Invalid CV format." }, { status: 415 });
      }
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    stage = "FILE_OK";

    if (isRecaptchaRequired()) {
      if (!data.recaptchaToken) {
        console.error("[careers/apply] Missing reCAPTCHA token", {
          requestId,
          stage: "RECAPTCHA",
        });
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
      }

      const verification = await verifyRecaptchaToken(data.recaptchaToken);
      if (!verification.valid) {
        console.error("[careers/apply] reCAPTCHA verification failed", {
          requestId,
          stage: "RECAPTCHA",
          success: verification.success,
          action: verification.action,
          score: verification.score,
          errorCodes: verification.errorCodes,
        });
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
      }
    }
    stage = "RECAPTCHA_OK";

    const destinationEmail = company.careersEmail;
    const resendConfig = getResendConfig();

    console.info("[careers/apply] Email configuration", {
      requestId,
      stage,
      destinationEmail,
      jobKey: data.jobKey,
      cvSize: cvEntry.size,
      cvMimeType: cvEntry.type || "(empty)",
      cvExtension: getCareerCvExtension(cvEntry.name) || "(none)",
      ...maskResendConfig(),
    });

    if (!resendConfig.ok) {
      console.error("[careers/apply] Email service is not configured", {
        requestId,
        stage: "RESEND_CONFIG",
        reason: resendConfig.reason,
        apiKeyConfigured: Boolean(process.env.RESEND_API_KEY?.trim()),
        fromConfigured: Boolean(process.env.RESEND_FROM?.trim()),
      });
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 503 },
      );
    }
    stage = "RESEND_CONFIG_OK";

    const emailData = {
      jobTitle: data.jobTitle,
      jobKey: data.jobKey,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      age: data.age,
      locale: data.locale,
      coverLetter: data.coverLetter,
      cvFilename: cvEntry.name,
    };

    const subject = buildCareerApplicationSubject(data);
    const text = buildCareerApplicationEmailText(emailData);
    const html = buildCareerApplicationEmailHtml(emailData);
    const cvBuffer = Buffer.from(await cvEntry.arrayBuffer());
    const attachmentFilename = toSafeAttachmentFilename(cvEntry.name);
    const attachmentContentType = contentTypeForCv(cvEntry.name, cvEntry.type);

    stage = "RESEND_SEND_START";
    console.info("[careers/apply] Sending via Resend", {
      requestId,
      stage,
      apiKeyConfigured: true,
      fromConfigured: true,
      recipient: destinationEmail,
      attachmentFilename,
      attachmentBytes: cvBuffer.byteLength,
      attachmentEncoding: "base64",
    });

    const resend = new Resend(resendConfig.apiKey);
    const { data: sendData, error: sendError } = await resend.emails.send({
      from: resendConfig.from,
      to: destinationEmail,
      subject,
      replyTo: data.email,
      text,
      html,
      attachments: [
        {
          filename: attachmentFilename,
          content: toResendAttachmentContent(cvBuffer),
          contentType: attachmentContentType,
        },
      ],
    });

    if (sendError) {
      const fields = getResendErrorFields(sendError);
      console.error("[careers/apply] email send failed", {
        requestId,
        stage: "RESEND_SEND",
        apiKeyConfigured: true,
        fromConfigured: true,
        errorName: fields.errorName,
        errorMessage: fields.errorMessage,
        statusCode: fields.statusCode,
        attachmentFilename,
        attachmentBytes: cvBuffer.byteLength,
      });
      return NextResponse.json(
        {
          error: "Failed to send email.",
          ...(isDevelopment() ? { detail: fields.errorMessage } : {}),
        },
        { status: 502 },
      );
    }

    if (!sendData?.id) {
      console.error("[careers/apply] Resend returned success without message id", {
        requestId,
        stage: "RESEND_SEND",
      });
      return NextResponse.json({ error: "Failed to send email." }, { status: 502 });
    }

    stage = "RESEND_SEND_OK";
    console.info("[careers/apply] Email accepted by Resend", {
      requestId,
      stage,
      messageId: sendData.id,
      recipient: destinationEmail,
      jobKey: data.jobKey,
    });

    return NextResponse.json({ success: true, messageId: sendData.id });
  } catch (error) {
    console.error("[careers/apply] Unexpected error", {
      requestId,
      stage,
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
