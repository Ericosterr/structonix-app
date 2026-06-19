"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { InstagramIcon, YoutubeIcon } from "@/components/ui/social-icons";
import { company } from "@config/company";
import { mainNavItems } from "@config/navigation";
import { site } from "@config/site";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { HeaderAreasMenu } from "@/components/layout/HeaderAreasMenu";
import { HeaderServicesMenu } from "@/components/layout/HeaderServicesMenu";
import { MobileNavMenu } from "@/components/layout/MobileNavMenu";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-primary">
      <Container className="flex h-[4.5rem] items-center justify-between gap-4 lg:h-20">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src={site.assets.logoWhite}
              alt={company.companyName}
              width={220}
              height={56}
              className="h-11 w-auto sm:h-12 lg:h-14"
              priority
            />
          </Link>
          <nav className="hidden items-center gap-5 lg:flex">
            {mainNavItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="text-sm font-medium text-white transition-opacity hover:opacity-80"
              >
                {tNav(item.key)}
              </Link>
            ))}
            <HeaderAreasMenu variant="desktop" />
            <HeaderServicesMenu variant="desktop" />
          </nav>
        </div>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {company.instagram ? (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-white hover:bg-white/10 hover:text-white"
            >
              <a
                href={company.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <InstagramIcon className="text-white" />
              </a>
            </Button>
          ) : null}
          {company.youtube ? (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-white hover:bg-white/10 hover:text-white"
            >
              <a
                href={company.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <YoutubeIcon className="text-white" />
              </a>
            </Button>
          ) : null}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/calculador">{tCommon("calculator")}</Link>
          </Button>
          {company.whatsapp ? (
            <Button
              asChild
              size="sm"
              className="bg-white text-primary hover:bg-white/90"
            >
              <a href={company.whatsapp} target="_blank" rel="noopener noreferrer">
                {tCommon("whatsapp")}
              </a>
            </Button>
          ) : null}
          <LanguageSwitcher variant="desktop" />
        </div>

        <div className="flex shrink-0 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
                aria-label={tCommon("openMenu")}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full max-w-[min(100vw,430px)] flex-col gap-0 overflow-x-hidden overflow-y-auto border-white/10 !bg-primary p-0 text-white shadow-none">
              <MobileNavMenu onNavigate={closeMobileMenu} />
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
