export function trackCareerEvent(
  eventName:
    | "career_job_view"
    | "career_application_start"
    | "career_application_submit"
    | "career_application_success",
  jobTitle: string,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const gtag = window.gtag;
  if (typeof gtag !== "function") {
    return;
  }

  gtag("event", eventName, {
    job_title: jobTitle,
  });
}
