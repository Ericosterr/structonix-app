type RecaptchaVerifyResponse = {
  success: boolean;
  score?: number;
  action?: string;
  "error-codes"?: string[];
};

export type RecaptchaVerificationResult = {
  valid: boolean;
  success: boolean;
  action?: string;
  score?: number;
  errorCodes?: string[];
};

const MIN_SCORE = 0.5;

export async function verifyRecaptchaToken(
  token: string,
): Promise<RecaptchaVerificationResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    return { valid: true, success: true };
  }

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
    }),
  });

  if (!response.ok) {
    return { valid: false, success: false, errorCodes: ["http-error"] };
  }

  const data = (await response.json()) as RecaptchaVerifyResponse;
  const valid =
    data.success === true &&
    data.action === "contact" &&
    (data.score ?? 0) >= MIN_SCORE;

  return {
    valid,
    success: data.success === true,
    action: data.action,
    score: data.score,
    errorCodes: data["error-codes"],
  };
}

export function isRecaptchaRequired(): boolean {
  return Boolean(process.env.RECAPTCHA_SECRET_KEY);
}
