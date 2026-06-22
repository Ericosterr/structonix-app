import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildLocalizedSlugMetadata, buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import type { ServiceSlug } from "@config/navigation";
import {
  getLandingSlugByLocale,
  type LandingKey,
} from "@data/landings";

type MetadataParams = {
  locale: Locale;
  path: string;
  namespace: string;
};

export async function generatePageMetadata({
  locale,
  path,
  namespace,
}: MetadataParams): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace });

  return buildPageMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    path,
  });
}

export async function generateServiceMetadata(
  locale: Locale,
  slug: ServiceSlug,
): Promise<Metadata> {
  return generatePageMetadata({
    locale,
    path: `/servicios/${slug}`,
    namespace: `seo.services.${slug}`,
  });
}

export async function generateLandingMetadata(
  locale: Locale,
  key: LandingKey,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `seo.landings.${key}` });

  return buildLocalizedSlugMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    slugByLocale: getLandingSlugByLocale(key),
  });
}
