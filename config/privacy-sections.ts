export const privacySectionKeys = [
  "controller",
  "dataCollected",
  "purposes",
  "legalBasis",
  "contactForm",
  "retention",
  "recipients",
  "rights",
  "cookies",
  "security",
  "changes",
  "contact",
] as const;

export type PrivacySectionKey = (typeof privacySectionKeys)[number];
