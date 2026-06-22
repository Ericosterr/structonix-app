import { backgrounds } from "./backgrounds";
import { zoneGeo } from "./zones";
import { routing, type Locale } from "@/i18n/routing";

export const landingKeys = [
  "constructora-marbella",
  "arquitecto-marbella",
  "villa-construction-marbella",
  "builders-costa-del-sol",
  "construction-company-marbella",
  "project-management-marbella",
  "obra-nueva-marbella",
  "renovation-marbella",
] as const;

export type LandingKey = (typeof landingKeys)[number];

/**
 * Localized slug per locale. This is the single source of truth for the
 * Marbella construction SEO cluster: routing, hreflang, canonical and sitemap
 * are all derived from here.
 *
 * Note: the brief assigned the same EN/RU slug to both "Constructora Marbella"
 * and "Construction Company Marbella". Two pages cannot share a URL, so
 * "constructora-marbella" uses the distinct "general-contractor" slug in EN/RU
 * while "construction-company-marbella" keeps the requested slugs.
 */
export const landingSlugs: Record<LandingKey, Record<Locale, string>> = {
  "constructora-marbella": {
    es: "constructora-marbella",
    en: "general-contractor-marbella",
    ru: "generalnyy-podryadchik-marbelya",
  },
  "arquitecto-marbella": {
    es: "arquitecto-marbella",
    en: "architect-marbella",
    ru: "arhitektor-marbelya",
  },
  "villa-construction-marbella": {
    es: "construccion-villas-marbella",
    en: "villa-construction-marbella",
    ru: "stroitelstvo-vill-v-marbele",
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
 *
 * Given the current locale and its localized slug, returns the equivalent
 * localized slug in the target locale — always through the central slug map.
 * Returns `null` when the slug is not a landing page (so callers can fall back
 * to default next-intl locale switching for every other route).
 *
 * This is the single source of truth used by the language switcher; never
 * hardcode per-locale slug replacements anywhere else.
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
 * Builds a topical-authority interlinking structure.
 */
export const landingLinks: Record<LandingKey, LandingKey[]> = {
  "constructora-marbella": [
    "arquitecto-marbella",
    "project-management-marbella",
    "villa-construction-marbella",
  ],
  "arquitecto-marbella": [
    "constructora-marbella",
    "obra-nueva-marbella",
    "villa-construction-marbella",
  ],
  "villa-construction-marbella": [
    "builders-costa-del-sol",
    "arquitecto-marbella",
    "obra-nueva-marbella",
  ],
  "builders-costa-del-sol": [
    "villa-construction-marbella",
    "construction-company-marbella",
    "constructora-marbella",
  ],
  "construction-company-marbella": [
    "constructora-marbella",
    "project-management-marbella",
    "builders-costa-del-sol",
  ],
  "project-management-marbella": [
    "construction-company-marbella",
    "constructora-marbella",
    "renovation-marbella",
  ],
  "obra-nueva-marbella": [
    "arquitecto-marbella",
    "villa-construction-marbella",
    "renovation-marbella",
  ],
  "renovation-marbella": [
    "obra-nueva-marbella",
    "project-management-marbella",
    "arquitecto-marbella",
  ],
};

/** Hero background per page. Replace with real Marbella photography for stronger EEAT. */
export const landingBackgrounds: Record<LandingKey, string> = {
  "constructora-marbella": backgrounds.services.estructura,
  "arquitecto-marbella": backgrounds.services.arquitectura,
  "villa-construction-marbella": backgrounds.services.acabados,
  "builders-costa-del-sol": backgrounds.investors,
  "construction-company-marbella": backgrounds.services.ingenieria,
  "project-management-marbella": backgrounds.services.gestionAdministrativa,
  "obra-nueva-marbella": backgrounds.services.estructura,
  "renovation-marbella": backgrounds.services.carpinteria,
};

/** Geo + areaServed for LocalBusiness / GeneralContractor schema. */
export const landingGeo: Record<
  LandingKey,
  { lat: number; lng: number; region: string; areaServed: string }
> = {
  "constructora-marbella": { ...zoneGeo.marbella, areaServed: "Marbella" },
  "arquitecto-marbella": { ...zoneGeo.marbella, areaServed: "Marbella" },
  "villa-construction-marbella": { ...zoneGeo.marbella, areaServed: "Marbella" },
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
 *
 * Guarantees the slug map is the single, consistent source of truth so locale
 * switching can never silently regress into a 404:
 *  - every landing key defines a slug for every locale
 *  - no two pages share a slug within the same locale (would break routing)
 *  - each slug resolves back to its own key (reverse lookup round-trip)
 *  - cross-locale switching always resolves through the central map, i.e.
 *    es-slug -> en-slug -> ru-slug -> es-slug returns to the original
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
