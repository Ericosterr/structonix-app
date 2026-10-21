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

/**
 * Favicon strategy (single source in metadata; no competing tags):
 * - /favicon.ico — classic browser request
 * - /icon.png — App Router file convention asset (src/app/icon.png)
 * - sized PNGs — Google / PWA useful fallbacks
 * - /apple-icon.png — App Router apple-icon (src/app/apple-icon.png)
 * - /apple-touch-icon.png — conventional iOS path (public alias, same artwork)
 *
 * Explicit metadata.icons replaces automatic file-convention injection, so we
 * list App Router URLs here instead of relying on a second auto-injected set.
 */
export function buildFaviconIcons(): NonNullable<Metadata["icons"]> {
  return {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
  /** Optional path prefix without trailing slash, e.g. `/servicios`. */
  pathPrefix?: string;
};

function localizedSlugPath(
  slugByLocale: Record<Locale, string>,
  locale: Locale,
  pathPrefix = "",
): string {
  const slug = slugByLocale[locale];
  return pathPrefix ? `${pathPrefix}/${slug}` : `/${slug}`;
}

/**
 * Metadata for pages whose slug differs per locale (localized URLs).
 * Produces canonical + per-locale hreflang alternates + x-default + OpenGraph.
 */
export function buildLocalizedSlugMetadata({
  locale,
  title,
  description,
  slugByLocale,
  pathPrefix = "",
}: LocalizedSlugMetadataInput): Metadata {
  const path = localizedSlugPath(slugByLocale, locale, pathPrefix);
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
            getLocalizedUrl(
              site.baseUrl,
              loc,
              localizedSlugPath(slugByLocale, loc, pathPrefix),
            ),
          ]),
        ),
        "x-default": getLocalizedUrl(
          site.baseUrl,
          routing.defaultLocale,
          localizedSlugPath(slugByLocale, routing.defaultLocale, pathPrefix),
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
  const sameAs = [company.instagram, company.youtube, company.facebook].filter(
    Boolean,
  );
  const organizationId = `${site.baseUrl}/#organization`;

  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "GeneralContractor"],
    "@id": organizationId,
    name: company.companyName,
    legalName: company.legalName,
    url: site.baseUrl,
    logo: logoUrl,
    image: logoUrl,
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(company.email ? { email: company.email } : {}),
    ...(company.phone ? { telephone: company.phone } : {}),
    address: {
      "@type": "PostalAddress",
      ...company.addressStructured,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: company.geo.lat,
      longitude: company.geo.lng,
    },
    areaServed: company.areaServed.map((name) => ({
      "@type": "Place",
      name,
    })),
    availableLanguage: company.availableLanguage,
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

/**
 * Page-level contractor entity for local/landing pages.
 * Uses the verified HQ address in Benalmádena and declares the commercial
 * focus via areaServed — never invents a Marbella branch office.
 */
export function buildLocalBusinessJsonLd({
  name,
  url,
  areaServed,
}: LocalBusinessInput) {
  const logoUrl = `${site.baseUrl}${site.assets.companyLogo}`;
  const organizationId = `${site.baseUrl}/#organization`;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    isPartOf: { "@id": organizationId },
    about: {
      "@type": "GeneralContractor",
      "@id": organizationId,
      name: company.companyName,
      url: site.baseUrl,
      telephone: company.phone,
      email: company.email,
      address: {
        "@type": "PostalAddress",
        ...company.addressStructured,
      },
      areaServed: {
        "@type": "AdministrativeArea",
        name: areaServed,
      },
      image: logoUrl,
      logo: logoUrl,
    },
    primaryImageOfPage: logoUrl,
  };
}

/** Non-service static routes. Service URLs come from `getServicePath` (localized). */
export const staticRoutes = [
  "/",
  "/quienes-somos",
  "/carrera",
  "/para-inversores",
  "/blog",
  "/calculador",
  "/politica-de-privacidad",
] as const;

export function getSiteMetadataBase(): URL {
  return new URL(site.baseUrl);
}
