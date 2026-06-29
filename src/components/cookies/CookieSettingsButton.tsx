"use client";

import { useTranslations } from "next-intl";
import { openCookieSettings } from "@/lib/consent-mode";

type CookieSettingsButtonProps = {
  className?: string;
};

export function CookieSettingsButton({ className }: CookieSettingsButtonProps) {
  const t = useTranslations("cookies");

  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className={className}
    >
      {t("changeCookieSettings")}
    </button>
  );
}
