import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { backgrounds } from "@data/backgrounds";
import { generatePageMetadata } from "@/lib/page-metadata";
import type { Locale } from "@/i18n/routing";
import { Hero } from "@/components/sections/Hero";
import { AboutContentSections } from "@/components/sections/AboutContentSections";
import { TeamCardsSection } from "@/components/sections/TeamCardsSection";
import { SectionHeading } from "@/components/ui/SectionHeading";

type AboutPageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata({
    locale,
    path: "/quienes-somos",
    namespace: "seo.about",
  });
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");

  return (
    <>
      <Hero backgroundImage={backgrounds.about} size="tall">
        <SectionHeading
          title={tNav("about")}
          className="text-primary-foreground"
        />
      </Hero>

      <AboutContentSections />

      <TeamCardsSection />
    </>
  );
}
