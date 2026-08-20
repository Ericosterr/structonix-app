export const careerJobKeys = [
  "excavatorOperator",
  "generalLaborer",
  "bricklayer",
  "structureForeman",
  "finishingForeman",
  "plumber",
  "electrician",
  "painterPlasterer",
  "tiler",
] as const;

export type CareerJobKey = (typeof careerJobKeys)[number];

export const careerBenefitKeys = [
  "salary",
  "contract",
  "growth",
  "projects",
] as const;

export type CareerBenefitKey = (typeof careerBenefitKeys)[number];

export function buildCareersWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
