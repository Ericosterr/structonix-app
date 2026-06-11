import type { Metadata } from "next";
import { company } from "@config/company";
import { site } from "@config/site";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { getLocalizedUrl } from "@/lib/locale-path";

export const siteBrand = {
  title: "STRUCTONIX",
  description: "Construcción • Ingeniería • Inversión",
  siteName: "STRUCTONIX",
  ogLocale: "es_ES",
} as const;

const ogLocaleMap: Record<Locale, string> = {
  es: "es_ES",
  en: "en_US",
  ru: "ru_RU",
};

type PageMetadataInput = {
  locale: Locale;
  title: string;
  description: string;
  path: string;
};

export function getAbsoluteAssetUrl(path: string): string {
  return `${site.baseUrl}${path}`;
}

export function getOgImageUrl(): string {
  return getAbsoluteAssetUrl(site.assets.ogImage);
}

export function buildFaviconIcons(): NonNullable<Metadata["icons"]> {
  return {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  };
}

export function buildOgImages() {
  return [
    {
      url: getOgImageUrl(),
      width: 1200,
      height: 630,
      alt: siteBrand.title,
      type: "image/jpeg",
    },
  ];
}

export function buildRootMetadata(): Metadata {
  const images = buildOgImages();

  return {
    title: siteBrand.title,
    description: siteBrand.description,
    metadataBase: getSiteMetadataBase(),
    openGraph: {
      title: siteBrand.title,
      description: siteBrand.description,
      url: site.baseUrl,
      siteName: siteBrand.siteName,
      locale: siteBrand.ogLocale,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: siteBrand.title,
      description: siteBrand.description,
      images: [getOgImageUrl()],
    },
  };
}

export function buildPageMetadata({
  locale,
  title,
  description,
  path,
}: PageMetadataInput): Metadata {
  const canonical = getLocalizedUrl(site.baseUrl, locale, path);
  const images = buildOgImages();

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((loc) => [loc, getLocalizedUrl(site.baseUrl, loc, path)]),
        ),
        "x-default": getLocalizedUrl(site.baseUrl, routing.defaultLocale, path),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteBrand.siteName,
      locale: ogLocaleMap[locale],
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [getOgImageUrl()],
    },
  };
}

export function buildOrganizationJsonLd() {
  const logoUrl = `${site.baseUrl}${site.assets.companyLogo}`;
  const sameAs = [company.instagram, company.youtube].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: company.companyName,
        url: site.baseUrl,
        logo: logoUrl,
        ...(sameAs.length > 0 ? { sameAs } : {}),
        ...(company.email ? { email: company.email } : {}),
        ...(company.phone ? { telephone: company.phone } : {}),
      },
      {
        "@type": "LocalBusiness",
        name: company.companyName,
        url: site.baseUrl,
        image: logoUrl,
        ...(company.address ? { address: company.address } : {}),
        ...(company.phone ? { telephone: company.phone } : {}),
        ...(company.email ? { email: company.email } : {}),
      },
      {
        "@type": "ConstructionCompany",
        name: company.companyName,
        url: site.baseUrl,
      },
    ],
  };
}

export const staticRoutes = [
  "/",
  "/quienes-somos",
  "/servicios/estructura",
  "/servicios/ingenieria",
  "/servicios/arquitectura",
  "/servicios/acabados",
  "/servicios/carpinteria",
  "/servicios/gestion-administrativa",
  "/para-inversores",
  "/calculador",
  "/politica-de-privacidad",
] as const;

export function getSiteMetadataBase(): URL {
  return new URL(site.baseUrl);
}
