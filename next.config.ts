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
