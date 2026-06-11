import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { serviceSlugs, type ServiceSlug } from "@config/navigation";
import { generateServiceMetadata } from "@/lib/page-metadata";
import type { Locale } from "@/i18n/routing";
import { ServicePageContent } from "@/components/sections/ServicePageContent";

type ServicePageProps = {
  params: Promise<{ locale: Locale; slug: string }>;
};

function isServiceSlug(slug: string): slug is ServiceSlug {
  return (serviceSlugs as readonly string[]).includes(slug);
}

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isServiceSlug(slug)) return {};
  return generateServiceMetadata(locale, slug);
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (!isServiceSlug(slug)) {
    notFound();
  }

  return <ServicePageContent slug={slug} />;
}
