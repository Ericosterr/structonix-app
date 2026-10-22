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

/**
 * Resolve a public service slug to its internal key by scanning every locale.
 * Needed for language switching: next-intl `usePathname()` is locale-stripped
 * (`/servicios/montazh-okon`), so the slug must be recognized regardless of
 * which locale originally produced it.
 */
export function getServiceKeyByAnyPublicSlug(
  publicSlug: string,
): ServiceSlug | null {
  for (const key of serviceSlugs) {
    const byLocale = servicePublicSlugs[key];
    for (const locale of Object.keys(byLocale) as Locale[]) {
      if (byLocale[locale] === publicSlug) {
        return key;
      }
    }
  }
  return null;
}

/**
 * Strip an optional `/en` or `/ru` prefix. next-intl `usePathname()` is usually
 * already locale-neutral, but language switching must stay correct if a full
 * browser pathname is passed instead.
 */
export function stripLocalePrefix(pathname: string): string {
  const stripped = pathname.replace(/^\/(en|ru)(?=\/|$)/, "");
  return stripped === "" ? "/" : stripped;
}

/** Final public browser pathname for `localePrefix: "as-needed"`. */
export function toPublicLocalePath(path: string, locale: Locale): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === "es") {
    return normalized;
  }
  return `/${locale}${normalized}`;
}

/**
 * Locale-relative service path for `nextLocale`, or null if not a service page.
 * Accepts locale-neutral or prefixed pathnames.
 */
export function getLocalizedServicePath(
  pathname: string,
  nextLocale: Locale,
): string | null {
  const match = stripLocalePrefix(pathname).match(/^\/servicios\/([^/]+)\/?$/);
  if (!match) {
    return null;
  }

  const key = getServiceKeyByAnyPublicSlug(match[1]);
  if (!key) {
    return null;
  }

  return getServicePath(key, nextLocale);
}

/**
 * Final public browser href for switching locale on a service page.
 * Example: `/servicios/instalacion-de-ventanas` + `ru` → `/ru/servicios/montazh-okon`.
 */
export function resolveServiceLocaleHref(
  pathname: string,
  nextLocale: Locale,
): string | null {
  const localized = getLocalizedServicePath(pathname, nextLocale);
  if (!localized) {
    return null;
  }
  return toPublicLocalePath(localized, nextLocale);
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
