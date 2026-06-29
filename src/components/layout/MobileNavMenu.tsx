"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { company } from "@config/company";
import { mainNavItems } from "@config/navigation";
import { site } from "@config/site";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { InstagramIcon, YoutubeIcon } from "@/components/ui/social-icons";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { HeaderAreasMenu } from "@/components/layout/HeaderAreasMenu";
import { HeaderServicesMenu } from "@/components/layout/HeaderServicesMenu";
import { mobileNavItemClass } from "@/components/layout/mobile-nav";
import {
  GOOGLE_ADS_CONVERSIONS,
  trackGoogleAdsConversion,
} from "@/lib/google-ads";
import { SheetDescription, SheetTitle } from "@/components/ui/sheet";

type MobileNavMenuProps = {
  onNavigate: () => void;
};

export function MobileNavMenu({ onNavigate }: MobileNavMenuProps) {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tFooter = useTranslations("footer");

  return (
    <nav className="flex w-full flex-col pb-6 pt-14">
      <VisuallyHidden.Root asChild>
        <SheetTitle>{tCommon("menuTitle")}</SheetTitle>
      </VisuallyHidden.Root>
      <VisuallyHidden.Root asChild>
        <SheetDescription>{tCommon("menuDescription")}</SheetDescription>
      </VisuallyHidden.Root>
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
      <HeaderAreasMenu variant="mobile" onNavigate={onNavigate} />
      <HeaderServicesMenu variant="mobile" onNavigate={onNavigate} />
      <Link href="/calculador" className={mobileNavItemClass} onClick={onNavigate}>
        {tCommon("calculator")}
      </Link>

      <div className="mt-2 flex flex-col border-t border-white/10 pt-2">
        {company.instagram ? (
          <a
            href={company.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(mobileNavItemClass, "gap-2")}
            onClick={onNavigate}
          >
            <InstagramIcon className="shrink-0 text-white" />
            {tFooter("instagram")}
          </a>
        ) : null}
        {company.whatsapp ? (
          <a
            href={company.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(mobileNavItemClass, "gap-2")}
            onClick={() => {
              trackGoogleAdsConversion(GOOGLE_ADS_CONVERSIONS.whatsappClick);
              onNavigate();
            }}
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
        {company.youtube ? (
          <a
            href={company.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(mobileNavItemClass, "gap-2")}
            onClick={onNavigate}
          >
            <YoutubeIcon className="shrink-0 text-white" />
            {tFooter("youtube")}
          </a>
        ) : null}
      </div>

      <LanguageSwitcher variant="mobile" onLocaleChange={onNavigate} />
    </nav>
  );
}
