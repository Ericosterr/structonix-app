import type { CareerJobKey } from "@data/careers";

export const CAREER_CV_MAX_BYTES = 5 * 1024 * 1024;

export const CAREER_CV_ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;

export const CAREER_CV_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export function getCareerCvExtension(filename: string): string {
  const match = filename.toLowerCase().match(/(\.[a-z0-9]+)$/);
  return match?.[1] ?? "";
}

export function isAllowedCareerCvFile(file: {
  name: string;
  type: string;
  size: number;
}): { ok: true } | { ok: false; reason: "empty" | "size" | "type" } {
  if (!file.name || file.size <= 0) {
    return { ok: false, reason: "empty" };
  }

  if (file.size > CAREER_CV_MAX_BYTES) {
    return { ok: false, reason: "size" };
  }

  const extension = getCareerCvExtension(file.name);
  const extensionOk = (CAREER_CV_ALLOWED_EXTENSIONS as readonly string[]).includes(
    extension,
  );
  const mimeOk =
    !file.type ||
    file.type === "application/octet-stream" ||
    (CAREER_CV_ALLOWED_MIME_TYPES as readonly string[]).includes(file.type);

  if (!extensionOk || !mimeOk) {
    return { ok: false, reason: "type" };
  }

  return { ok: true };
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export type CareerApplicationEmailData = {
  jobTitle: string;
  jobKey?: CareerJobKey;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  age: number;
  locale: string;
  coverLetter: string;
  cvFilename: string;
};

export function buildCareerApplicationEmailText(data: CareerApplicationEmailData): string {
  return `New Career Application — Structonix

Vacancy:
${data.jobTitle}

Candidate:
${data.firstName} ${data.lastName}

Phone:
${data.phone}

Email:
${data.email}

Age:
${data.age}

Language:
${data.locale.toUpperCase()}

Cover Letter:
${data.coverLetter}

CV:
${data.cvFilename} (attached)`;
}

export function buildCareerApplicationEmailHtml(data: CareerApplicationEmailData): string {
  const coverLetterHtml = escapeHtml(data.coverLetter).replaceAll("\n", "<br />");

  return `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, Helvetica, sans-serif; color: #111; line-height: 1.5;">
    <h1 style="font-size: 18px; margin: 0 0 16px;">New Career Application — Structonix</h1>
    <table style="border-collapse: collapse; width: 100%; max-width: 640px;">
      <tr>
        <td style="padding: 6px 0; font-weight: bold; width: 140px; vertical-align: top;">Vacancy</td>
        <td style="padding: 6px 0;">${escapeHtml(data.jobTitle)}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Candidate</td>
        <td style="padding: 6px 0;">${escapeHtml(`${data.firstName} ${data.lastName}`)}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Phone</td>
        <td style="padding: 6px 0;">${escapeHtml(data.phone)}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Email</td>
        <td style="padding: 6px 0;">${escapeHtml(data.email)}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Age</td>
        <td style="padding: 6px 0;">${escapeHtml(String(data.age))}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Language</td>
        <td style="padding: 6px 0;">${escapeHtml(data.locale.toUpperCase())}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: bold; vertical-align: top;">CV</td>
        <td style="padding: 6px 0;">${escapeHtml(data.cvFilename)} (attached)</td>
      </tr>
    </table>
    <h2 style="font-size: 16px; margin: 24px 0 8px;">Cover Letter</h2>
    <div style="white-space: normal;">${coverLetterHtml}</div>
  </body>
</html>`;
}

export function buildCareerApplicationSubject(data: {
  jobTitle: string;
  firstName: string;
  lastName: string;
}): string {
  const sanitize = (value: string) => value.replace(/[\r\n]+/g, " ").trim();
  return `New Career Application — ${sanitize(data.jobTitle)} — ${sanitize(data.firstName)} ${sanitize(data.lastName)}`;
}
