import type { MetadataRoute } from "next";
import { site } from "@config/site";
import { routing } from "@/i18n/routing";
import { getLocalizedUrl } from "@/lib/locale-path";
import { getAllPublishedSlugs } from "@/lib/notion";
import { staticRoutes } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of staticRoutes) {
      entries.push({
        url: getLocalizedUrl(site.baseUrl, locale, path),
        lastModified: new Date(),
        changeFrequency: path === "/blog" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : path === "/blog" ? 0.85 : 0.8,
      });
    }
  }

  try {
    const blogEntries = await getAllPublishedSlugs();

    for (const entry of blogEntries) {
      entries.push({
        url: getLocalizedUrl(site.baseUrl, entry.locale, `/blog/${entry.slug}`),
        lastModified: new Date(entry.publishedDate),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error("[sitemap] Failed to load blog entries:", error);
  }

  return entries;
}
