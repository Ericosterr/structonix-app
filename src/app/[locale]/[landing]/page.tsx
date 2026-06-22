import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getLandingKeyBySlug, landingKeys, landingSlugs } from "@data/landings";
import { generateLandingMetadata } from "@/lib/page-metadata";
import type { Locale } from "@/i18n/routing";
import { LandingPageContent } from "@/components/sections/LandingPageContent";

export const dynamicParams = false;

type LandingPageProps = {
  params: Promise<{ locale: Locale; landing: string }>;
};

export function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as Locale;
  return landingKeys.map((key) => ({ landing: landingSlugs[key][locale] }));
}

export async function generateMetadata({
  params,
}: LandingPageProps): Promise<Metadata> {
  const { locale, landing } = await params;
  const key = getLandingKeyBySlug(locale, landing);
  if (!key) return {};
  return generateLandingMetadata(locale, key);
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale, landing } = await params;
  setRequestLocale(locale);

  const key = getLandingKeyBySlug(locale, landing);
  if (!key) {
    notFound();
  }

  return <LandingPageContent landingKey={key} locale={locale} />;
}
