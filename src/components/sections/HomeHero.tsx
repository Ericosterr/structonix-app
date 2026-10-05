"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { homeFeaturedServices } from "@config/navigation";
import { backgrounds } from "@data/backgrounds";
import { getLandingPath } from "@data/landings";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Hero } from "@/components/sections/Hero";
import { HomeHeroBranding } from "@/components/sections/HomeHeroBranding";
import { ServiceShortcutButton } from "@/components/ui/ServiceShortcutButton";
import { slideUp } from "@/lib/animations";
import type { GalleryKey } from "@data/galleries";

export function HomeHero() {
  const t = useTranslations("home");
  const tNav = useTranslations("nav");
  const locale = useLocale() as Locale;
  const marbellaHref = getLandingPath("construction-company-marbella", locale);
  const costaHref = getLandingPath("builders-costa-del-sol", locale);

  return (
    <Hero backgroundImage={backgrounds.home.hero} size="screen">
      <div className="flex flex-col justify-center gap-8 lg:gap-10">
        <div className="space-y-6">
          <HomeHeroBranding />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-3xl text-base font-medium leading-relaxed md:text-lg lg:text-xl"
          >
            {t("slogan")}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex max-w-3xl flex-wrap gap-x-4 gap-y-2 text-sm text-white/90 md:text-base"
          >
            <Link href={marbellaHref} className="underline-offset-4 hover:underline">
              {t("linkMarbella")}
            </Link>
            <Link href={costaHref} className="underline-offset-4 hover:underline">
              {t("linkCosta")}
            </Link>
            <Link href="/zonas/marbella" className="underline-offset-4 hover:underline">
              {t("linkMarbellaAreas")}
            </Link>
          </motion.p>
        </div>

        <motion.div
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 lg:gap-4"
        >
          {homeFeaturedServices.map((slug) => (
            <ServiceShortcutButton
              key={slug}
              href={`/servicios/${slug}`}
              label={tNav(slug)}
              service={
                slug === "gestion-administrativa"
                  ? "gestion-administrativa"
                  : (slug as GalleryKey)
              }
            />
          ))}
        </motion.div>
      </div>
    </Hero>
  );
}
