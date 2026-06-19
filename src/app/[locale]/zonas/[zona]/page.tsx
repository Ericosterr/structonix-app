import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { zoneSlugs, type ZoneSlug } from "@data/zones";
import { generatePageMetadata } from "@/lib/page-metadata";
import type { Locale } from "@/i18n/routing";
import { ZonePageContent } from "@/components/sections/ZonePageContent";

type ZonePageProps = {
  params: Promise<{ locale: Locale; zona: string }>;
};

function isZoneSlug(zona: string): zona is ZoneSlug {
  return (zoneSlugs as readonly string[]).includes(zona);
}

export function generateStaticParams() {
  return zoneSlugs.map((zona) => ({ zona }));
}

export async function generateMetadata({
  params,
}: ZonePageProps): Promise<Metadata> {
  const { locale, zona } = await params;
  if (!isZoneSlug(zona)) return {};
  return generatePageMetadata({
    locale,
    path: `/zonas/${zona}`,
    namespace: `seo.zones.${zona}`,
  });
}

export default async function ZonePage({ params }: ZonePageProps) {
  const { locale, zona } = await params;
  setRequestLocale(locale);

  if (!isZoneSlug(zona)) {
    notFound();
  }

  return <ZonePageContent zona={zona} locale={locale} />;
}
