import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const PAGE_CACHE_HEADERS = [
  {
    key: "Cache-Control",
    value: "private, no-cache, no-store, max-age=0, must-revalidate",
  },
  { key: "Pragma", value: "no-cache" },
  { key: "Expires", value: "0" },
  { key: "CDN-Cache-Control", value: "no-store" },
  { key: "Cloudflare-CDN-Cache-Control", value: "no-store" },
  { key: "Surrogate-Control", value: "no-store" },
  {
    key: "Vary",
    value:
      "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url, Accept, Accept-Encoding",
  },
] as const;

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "www.notion.so",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      },
    ],
  },
  async redirects() {
    // Consolidate overlapping Marbella commercial URLs into the primary
    // construction-company page. Keep locale-prefixed and default-locale forms.
    return [
      {
        source: "/en/villa-construction-marbella",
        destination: "/en/construction-company-marbella",
        permanent: true,
      },
      {
        source: "/en/general-contractor-marbella",
        destination: "/en/construction-company-marbella",
        permanent: true,
      },
      {
        source: "/construccion-villas-marbella",
        destination: "/empresa-constructora-marbella",
        permanent: true,
      },
      {
        source: "/constructora-marbella",
        destination: "/empresa-constructora-marbella",
        permanent: true,
      },
      {
        source: "/es/construccion-villas-marbella",
        destination: "/empresa-constructora-marbella",
        permanent: true,
      },
      {
        source: "/es/constructora-marbella",
        destination: "/empresa-constructora-marbella",
        permanent: true,
      },
      {
        source: "/ru/stroitelstvo-vill-v-marbele",
        destination: "/ru/stroitelnaya-kompaniya-marbelya",
        permanent: true,
      },
      {
        source: "/ru/generalnyy-podryadchik-marbelya",
        destination: "/ru/stroitelnaya-kompaniya-marbelya",
        permanent: true,
      },
      // Window installation service: retire shared `carpinteria` slug.
      {
        source: "/servicios/carpinteria",
        destination: "/servicios/instalacion-de-ventanas",
        permanent: true,
      },
      {
        source: "/es/servicios/carpinteria",
        destination: "/servicios/instalacion-de-ventanas",
        permanent: true,
      },
      {
        source: "/en/servicios/carpinteria",
        destination: "/en/servicios/window-installation",
        permanent: true,
      },
      {
        source: "/ru/servicios/carpinteria",
        destination: "/ru/servicios/montazh-okon",
        permanent: true,
      },
      // Retired geographic /zonas hubs → commercial landing pages.
      {
        source: "/zonas/marbella",
        destination: "/empresa-constructora-marbella",
        permanent: true,
      },
      {
        source: "/es/zonas/marbella",
        destination: "/empresa-constructora-marbella",
        permanent: true,
      },
      {
        source: "/en/zonas/marbella",
        destination: "/en/construction-company-marbella",
        permanent: true,
      },
      {
        source: "/ru/zonas/marbella",
        destination: "/ru/stroitelnaya-kompaniya-marbelya",
        permanent: true,
      },
      {
        source: "/zonas/costa-del-sol",
        destination: "/constructora-costa-del-sol",
        permanent: true,
      },
      {
        source: "/es/zonas/costa-del-sol",
        destination: "/constructora-costa-del-sol",
        permanent: true,
      },
      {
        source: "/en/zonas/costa-del-sol",
        destination: "/en/builders-costa-del-sol",
        permanent: true,
      },
      {
        source: "/ru/zonas/costa-del-sol",
        destination: "/ru/stroiteli-costa-del-sol",
        permanent: true,
      },
      {
        source: "/zonas/benahavis",
        destination: "/constructora-costa-del-sol",
        permanent: true,
      },
      {
        source: "/es/zonas/benahavis",
        destination: "/constructora-costa-del-sol",
        permanent: true,
      },
      {
        source: "/en/zonas/benahavis",
        destination: "/en/builders-costa-del-sol",
        permanent: true,
      },
      {
        source: "/ru/zonas/benahavis",
        destination: "/ru/stroiteli-costa-del-sol",
        permanent: true,
      },
      {
        source: "/zonas/estepona",
        destination: "/constructora-costa-del-sol",
        permanent: true,
      },
      {
        source: "/es/zonas/estepona",
        destination: "/constructora-costa-del-sol",
        permanent: true,
      },
      {
        source: "/en/zonas/estepona",
        destination: "/en/builders-costa-del-sol",
        permanent: true,
      },
      {
        source: "/ru/zonas/estepona",
        destination: "/ru/stroiteli-costa-del-sol",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Hashed build assets — safe to cache forever.
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // HTML / App Router pages only (exclude Next internals & files with extensions).
        // Prevents Hostinger/CDN from storing HTML and RSC under one cache key for a year.
        source: "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
        headers: [...PAGE_CACHE_HEADERS],
      },
      {
        source: "/",
        headers: [...PAGE_CACHE_HEADERS],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
