const EMAIL_ADDRESS_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const NAMED_EMAIL_PATTERN = /^(.+)\s<([^<>]+)>$/;
const LOOSE_NAME_EMAIL_PATTERN = /^(.+?)\s+([^\s@<>]+@[^\s@<>]+\.[^\s@<>]+)$/;

export type ResendConfig =
  | {
      ok: true;
      apiKey: string;
      from: string;
    }
  | {
      ok: false;
      reason: "missing_api_key" | "missing_from" | "invalid_from";
      message: string;
      rawFrom?: string;
    };

function normalizeResendFrom(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  if (EMAIL_ADDRESS_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const namedMatch = trimmed.match(NAMED_EMAIL_PATTERN);
  if (namedMatch) {
    const [, displayName, email] = namedMatch;
    if (EMAIL_ADDRESS_PATTERN.test(email)) {
      return `${displayName.trim()} <${email.trim()}>`;
    }
  }

  const looseMatch = trimmed.match(LOOSE_NAME_EMAIL_PATTERN);
  if (looseMatch) {
    const [, displayName, email] = looseMatch;
    return `${displayName.trim()} <${email.trim()}>`;
  }

  return null;
}

/** Single source of truth for the Resend sender address (RESEND_FROM). */
export function getResendFromAddress(): string | null {
  const raw = process.env.RESEND_FROM?.trim();
  if (!raw) {
    return null;
  }

  return normalizeResendFrom(raw);
}

export function getResendConfig(): ResendConfig {
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const rawFrom = process.env.RESEND_FROM?.trim() ?? "";
  const from = getResendFromAddress();

  if (!apiKey) {
    return {
      ok: false,
      reason: "missing_api_key",
      message: "RESEND_API_KEY is not configured.",
    };
  }

  if (!rawFrom) {
    return {
      ok: false,
      reason: "missing_from",
      message: "RESEND_FROM is not configured.",
    };
  }

  if (!from) {
    return {
      ok: false,
      reason: "invalid_from",
      message:
        'RESEND_FROM must follow "email@example.com" or "Name <email@example.com>" format.',
      rawFrom,
    };
  }

  return { ok: true, apiKey, from };
}

export function maskResendConfig(): Record<string, string | boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const rawFrom = process.env.RESEND_FROM?.trim() ?? "";
  const from = getResendFromAddress();

  return {
    resendApiKeyConfigured: apiKey.length > 0,
    resendApiKeyPrefix: apiKey ? `${apiKey.slice(0, 6)}…` : "(missing)",
    resendFromRaw: rawFrom || "(missing)",
    resendFromNormalized: from ?? "(invalid)",
    resendFromValid: Boolean(from),
  };
}

export function buildContactEmailText(data: {
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
}): string {
  return `New contact form submission

Name:
${data.nombre}

Email:
${data.email}

Phone:
${data.telefono}

Message:
${data.mensaje}`;
}
