"use client";

import type { MouseEvent } from "react";
import { usePathname as useFullPathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { syncLocaleCookie } from "@/lib/sync-locale-cookie";
import { getLocalizedLandingSlug } from "@data/landings";
import {
  resolveServiceLocaleHref,
  stripLocalePrefix,
  toPublicLocalePath,
} from "@config/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { mobileNavItemClass } from "@/components/layout/mobile-nav";

const localeLabels: Record<Locale, string> = {
  es: "ES",
  en: "EN",
  ru: "RU",
};

/**
 * Same-origin path of the page's own hreflang alternate for a locale.
 *
 * Blog posts use per-locale Notion slugs (one row per locale), so their
 * locale-specific URL only lives in the page's `<link rel="alternate">` tags,
 * which are generated from the same translation data as hreflang/sitemap.
 * We read the path (never the absolute href) so dev/staging origins are kept.
 */
function getHreflangPath(locale: Locale): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const link = document.querySelector<HTMLLinkElement>(
    `link[rel="alternate"][hreflang="${locale}"]`,
  );

  if (!link) {
    return null;
  }

  try {
    const url = new URL(link.href, window.location.origin);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

/**
 * Final public browser pathname for a locale switch.
 * Must not be passed through next-intl Link/getPathname again.
 */
export function resolveLocaleHref(
  pathname: string,
  currentLocale: Locale,
  nextLocale: Locale,
): string {
  const neutralPath = stripLocalePrefix(pathname);
  const currentSlug = neutralPath.replace(/^\//, "");

  const mappedLandingSlug = getLocalizedLandingSlug(
    currentLocale,
    currentSlug,
    nextLocale,
  );
  if (mappedLandingSlug) {
    return toPublicLocalePath(`/${mappedLandingSlug}`, nextLocale);
  }

  const mappedServiceHref = resolveServiceLocaleHref(neutralPath, nextLocale);
  if (mappedServiceHref) {
    return mappedServiceHref;
  }

  if (neutralPath.startsWith("/blog/")) {
    const alternate = getHreflangPath(nextLocale);
    return alternate ?? toPublicLocalePath("/blog", nextLocale);
  }

  return toPublicLocalePath(neutralPath, nextLocale);
}

type LanguageSwitcherProps = {
  variant: "desktop" | "mobile";
  onLocaleChange?: () => void;
};

export function LanguageSwitcher({
  variant,
  onLocaleChange,
}: LanguageSwitcherProps) {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const fullPathname = useFullPathname();

  // Prefer next-intl's locale-neutral pathname; fall back to the browser path.
  const pathForResolve =
    pathname.startsWith("/servicios/") || pathname.length > 1
      ? pathname
      : fullPathname;

  const hrefFor = (nextLocale: Locale) =>
    resolveLocaleHref(pathForResolve, locale, nextLocale);

  const onLocaleClick = (
    event: MouseEvent<HTMLAnchorElement>,
    nextLocale: Locale,
  ) => {
    if (nextLocale === locale) {
      event.preventDefault();
      onLocaleChange?.();
      return;
    }

    // Sync NEXT_LOCALE before navigation so unprefixed ES URLs resolve correctly.
    syncLocaleCookie(fullPathname, locale, nextLocale);
    onLocaleChange?.();
    // Navigate via the anchor href (final public path). Do not re-localize.
  };

  if (variant === "mobile") {
    return (
      <div
        className={cn(
          mobileNavItemClass,
          "justify-center gap-8 border-t border-white/10",
        )}
        role="group"
        aria-label={t("language")}
      >
        {routing.locales.map((nextLocale) => (
          <a
            key={nextLocale}
            href={hrefFor(nextLocale)}
            hrefLang={nextLocale}
            onClick={(event) => onLocaleClick(event, nextLocale)}
            className={cn(
              "min-h-11 px-2 text-sm font-medium text-white transition-opacity hover:opacity-80",
              locale === nextLocale && "font-semibold underline underline-offset-4",
            )}
          >
            {localeLabels[nextLocale]}
          </a>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label={t("language")}>
          <Globe className="h-4 w-4" />
          {localeLabels[locale]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((nextLocale) => (
          <DropdownMenuItem key={nextLocale} asChild>
            <a
              href={hrefFor(nextLocale)}
              hrefLang={nextLocale}
              onClick={(event) => onLocaleClick(event, nextLocale)}
            >
              {localeLabels[nextLocale]}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
