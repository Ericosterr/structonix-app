"use client";

import { useLocale, useTranslations } from "next-intl";
import { getPathname, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
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

type LanguageSwitcherProps = {
  variant?: "desktop" | "mobile";
  onLocaleChange?: () => void;
};

export function LanguageSwitcher({
  variant = "desktop",
  onLocaleChange,
}: LanguageSwitcherProps) {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      onLocaleChange?.();
      return;
    }

    // Hard navigation guarantees a full HTML document response.
    // router.replace() uses RSC flight fetches that break on CDN/mobile production.
    const href = getPathname({ href: pathname, locale: nextLocale });
    window.location.assign(href);
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
