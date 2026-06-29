import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { company } from "@config/company";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { isRecaptchaRequired, verifyRecaptchaToken } from "@/lib/recaptcha";
import {
  buildContactEmailText,
  getResendConfig,
  maskResendConfig,
} from "@/lib/resend-config";

const contactPayloadSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  telefono: z.string().min(1),
  mensaje: z.string().min(10),
  recaptchaToken: z
    .preprocess((value) => (value === null ? undefined : value), z.string().optional()),
  website: z.string().optional(),
});

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

function getResendErrorStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const statusCode = (error as Record<string, unknown>).statusCode;
  if (typeof statusCode === "number" && statusCode >= 400 && statusCode < 600) {
    return statusCode;
  }

  return undefined;
}

function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const clientIp = getClientIp(request);

  console.info("[contact] Incoming request", {
    requestId,
    clientIp,
    method: request.method,
    contentType: request.headers.get("content-type"),
  });

  try {
    if (isRateLimited(clientIp)) {
      console.warn("[contact] Rate limit exceeded", { requestId, clientIp });
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("[contact] Failed to parse JSON body", {
        requestId,
        error: parseError instanceof Error ? parseError.stack : parseError,
      });
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    console.info("[contact] Parsed body", {
      requestId,
      hasNombre: Boolean(
        body &&
          typeof body === "object" &&
          "nombre" in body &&
          typeof (body as { nombre?: unknown }).nombre === "string",
      ),
      hasEmail: Boolean(
        body &&
          typeof body === "object" &&
          "email" in body &&
          typeof (body as { email?: unknown }).email === "string",
      ),
      hasRecaptchaToken: Boolean(
        body &&
          typeof body === "object" &&
          "recaptchaToken" in body &&
          typeof (body as { recaptchaToken?: unknown }).recaptchaToken === "string",
      ),
      honeypotFilled: Boolean(
        body &&
          typeof body === "object" &&
          "website" in body &&
          typeof (body as { website?: unknown }).website === "string" &&
          (body as { website: string }).website.length > 0,
      ),
    });

    const parsed = contactPayloadSchema.safeParse(body);

    if (!parsed.success) {
      console.error("[contact] Zod validation failed", {
        requestId,
        issues: parsed.error.flatten(),
      });
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const data = parsed.data;

    if (data.website) {
      console.info("[contact] Honeypot triggered; skipping email send", { requestId });
      return NextResponse.json({ success: true });
    }

    if (isRecaptchaRequired()) {
      if (!data.recaptchaToken) {
        console.error("[contact] Missing reCAPTCHA token", { requestId });
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
      }

      const verification = await verifyRecaptchaToken(data.recaptchaToken);
      console.info("[contact] reCAPTCHA verification result", {
        requestId,
        valid: verification.valid,
        success: verification.success,
        action: verification.action,
        score: verification.score,
        errorCodes: verification.errorCodes,
      });

      if (!verification.valid) {
        console.error("[contact] reCAPTCHA verification failed", {
          requestId,
          verification,
        });
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
      }
    } else {
      console.info("[contact] reCAPTCHA not required (RECAPTCHA_SECRET_KEY unset)", {
        requestId,
      });
    }

    const destinationEmail = company.email;
    const resendConfig = getResendConfig();

    console.info("[contact] Email configuration", {
      requestId,
      destinationEmail,
      ...maskResendConfig(),
    });

    if (!resendConfig.ok) {
      console.error("[contact] Email service is not configured", {
        requestId,
        reason: resendConfig.reason,
        message: resendConfig.message,
        rawFrom: "rawFrom" in resendConfig ? resendConfig.rawFrom : undefined,
        ...maskResendConfig(),
      });
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 503 },
      );
    }

    if (!destinationEmail) {
      console.error("[contact] Destination email is not configured", { requestId });
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 503 },
      );
    }

    const { apiKey: resendApiKey, from: resendFrom } = resendConfig;
    const subject = `Contact form — ${data.nombre}`;
    const emailPayload = {
      from: resendFrom,
      to: destinationEmail,
      subject,
      replyTo: data.email,
      text: buildContactEmailText(data),
    };

    console.info("[contact] Sending email via Resend", {
      requestId,
      sender: resendFrom,
      recipient: destinationEmail,
      replyTo: data.email,
      subject,
    });

    const resend = new Resend(resendApiKey);
    const { data: sendData, error: sendError } = await resend.emails.send(emailPayload);

    if (sendError) {
      const errorMessage = getResendErrorMessage(sendError);
      const resendStatusCode = getResendErrorStatusCode(sendError);

      console.error("[contact] Resend rejected email send", {
        requestId,
        resendStatusCode,
        errorMessage,
        errorName:
          sendError && typeof sendError === "object" && "name" in sendError
            ? (sendError as { name?: unknown }).name
            : undefined,
        resendError: sendError,
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
      console.error("[contact] Resend returned success without message id", {
        requestId,
        sendData,
      });
      return NextResponse.json(
        {
          error: "Failed to send email.",
          ...(isDevelopment()
            ? { detail: "Resend did not return a message id." }
            : {}),
        },
        { status: 502 },
      );
    }

    console.info("[contact] Email accepted by Resend", {
      requestId,
      messageId: sendData.id,
      sender: resendFrom,
      recipient: destinationEmail,
      replyTo: data.email,
    });

    return NextResponse.json({ success: true, messageId: sendData.id });
  } catch (error) {
    console.error("[contact] Unexpected error", {
      requestId,
      error: error instanceof Error ? error.stack : error,
    });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
