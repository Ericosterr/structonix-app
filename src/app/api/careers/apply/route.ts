import { NextResponse } from "next/server";
import { Resend } from "resend";
import { company } from "@config/company";
import { careerApplicationServerSchema } from "@/components/forms/schemas/career-application";
import {
  buildCareerApplicationEmailHtml,
  buildCareerApplicationEmailText,
  buildCareerApplicationSubject,
  isAllowedCareerCvFile,
} from "@/lib/career-application";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { isRecaptchaRequired, verifyRecaptchaToken } from "@/lib/recaptcha";
import { getResendConfig, maskResendConfig } from "@/lib/resend-config";

export const runtime = "nodejs";

function getResendErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Unknown Resend error.";
  }

  const record = error as Record<string, unknown>;

  if (typeof record.message === "string" && record.message.length > 0) {
    return record.message;
  }

  if (typeof record.error === "string" && record.error.length > 0) {
    return record.error;
  }

  return "Unknown Resend error.";
}

function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const clientIp = getClientIp(request);

  console.info("[careers/apply] Incoming request", {
    requestId,
    clientIp,
    contentType: request.headers.get("content-type"),
  });

  try {
    if (isRateLimited(`careers:${clientIp}`)) {
      console.warn("[careers/apply] Rate limit exceeded", { requestId, clientIp });
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (parseError) {
      console.error("[careers/apply] Failed to parse multipart body", {
        requestId,
        error: parseError instanceof Error ? parseError.message : "parse_error",
      });
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

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
        issues: parsed.error.flatten(),
      });
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const data = parsed.data;

    if (data.website) {
      console.info("[careers/apply] Honeypot triggered; skipping email send", {
        requestId,
      });
      return NextResponse.json({ success: true });
    }

    const cvEntry = formData.get("cv");
    if (!(cvEntry instanceof File)) {
      console.error("[careers/apply] Missing CV file", { requestId });
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
        reason: cvCheck.reason,
        size: cvEntry.size,
        extension: cvEntry.name.includes(".")
          ? cvEntry.name.slice(cvEntry.name.lastIndexOf("."))
          : "(none)",
      });
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    if (isRecaptchaRequired()) {
      if (!data.recaptchaToken) {
        console.error("[careers/apply] Missing reCAPTCHA token", { requestId });
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
      }

      const verification = await verifyRecaptchaToken(data.recaptchaToken);
      if (!verification.valid) {
        console.error("[careers/apply] reCAPTCHA verification failed", {
          requestId,
          success: verification.success,
          errorCodes: verification.errorCodes,
        });
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
      }
    }

    const destinationEmail = company.careersEmail;
    const resendConfig = getResendConfig();

    console.info("[careers/apply] Email configuration", {
      requestId,
      destinationEmail,
      jobKey: data.jobKey,
      ...maskResendConfig(),
    });

    if (!resendConfig.ok) {
      console.error("[careers/apply] Email service is not configured", {
        requestId,
        reason: resendConfig.reason,
      });
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 503 },
      );
    }

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
          filename: cvEntry.name,
          content: cvBuffer,
        },
      ],
    });

    if (sendError) {
      const errorMessage = getResendErrorMessage(sendError);
      console.error("[careers/apply] Resend rejected email send", {
        requestId,
        errorMessage,
      });
      return NextResponse.json(
        {
          error: "Failed to send email.",
          ...(isDevelopment() ? { detail: errorMessage } : {}),
        },
        { status: 502 },
      );
    }

    if (!sendData?.id) {
      console.error("[careers/apply] Resend returned success without message id", {
        requestId,
      });
      return NextResponse.json({ error: "Failed to send email." }, { status: 502 });
    }

    console.info("[careers/apply] Email accepted by Resend", {
      requestId,
      messageId: sendData.id,
      recipient: destinationEmail,
      jobKey: data.jobKey,
    });

    return NextResponse.json({ success: true, messageId: sendData.id });
  } catch (error) {
    console.error("[careers/apply] Unexpected error", {
      requestId,
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
