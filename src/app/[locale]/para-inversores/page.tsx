import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { backgrounds } from "@data/backgrounds";
import { generatePageMetadata } from "@/lib/page-metadata";
import type { Locale } from "@/i18n/routing";
import { Hero } from "@/components/sections/Hero";
import { InvestorSection } from "@/components/sections/InvestorSection";
import { SectionHeading } from "@/components/ui/SectionHeading";

type InvestorsPageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({
  params,
}: InvestorsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata({
    locale,
    path: "/para-inversores",
    namespace: "seo.investors",
  });
}

export default async function InvestorsPage({ params }: InvestorsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("investors");

  return (
    <>
      <Hero backgroundImage={backgrounds.investors}>
        <SectionHeading
          title={t("title")}
          className="text-primary-foreground"
        />
      </Hero>
      <InvestorSection />
    </>
  );
}
