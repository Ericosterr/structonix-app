"use client";

import { useTranslations } from "next-intl";
import { zoneNavItems } from "@config/navigation";
import { HeaderDropdownMenu } from "@/components/layout/HeaderDropdownMenu";

type HeaderAreasMenuProps = {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function HeaderAreasMenu({ variant, onNavigate }: HeaderAreasMenuProps) {
  const tNav = useTranslations("nav");
  const tZones = useTranslations("zones");

  const items = zoneNavItems.map((item) => ({
    key: item.key,
    href: item.href,
    label: tZones(`${item.key}.name`),
  }));

  return (
    <HeaderDropdownMenu
      variant={variant}
      triggerLabel={tNav("areas")}
      items={items}
      onNavigate={onNavigate}
    />
  );
}
