import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
  getServiceKeyByPublicSlug,
  getServicePublicSlug,
  serviceSlugs,
  type ServiceSlug,
} from "@config/navigation";
import { generateServiceMetadata } from "@/lib/page-metadata";
import { routing, type Locale } from "@/i18n/routing";
import { ServicePageContent } from "@/components/sections/ServicePageContent";

export const dynamicParams = false;

type ServicePageProps = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as Locale;
  return serviceSlugs.map((key) => ({
    slug: getServicePublicSlug(key, locale),
  }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const key = getServiceKeyByPublicSlug(locale, slug);
  if (!key) return {};
  return generateServiceMetadata(locale, key);
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const key = getServiceKeyByPublicSlug(locale, slug);
  if (!key) {
    notFound();
  }

  return <ServicePageContent slug={key as ServiceSlug} />;
}
