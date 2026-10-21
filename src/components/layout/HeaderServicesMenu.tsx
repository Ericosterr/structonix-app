"use client";

import { useLocale, useTranslations } from "next-intl";
import { getServicePath, serviceNavItems } from "@config/navigation";
import type { Locale } from "@/i18n/routing";
import { HeaderDropdownMenu } from "@/components/layout/HeaderDropdownMenu";

type HeaderServicesMenuProps = {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function HeaderServicesMenu({ variant, onNavigate }: HeaderServicesMenuProps) {
  const locale = useLocale() as Locale;
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  const items = serviceNavItems.map((item) => ({
    key: item.key,
    href: getServicePath(item.key, locale),
    label: tNav(item.key),
  }));

  return (
    <HeaderDropdownMenu
      variant={variant}
      triggerLabel={tCommon("services")}
      items={items}
      onNavigate={onNavigate}
    />
  );
}
