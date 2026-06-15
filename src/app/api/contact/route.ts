import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { company } from "@config/company";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { isRecaptchaRequired, verifyRecaptchaToken } from "@/lib/recaptcha";

const contactPayloadSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  telefono: z.string().min(1),
  mensaje: z.string().min(10),
  recaptchaToken: z
    .preprocess((value) => (value === null ? undefined : value), z.string().optional()),
  website: z.string().optional(),
});

function getResendFromAddress(): string | null {
  return process.env.RESEND_FROM?.trim() || null;
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    if (isRateLimited(clientIp)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = contactPayloadSchema.safeParse(body);

    if (!parsed.success) {
      console.error("[contact] Zod validation failed", parsed.error.flatten());
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const data = parsed.data;

    if (data.website) {
      return NextResponse.json({ success: true });
    }

    if (isRecaptchaRequired()) {
      if (!data.recaptchaToken) {
        console.error("[contact] Missing reCAPTCHA token");
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
      }

      const verification = await verifyRecaptchaToken(data.recaptchaToken);
      console.log("[contact] reCAPTCHA verification result", verification);

      if (!verification.valid) {
        console.error("[contact] reCAPTCHA verification failed", verification);
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
      }
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFrom = getResendFromAddress();
    const destinationEmail = company.email;

    if (!resendApiKey || !resendFrom || !destinationEmail) {
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 503 },
      );
    }

    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: resendFrom,
      to: destinationEmail,
      subject: `Contact form — ${data.nombre}`,
      replyTo: data.email,
      text: [
        `Nombre: ${data.nombre}`,
        `Email: ${data.email}`,
        `Teléfono: ${data.telefono}`,
        "",
        data.mensaje,
      ].join("\n"),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact] Unexpected error", error);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
