import type { Locale } from "@/i18n/routing";

export type ServiceSlug =
  | "estructura"
  | "ingenieria"
  | "arquitectura"
  | "acabados"
  | "carpinteria"
  | "gestion-administrativa";

export type NavItem = {
  key: string;
  href: string;
  external?: boolean;
};

export const serviceSlugs: ServiceSlug[] = [
  "estructura",
  "ingenieria",
  "arquitectura",
  "acabados",
  "carpinteria",
  "gestion-administrativa",
];

/**
 * Public URL slug per locale for each service.
 * Internal `ServiceSlug` keys stay stable for translations, galleries and data.
 */
export const servicePublicSlugs: Record<ServiceSlug, Record<Locale, string>> = {
  estructura: {
    es: "estructura",
    en: "estructura",
    ru: "estructura",
  },
  ingenieria: {
    es: "ingenieria",
    en: "ingenieria",
    ru: "ingenieria",
  },
  arquitectura: {
    es: "arquitectura",
    en: "arquitectura",
    ru: "arquitectura",
  },
  acabados: {
    es: "acabados",
    en: "acabados",
    ru: "acabados",
  },
  carpinteria: {
    es: "instalacion-de-ventanas",
    en: "window-installation",
    ru: "montazh-okon",
  },
  "gestion-administrativa": {
    es: "gestion-administrativa",
    en: "gestion-administrativa",
    ru: "gestion-administrativa",
  },
};

/** Retired public slugs that must 308 to the localized servicePublicSlugs entry. */
export const retiredServiceRedirects: Array<{
  serviceKey: ServiceSlug;
  sourceByLocale: Partial<Record<Locale, string>>;
}> = [
  {
    serviceKey: "carpinteria",
    sourceByLocale: {
      es: "carpinteria",
      en: "carpinteria",
      ru: "carpinteria",
    },
  },
];

export function getServicePublicSlug(key: ServiceSlug, locale: Locale): string {
  return servicePublicSlugs[key][locale];
}

/** Locale-relative path (no locale prefix), e.g. `/servicios/window-installation`. */
export function getServicePath(key: ServiceSlug, locale: Locale): string {
  return `/servicios/${getServicePublicSlug(key, locale)}`;
}

export function getServiceKeyByPublicSlug(
  locale: Locale,
  publicSlug: string,
): ServiceSlug | null {
  for (const key of serviceSlugs) {
    if (servicePublicSlugs[key][locale] === publicSlug) {
      return key;
    }
  }
  return null;
}

export const mainNavItems: NavItem[] = [
  { key: "about", href: "/quienes-somos" },
  { key: "careers", href: "/carrera" },
  { key: "investors", href: "/para-inversores" },
  { key: "blog", href: "/blog" },
];

/** Service nav keys; resolve `href` with `getServicePath(key, locale)`. */
export const serviceNavItems: Array<{ key: ServiceSlug }> = serviceSlugs.map(
  (slug) => ({ key: slug }),
);

export const footerSocialItems = [
  { key: "instagram", href: "instagram", external: true },
  { key: "youtube", href: "youtube", external: true },
] as const;

/** Home hero shortcuts and services grid (Phase 3 design revision). */
export const homeFeaturedServices: ServiceSlug[] = [
  "estructura",
  "ingenieria",
  "acabados",
  "arquitectura",
  "carpinteria",
  "gestion-administrativa",
];

/** Service pages with redesigned hero + gallery carousel. */
export const redesignedServiceSlugs: ServiceSlug[] = [
  "estructura",
  "ingenieria",
  "arquitectura",
  "acabados",
  "carpinteria",
  "gestion-administrativa",
];
