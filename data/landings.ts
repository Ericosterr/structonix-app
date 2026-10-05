import { backgrounds } from "./backgrounds";
import { zoneGeo } from "./zones";
import { routing, type Locale } from "@/i18n/routing";

/**
 * Active commercial landing pages.
 *
 * Marbella commercial intent is consolidated into
 * `construction-company-marbella` (villa + general contractor cluster).
 * Retired slugs are redirected via next.config.ts.
 */
export const landingKeys = [
  "arquitecto-marbella",
  "builders-costa-del-sol",
  "construction-company-marbella",
  "project-management-marbella",
  "obra-nueva-marbella",
  "renovation-marbella",
] as const;

export type LandingKey = (typeof landingKeys)[number];

/**
 * Localized slug per locale. This is the single source of truth for active
 * landing URLs: routing, hreflang, canonical and sitemap are derived from here.
 */
export const landingSlugs: Record<LandingKey, Record<Locale, string>> = {
  "arquitecto-marbella": {
    es: "arquitecto-marbella",
    en: "architect-marbella",
    ru: "arhitektor-marbelya",
  },
  "builders-costa-del-sol": {
    es: "constructora-costa-del-sol",
    en: "builders-costa-del-sol",
    ru: "stroiteli-costa-del-sol",
  },
  "construction-company-marbella": {
    es: "empresa-constructora-marbella",
    en: "construction-company-marbella",
    ru: "stroitelnaya-kompaniya-marbelya",
  },
  "project-management-marbella": {
    es: "gestion-proyectos-marbella",
    en: "project-management-marbella",
    ru: "upravlenie-proektami-marbelya",
  },
  "obra-nueva-marbella": {
    es: "obra-nueva-marbella",
    en: "new-construction-marbella",
    ru: "novoe-stroitelstvo-marbelya",
  },
  "renovation-marbella": {
    es: "reformas-marbella",
    en: "renovation-marbella",
    ru: "renovaciya-marbelya",
  },
};

/**
 * Retired Marbella commercial URLs consolidated into
 * `construction-company-marbella`. Kept here as documentation for redirects.
 */
export const retiredMarbellaLandingRedirects: Array<{
  sourceByLocale: Record<Locale, string>;
  targetKey: LandingKey;
}> = [
  {
    sourceByLocale: {
      es: "construccion-villas-marbella",
      en: "villa-construction-marbella",
      ru: "stroitelstvo-vill-v-marbele",
    },
    targetKey: "construction-company-marbella",
  },
  {
    sourceByLocale: {
      es: "constructora-marbella",
      en: "general-contractor-marbella",
      ru: "generalnyy-podryadchik-marbelya",
    },
    targetKey: "construction-company-marbella",
  },
];

/** Reverse lookup: which landing page does a localized slug belong to? */
export function getLandingKeyBySlug(
  locale: Locale,
  slug: string,
): LandingKey | null {
  for (const key of landingKeys) {
    if (landingSlugs[key][locale] === slug) {
      return key;
    }
  }
  return null;
}

/** Localized path (no locale prefix) for a landing page. */
export function getLandingPath(key: LandingKey, locale: Locale): string {
  return `/${landingSlugs[key][locale]}`;
}

/**
 * Canonical locale-switching resolver for landing pages.
 */
export function getLocalizedLandingSlug(
  currentLocale: Locale,
  currentSlug: string,
  nextLocale: Locale,
): string | null {
  const key = getLandingKeyBySlug(currentLocale, currentSlug);
  if (!key) {
    return null;
  }
  return landingSlugs[key][nextLocale];
}

/** Localized slug map across all locales (for hreflang / alternates). */
export function getLandingSlugByLocale(key: LandingKey): Record<Locale, string> {
  return landingSlugs[key];
}

export const landingLocales: Locale[] = [...routing.locales];

/**
 * Semantic cluster: which sibling landing pages each page links to.
 */
export const landingLinks: Record<LandingKey, LandingKey[]> = {
  "arquitecto-marbella": [
    "construction-company-marbella",
    "obra-nueva-marbella",
    "builders-costa-del-sol",
  ],
  "builders-costa-del-sol": [
    "construction-company-marbella",
    "arquitecto-marbella",
    "obra-nueva-marbella",
  ],
  "construction-company-marbella": [
    "builders-costa-del-sol",
    "arquitecto-marbella",
    "project-management-marbella",
  ],
  "project-management-marbella": [
    "construction-company-marbella",
    "renovation-marbella",
    "builders-costa-del-sol",
  ],
  "obra-nueva-marbella": [
    "construction-company-marbella",
    "arquitecto-marbella",
    "renovation-marbella",
  ],
  "renovation-marbella": [
    "construction-company-marbella",
    "obra-nueva-marbella",
    "project-management-marbella",
  ],
};

/** Hero background per page. */
export const landingBackgrounds: Record<LandingKey, string> = {
  "arquitecto-marbella": backgrounds.services.arquitectura,
  "builders-costa-del-sol": backgrounds.investors,
  "construction-company-marbella": backgrounds.services.ingenieria,
  "project-management-marbella": backgrounds.services.gestionAdministrativa,
  "obra-nueva-marbella": backgrounds.services.estructura,
  "renovation-marbella": backgrounds.services.carpinteria,
};

/** Geo + areaServed for page-level schema areaServed. */
export const landingGeo: Record<
  LandingKey,
  { lat: number; lng: number; region: string; areaServed: string }
> = {
  "arquitecto-marbella": { ...zoneGeo.marbella, areaServed: "Marbella" },
  "builders-costa-del-sol": {
    ...zoneGeo["costa-del-sol"],
    areaServed: "Costa del Sol",
  },
  "construction-company-marbella": { ...zoneGeo.marbella, areaServed: "Marbella" },
  "project-management-marbella": { ...zoneGeo.marbella, areaServed: "Marbella" },
  "obra-nueva-marbella": { ...zoneGeo.marbella, areaServed: "Marbella" },
  "renovation-marbella": { ...zoneGeo.marbella, areaServed: "Marbella" },
};

/**
 * Import-time integrity assertion (runs at build and on every server start).
 */
function assertLandingSlugIntegrity(): void {
  const seenPerLocale = new Map<string, LandingKey>();

  for (const key of landingKeys) {
    for (const locale of routing.locales) {
      const slug = landingSlugs[key]?.[locale];

      if (!slug) {
        throw new Error(
          `[landings] Missing slug for "${key}" in locale "${locale}".`,
        );
      }

      const seenKey = `${locale}:${slug}`;
      const collision = seenPerLocale.get(seenKey);
      if (collision && collision !== key) {
        throw new Error(
          `[landings] Duplicate slug "${slug}" in locale "${locale}" used by ` +
            `both "${collision}" and "${key}".`,
        );
      }
      seenPerLocale.set(seenKey, key);

      if (getLandingKeyBySlug(locale, slug) !== key) {
        throw new Error(
          `[landings] Slug "${slug}" (${locale}) does not resolve back to "${key}".`,
        );
      }

      for (const nextLocale of routing.locales) {
        const switched = getLocalizedLandingSlug(locale, slug, nextLocale);
        if (switched !== landingSlugs[key][nextLocale]) {
          throw new Error(
            `[landings] Locale switch ${locale} -> ${nextLocale} for "${key}" ` +
              `resolved to "${switched}" instead of ` +
              `"${landingSlugs[key][nextLocale]}".`,
          );
        }
      }
    }
  }
}

assertLandingSlugIntegrity();
