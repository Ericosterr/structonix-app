"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { company } from "@config/company";
import { mainNavItems } from "@config/navigation";
import { site } from "@config/site";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { HeaderServicesMenu } from "@/components/layout/HeaderServicesMenu";
import { mobileNavItemClass } from "@/components/layout/mobile-nav";

type MobileNavMenuProps = {
  onNavigate: () => void;
};

export function MobileNavMenu({ onNavigate }: MobileNavMenuProps) {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  return (
    <nav className="flex w-full flex-col pb-6 pt-14">
      {mainNavItems.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={mobileNavItemClass}
          onClick={onNavigate}
        >
          {tNav(item.key)}
        </Link>
      ))}
      <HeaderServicesMenu variant="mobile" onNavigate={onNavigate} />
      <Link href="/calculador" className={mobileNavItemClass} onClick={onNavigate}>
        {tCommon("calculator")}
      </Link>
      {company.whatsapp ? (
        <a
          href={company.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={`${mobileNavItemClass} gap-2`}
          onClick={onNavigate}
        >
          <Image
            src={site.assets.whatsappIcon}
            alt=""
            width={20}
            height={20}
            aria-hidden="true"
            className="shrink-0"
          />
          {tCommon("whatsapp")}
        </a>
      ) : null}
      <LanguageSwitcher variant="mobile" onLocaleChange={onNavigate} />
    </nav>
  );
}
