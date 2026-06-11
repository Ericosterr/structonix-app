import { routing, type Locale } from "@/i18n/routing";

/** Path segment for a locale (empty for default locale with as-needed prefix). */
export function getLocalizedPath(locale: Locale, path: string): string {
  if (locale === routing.defaultLocale) {
    return path === "/" ? "" : path;
  }
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Absolute URL for a locale-specific page. */
export function getLocalizedUrl(baseUrl: string, locale: Locale, path: string): string {
  return `${baseUrl}${getLocalizedPath(locale, path)}`;
}
