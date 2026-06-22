"use client";

import { usePathname as useFullPathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getPathname, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { syncLocaleCookie } from "@/lib/sync-locale-cookie";
import { getLocalizedLandingSlug } from "@data/landings";
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

  /**
   * Resolve the destination path for a locale switch. One canonical resolution
   * order, no hardcoded slug replacements:
   *  1. Landing pages -> central slug map in `data/landings.ts`.
   *  2. Blog posts -> per-locale slug from the page's own hreflang alternate
   *     (falls back to the blog index so a missing translation never 404s).
   *  3. Everything else -> slug-stable, just swap the locale prefix.
   */
  const resolveLocaleHref = (nextLocale: Locale): string => {
    const currentSlug = pathname.replace(/^\//, "");

    const mappedLandingSlug = getLocalizedLandingSlug(
      locale,
      currentSlug,
      nextLocale,
    );
    if (mappedLandingSlug) {
      return getPathname({ href: `/${mappedLandingSlug}`, locale: nextLocale });
    }

    if (pathname.startsWith("/blog/")) {
      const alternate = getHreflangPath(nextLocale);
      return (
        alternate ?? getPathname({ href: "/blog", locale: nextLocale })
      );
    }

    return getPathname({ href: pathname, locale: nextLocale });
  };

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      onLocaleChange?.();
      return;
    }

    // Hard navigation guarantees a full HTML document response.
    // router.replace() uses RSC flight fetches that break on CDN/mobile production.
    // Sync NEXT_LOCALE first so unprefixed ES URLs are not redirected by middleware.
    syncLocaleCookie(fullPathname, locale, nextLocale);
    window.location.assign(resolveLocaleHref(nextLocale));
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
          <button
            key={nextLocale}
            type="button"
            onClick={() => switchLocale(nextLocale)}
            className={cn(
              "min-h-11 px-2 text-sm font-medium text-white transition-opacity hover:opacity-80",
              locale === nextLocale && "font-semibold underline underline-offset-4",
            )}
          >
            {localeLabels[nextLocale]}
          </button>
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
          <DropdownMenuItem
            key={nextLocale}
            onClick={() => switchLocale(nextLocale)}
          >
            {localeLabels[nextLocale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
