type RecaptchaVerifyResponse = {
  success: boolean;
  score?: number;
  action?: string;
  "error-codes"?: string[];
};

const MIN_SCORE = 0.5;

export async function verifyRecaptchaToken(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    return true;
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
    return false;
  }

  const data = (await response.json()) as RecaptchaVerifyResponse;
  return (
    data.success === true &&
    data.action === "contact" &&
    (data.score ?? 0) >= MIN_SCORE
  );
}

export function isRecaptchaRequired(): boolean {
  return Boolean(process.env.RECAPTCHA_SECRET_KEY);
}
