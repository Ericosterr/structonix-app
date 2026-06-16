import type {
  PageObjectResponse,
  PartialPageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { blogConfig } from "@config/blog";
import type { Locale } from "@/i18n/routing";
import { isValidBlogLocale } from "@/lib/blog-utils";
import type { BlogPostSummary } from "@/types/blog";

type NotionPage = PageObjectResponse | PartialPageObjectResponse;

function getProperty(page: NotionPage, name: string) {
  if (!("properties" in page) || !page.properties) {
    return undefined;
  }
  return page.properties[name];
}

function richTextToPlain(items: RichTextItemResponse[] | undefined): string {
  if (!items?.length) {
    return "";
  }
  return items.map((item) => item.plain_text).join("");
}

export function getPageTitle(page: NotionPage): string {
  const titleProp = getProperty(page, blogConfig.properties.title);
  if (titleProp?.type === "title") {
    return richTextToPlain(titleProp.title);
  }
  return "Untitled";
}

export function getPageSlug(page: NotionPage): string {
  const slugProp = getProperty(page, blogConfig.properties.slug);
  if (slugProp?.type === "rich_text") {
    return richTextToPlain(slugProp.rich_text).trim();
  }
  if (slugProp?.type === "title") {
    return richTextToPlain(slugProp.title).trim();
  }
  return "";
}

export function getPageExcerpt(page: NotionPage): string {
  const excerptProp = getProperty(page, blogConfig.properties.excerpt);
  if (excerptProp?.type === "rich_text") {
    return richTextToPlain(excerptProp.rich_text).trim();
  }
  return "";
}

function getOptionalRichText(page: NotionPage, propertyName: string): string | null {
  const prop = getProperty(page, propertyName);
  if (prop?.type === "rich_text") {
    const value = richTextToPlain(prop.rich_text).trim();
    return value || null;
  }
  return null;
}

export function getPageSeoTitle(page: NotionPage): string | null {
  return getOptionalRichText(page, blogConfig.properties.seoTitle);
}

export function getPageSeoDescription(page: NotionPage): string | null {
  return getOptionalRichText(page, blogConfig.properties.seoDescription);
}

export function getPageTranslationGroup(page: NotionPage): string | null {
  const groupProp = getProperty(page, blogConfig.properties.translationGroup);
  if (groupProp?.type === "rich_text") {
    const value = richTextToPlain(groupProp.rich_text).trim();
    return value || null;
  }
  if (groupProp?.type === "select" && groupProp.select?.name) {
    return groupProp.select.name.trim() || null;
  }
  return null;
}

export function getPageCoverImage(page: NotionPage): string | null {
  const coverProp = getProperty(page, blogConfig.properties.coverImage);

  if (coverProp?.type === "url") {
    return coverProp.url;
  }

  if (coverProp?.type === "files" && coverProp.files[0]) {
    const file = coverProp.files[0];
    if (file.type === "external") {
      return file.external.url;
    }
    if (file.type === "file") {
      return file.file.url;
    }
  }

  if ("cover" in page && page.cover) {
    if (page.cover.type === "external") {
      return page.cover.external.url;
    }
    if (page.cover.type === "file") {
      return page.cover.file.url;
    }
  }

  return null;
}

export function getPagePublishedDate(page: NotionPage): string {
  const dateProp = getProperty(page, blogConfig.properties.publishedDate);
  if (dateProp?.type === "date" && dateProp.date?.start) {
    return dateProp.date.start;
  }
  if ("created_time" in page) {
    return page.created_time;
  }
  return new Date().toISOString();
}

export function getPageLocale(page: NotionPage): Locale | null {
  const localeProp = getProperty(page, blogConfig.properties.locale);
  if (localeProp?.type === "select" && localeProp.select?.name) {
    const value = localeProp.select.name.toLowerCase();
    if (isValidBlogLocale(value)) {
      return value;
    }
  }
  return null;
}

export function isPagePublished(page: NotionPage): boolean {
  const publishedProp = getProperty(page, blogConfig.properties.published);
  if (publishedProp?.type === "checkbox") {
    return publishedProp.checkbox;
  }
  return false;
}

export function getPageAuthor(page: NotionPage): string {
  const authorProp = getProperty(page, blogConfig.properties.author);
  if (authorProp?.type === "rich_text") {
    return richTextToPlain(authorProp.rich_text).trim();
  }
  if (authorProp?.type === "select" && authorProp.select?.name) {
    return authorProp.select.name;
  }
  return "";
}

export function getPageTags(page: NotionPage): string[] {
  const tagsProp = getProperty(page, blogConfig.properties.tags);
  if (tagsProp?.type === "multi_select") {
    return tagsProp.multi_select.map((tag) => tag.name);
  }
  return [];
}

export function isPageFeatured(page: NotionPage): boolean {
  const featuredProp = getProperty(page, blogConfig.properties.featured);
  if (featuredProp?.type === "checkbox") {
    return featuredProp.checkbox;
  }
  return false;
}

export function mapPageToSummary(
  page: NotionPage,
  readingTimeMinutes: number,
): BlogPostSummary | null {
  if (!("id" in page)) {
    return null;
  }

  const locale = getPageLocale(page);
  const slug = getPageSlug(page);

  if (!locale || !slug || !isPagePublished(page)) {
    return null;
  }

  return {
    id: page.id,
    title: getPageTitle(page),
    slug,
    excerpt: getPageExcerpt(page),
    seoTitle: getPageSeoTitle(page),
    seoDescription: getPageSeoDescription(page),
    coverImage: getPageCoverImage(page),
    publishedDate: getPagePublishedDate(page),
    locale,
    author: getPageAuthor(page),
    tags: getPageTags(page),
    featured: isPageFeatured(page),
    translationGroup: getPageTranslationGroup(page),
    readingTimeMinutes,
  };
}
