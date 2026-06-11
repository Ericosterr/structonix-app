import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { backgrounds } from "@data/backgrounds";
import { generatePageMetadata } from "@/lib/page-metadata";
import type { Locale } from "@/i18n/routing";
import { HomeHero } from "@/components/sections/HomeHero";
import { ContactSection } from "@/components/sections/ContactSection";

type HomePageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata({
    locale,
    path: "/",
    namespace: "seo.home",
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HomeHero />
      <ContactSection backgroundImage={backgrounds.home.contact} />
    </>
  );
}
