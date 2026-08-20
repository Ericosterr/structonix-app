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
      { url: "/favicon.ico" },
      { url: "/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
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

type LocalizedSlugMetadataInput = {
  locale: Locale;
  title: string;
  description: string;
  slugByLocale: Record<Locale, string>;
};

/**
 * Metadata for pages whose slug differs per locale (localized URLs).
 * Produces canonical + per-locale hreflang alternates + x-default + OpenGraph.
 */
export function buildLocalizedSlugMetadata({
  locale,
  title,
  description,
  slugByLocale,
}: LocalizedSlugMetadataInput): Metadata {
  const path = `/${slugByLocale[locale]}`;
  const canonical = getLocalizedUrl(site.baseUrl, locale, path);
  const images = buildOgImages();

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((loc) => [
            loc,
            getLocalizedUrl(site.baseUrl, loc, `/${slugByLocale[loc]}`),
          ]),
        ),
        "x-default": getLocalizedUrl(
          site.baseUrl,
          routing.defaultLocale,
          `/${slugByLocale[routing.defaultLocale]}`,
        ),
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

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFaqJsonLd(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

type LocalBusinessInput = {
  name: string;
  url: string;
  areaServed: string;
  geo: { lat: number; lng: number; region: string };
};

export function buildLocalBusinessJsonLd({
  name,
  url,
  areaServed,
  geo,
}: LocalBusinessInput) {
  const logoUrl = `${site.baseUrl}${site.assets.companyLogo}`;

  return {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    "@id": `${url}#localbusiness`,
    name,
    url,
    image: logoUrl,
    logo: logoUrl,
    ...(company.phone ? { telephone: company.phone } : {}),
    ...(company.email ? { email: company.email } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: "Calle Teide, 3/2",
      addressLocality: "Benalmádena",
      addressRegion: geo.region,
      postalCode: "29631",
      addressCountry: "ES",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: geo.lat,
      longitude: geo.lng,
    },
    areaServed: {
      "@type": "City",
      name: areaServed,
    },
    knowsAbout: [
      "Luxury villa construction",
      "Architecture",
      "Engineering",
      "Construction project management",
      "Real estate development",
    ],
  };
}

export const staticRoutes = [
  "/",
  "/quienes-somos",
  "/carrera",
  "/servicios/estructura",
  "/servicios/ingenieria",
  "/servicios/arquitectura",
  "/servicios/acabados",
  "/servicios/carpinteria",
  "/servicios/gestion-administrativa",
  "/para-inversores",
  "/blog",
  "/calculador",
  "/politica-de-privacidad",
] as const;

export function getSiteMetadataBase(): URL {
  return new URL(site.baseUrl);
}
