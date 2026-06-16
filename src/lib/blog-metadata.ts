import type { Metadata } from "next";
import { site } from "@config/site";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { getLocalizedUrl } from "@/lib/locale-path";
import { getAbsoluteAssetUrl, getOgImageUrl, siteBrand } from "@/lib/seo";
import type { BlogPostSummary, BlogTranslationAlternate } from "@/types/blog";

const ogLocaleMap: Record<Locale, string> = {
  es: "es_ES",
  en: "en_US",
  ru: "ru_RU",
};

type BlogPostMetadataInput = {
  locale: Locale;
  post: BlogPostSummary;
  /** Published translations with locale-specific slugs. */
  translations: BlogTranslationAlternate[];
};

function resolveSeoTitle(post: BlogPostSummary): string {
  return post.seoTitle ?? post.title;
}

function resolveSeoDescription(post: BlogPostSummary): string {
  return post.seoDescription ?? post.excerpt;
}

export function buildBlogPostMetadata({
  locale,
  post,
  translations,
}: BlogPostMetadataInput): Metadata {
  const path = `/blog/${post.slug}`;
  const canonical = getLocalizedUrl(site.baseUrl, locale, path);
  const title = resolveSeoTitle(post);
  const description = resolveSeoDescription(post);
  const ogImage = post.coverImage ?? getOgImageUrl();
  const ogImages = [
    {
      url: ogImage.startsWith("http") ? ogImage : getAbsoluteAssetUrl(ogImage),
      width: 1200,
      height: 630,
      alt: post.title,
    },
  ];

  const languages: Record<string, string> = {
    ...Object.fromEntries(
      translations.map((translation) => [
        translation.locale,
        getLocalizedUrl(site.baseUrl, translation.locale, `/blog/${translation.slug}`),
      ]),
    ),
    "x-default": getLocalizedUrl(
      site.baseUrl,
      translations.some((translation) => translation.locale === routing.defaultLocale)
        ? routing.defaultLocale
        : translations[0]?.locale ?? routing.defaultLocale,
      `/blog/${
        translations.find((translation) => translation.locale === routing.defaultLocale)?.slug ??
        translations[0]?.slug ??
        post.slug
      }`,
    ),
  };

  return {
    title: `${title} | ${siteBrand.siteName}`,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteBrand.siteName,
      locale: ogLocaleMap[locale],
      type: "article",
      publishedTime: post.publishedDate,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags.length > 0 ? post.tags : undefined,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImages[0].url],
    },
  };
}
