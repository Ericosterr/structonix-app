import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
  serviceLocationSlugs,
  type ServiceLocationSlug,
} from "@data/service-locations";
import { generatePageMetadata } from "@/lib/page-metadata";
import type { Locale } from "@/i18n/routing";
import { ServiceLocationContent } from "@/components/sections/ServiceLocationContent";

type ServiceLocationPageProps = {
  params: Promise<{ locale: Locale; service: string }>;
};

function isServiceLocationSlug(service: string): service is ServiceLocationSlug {
  return (serviceLocationSlugs as readonly string[]).includes(service);
}

export function generateStaticParams() {
  return serviceLocationSlugs.map((service) => ({ service }));
}

export async function generateMetadata({
  params,
}: ServiceLocationPageProps): Promise<Metadata> {
  const { locale, service } = await params;
  if (!isServiceLocationSlug(service)) return {};
  return generatePageMetadata({
    locale,
    path: `/services/${service}`,
    namespace: `seo.serviceLocations.${service}`,
  });
}

export default async function ServiceLocationPage({
  params,
}: ServiceLocationPageProps) {
  const { locale, service } = await params;
  setRequestLocale(locale);

  if (!isServiceLocationSlug(service)) {
    notFound();
  }

  return <ServiceLocationContent service={service} locale={locale} />;
}
