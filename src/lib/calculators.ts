import { site } from "@config/site";

export type ConstructionMode = "standard" | "premium";

export function calculateStructurePrice(area: number): number {
  if (!Number.isFinite(area) || area <= 0) return 0;
  return area * site.structureRatePerSqm;
}

export function calculateConstructionPrice(
  area: number,
  mode: ConstructionMode,
): number {
  if (!Number.isFinite(area) || area <= 0) return 0;
  const rate =
    mode === "premium"
      ? site.constructionRates.premium
      : site.constructionRates.standard;
  return area * rate;
}

export function formatPrice(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
