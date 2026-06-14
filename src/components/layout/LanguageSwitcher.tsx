"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
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
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (nextLocale: Locale) => {
    router.replace(pathname, { locale: nextLocale });
    onLocaleChange?.();
  };

  if (variant === "mobile") {
    return (
      <div className="w-full px-4">
        <div
          className="flex min-h-11 w-full items-center justify-center gap-8 border-t border-white/10 pt-3"
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
