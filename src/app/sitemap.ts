import type { MetadataRoute } from "next";
import { site } from "@config/site";
import { routing } from "@/i18n/routing";
import { staticRoutes } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of staticRoutes) {
      const localizedPath =
        locale === routing.defaultLocale
          ? path
          : `/${locale}${path === "/" ? "" : path}`;

      entries.push({
        url: `${site.baseUrl}${localizedPath}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: path === "/" ? 1 : 0.8,
      });
    }
  }

  return entries;
}
