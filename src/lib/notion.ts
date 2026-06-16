import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  PartialPageObjectResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";
import { blogConfig } from "@config/blog";
import type { Locale } from "@/i18n/routing";
import { estimateReadingTimeFromText } from "@/lib/blog-utils";
import { blocksToPlainText, fetchPageBlocks } from "@/lib/notion/blocks";
import {
  getPageLocale,
  getPageSlug,
  isPagePublished,
  mapPageToSummary,
} from "@/lib/notion/properties";
import type {
  BlogPost,
  BlogPostSummary,
  BlogTranslationAlternate,
  GetAllPostsOptions,
  PaginatedPosts,
} from "@/types/blog";

type NotionPage = PageObjectResponse | PartialPageObjectResponse;

let notionClient: Client | null = null;

export function isNotionConfigured(): boolean {
  return Boolean(process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID);
}

function getNotionClient(): Client {
  if (!process.env.NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY is not configured.");
  }

  if (!notionClient) {
    notionClient = new Client({ auth: process.env.NOTION_API_KEY });
  }

  return notionClient;
}

function getDatabaseId(): string {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) {
    throw new Error("NOTION_DATABASE_ID is not configured.");
  }
  return databaseId;
}

function buildPublishedFilter(locale: Locale, tag?: string): QueryDatabaseParameters["filter"] {
  const filters = [
    {
      property: blogConfig.properties.published,
      checkbox: { equals: true },
    },
    {
      property: blogConfig.properties.locale,
      select: { equals: locale },
    },
    ...(tag
      ? [
          {
            property: blogConfig.properties.tags,
            multi_select: { contains: tag },
          },
        ]
      : []),
  ];

  return { and: filters } as QueryDatabaseParameters["filter"];
}

async function queryAllPublishedPages(
  locale: Locale,
  tag?: string,
): Promise<NotionPage[]> {
  if (!isNotionConfigured()) {
    return [];
  }

  const notion = getNotionClient();
  const pages: NotionPage[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: getDatabaseId(),
      filter: buildPublishedFilter(locale, tag),
      sorts: [
        {
          property: blogConfig.properties.publishedDate,
          direction: "descending",
        },
      ],
      start_cursor: cursor,
      page_size: 100,
    });

    for (const result of response.results) {
      if (result.object === "page") {
        pages.push(result);
      }
    }
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return pages;
}

function mapPagesToSummaries(pages: NotionPage[]): BlogPostSummary[] {
  return pages
    .map((page) => {
      const summary = mapPageToSummary(page, estimateReadingTimeFromText(""));
      if (!summary) {
        return null;
      }

      const readingTime = estimateReadingTimeFromText(
        [summary.excerpt, summary.title].filter(Boolean).join(" "),
      );

      return { ...summary, readingTimeMinutes: readingTime };
    })
    .filter((post): post is BlogPostSummary => post !== null);
}

/**
 * Returns paginated published posts for a locale.
 * Supports optional tag filtering for future category/tag pages.
 */
export async function getAllPosts(options: GetAllPostsOptions): Promise<PaginatedPosts> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.max(1, options.pageSize ?? blogConfig.pageSize);

  if (!isNotionConfigured()) {
    return { posts: [], total: 0, page, pageSize, totalPages: 0 };
  }

  try {
    const pages = await queryAllPublishedPages(options.locale, options.tag);
    const summaries = mapPagesToSummaries(pages);
    const total = summaries.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const posts = summaries.slice(start, start + pageSize);

    return { posts, total, page, pageSize, totalPages };
  } catch (error) {
    console.error("[notion] getAllPosts failed:", error);
    return { posts: [], total: 0, page, pageSize, totalPages: 0 };
  }
}

/**
 * Returns published slugs for a single locale (for locale-scoped static generation).
 */
export async function getPublishedSlugsForLocale(
  locale: Locale,
): Promise<Array<{ slug: string }>> {
  if (!isNotionConfigured()) {
    return [];
  }

  try {
    const pages = await queryAllPublishedPages(locale);
    return mapPagesToSummaries(pages).map((post) => ({ slug: post.slug }));
  } catch (error) {
    console.error("[notion] getPublishedSlugsForLocale failed:", error);
    return [];
  }
}

/**
 * Returns all published locale + slug pairs (for sitemap).
 */
export async function getAllPublishedSlugs(): Promise<
  Array<{ locale: Locale; slug: string; publishedDate: string }>
> {
  if (!isNotionConfigured()) {
    return [];
  }

  try {
    const entries: Array<{ locale: Locale; slug: string; publishedDate: string }> = [];

    for (const locale of ["es", "en", "ru"] as Locale[]) {
      const pages = await queryAllPublishedPages(locale);
      for (const page of pages) {
        const summary = mapPageToSummary(page, 1);
        if (summary) {
          entries.push({
            locale: summary.locale,
            slug: summary.slug,
            publishedDate: summary.publishedDate,
          });
        }
      }
    }

    return entries;
  } catch (error) {
    console.error("[notion] getAllPublishedSlugs failed:", error);
    return [];
  }
}

/**
 * Returns published translations linked by translationGroup, each with its own slug.
 * Falls back to the current post only when no translation group is set.
 */
export async function getPostTranslationAlternates(
  post: BlogPostSummary,
): Promise<BlogTranslationAlternate[]> {
  if (!isNotionConfigured()) {
    return [{ locale: post.locale, slug: post.slug }];
  }

  if (!post.translationGroup) {
    return [{ locale: post.locale, slug: post.slug }];
  }

  try {
    const notion = getNotionClient();
    const response = await notion.databases.query({
      database_id: getDatabaseId(),
      filter: {
        and: [
          {
            property: blogConfig.properties.published,
            checkbox: { equals: true },
          },
          {
            property: blogConfig.properties.translationGroup,
            rich_text: { equals: post.translationGroup },
          },
        ],
      },
    });

    const alternates: BlogTranslationAlternate[] = [];

    for (const result of response.results) {
      if (result.object !== "page") {
        continue;
      }

      const summary = mapPageToSummary(result, 1);
      if (summary) {
        alternates.push({ locale: summary.locale, slug: summary.slug });
      }
    }

    if (alternates.length === 0) {
      return [{ locale: post.locale, slug: post.slug }];
    }

    return alternates;
  } catch (error) {
    console.error("[notion] getPostTranslationAlternates failed:", error);
    return [{ locale: post.locale, slug: post.slug }];
  }
}

/**
 * Returns a single published post with Notion block content.
 */
export async function getPostBySlug(
  slug: string,
  locale: Locale,
): Promise<BlogPost | null> {
  if (!isNotionConfigured()) {
    return null;
  }

  try {
    const notion = getNotionClient();
    const response = await notion.databases.query({
      database_id: getDatabaseId(),
      filter: {
        and: [
          {
            property: blogConfig.properties.published,
            checkbox: { equals: true },
          },
          {
            property: blogConfig.properties.locale,
            select: { equals: locale },
          },
          {
            property: blogConfig.properties.slug,
            rich_text: { equals: slug },
          },
        ],
      },
      page_size: 1,
    });

    const result = response.results[0];
    if (!result || result.object !== "page" || !isPagePublished(result)) {
      return null;
    }

    const page = result;

    const pageLocale = getPageLocale(page);
    const pageSlug = getPageSlug(page);

    if (pageLocale !== locale || pageSlug !== slug) {
      return null;
    }

    const blocks = await fetchPageBlocks(notion, page.id);
    const readingTimeMinutes = estimateReadingTimeFromText(
      blocksToPlainText(blocks) || mapPageToSummary(page, 1)?.excerpt || "",
    );
    const summary = mapPageToSummary(page, readingTimeMinutes);

    if (!summary) {
      return null;
    }

    return { ...summary, blocks };
  } catch (error) {
    console.error("[notion] getPostBySlug failed:", error);
    return null;
  }
}

/**
 * Returns featured posts for a locale. Falls back to latest posts when none are marked featured.
 */
export async function getFeaturedPosts(
  locale: Locale,
  limit = blogConfig.featuredLimit,
): Promise<BlogPostSummary[]> {
  if (!isNotionConfigured()) {
    return [];
  }

  try {
    const pages = await queryAllPublishedPages(locale);
    const summaries = mapPagesToSummaries(pages);
    const featured = summaries.filter((post) => post.featured);

    if (featured.length >= limit) {
      return featured.slice(0, limit);
    }

    const remaining = summaries.filter((post) => !post.featured);
    return [...featured, ...remaining].slice(0, limit);
  } catch (error) {
    console.error("[notion] getFeaturedPosts failed:", error);
    return [];
  }
}

/** Reserved for future related-posts feature. */
export async function getRelatedPosts(
  post: BlogPostSummary,
  limit = 3,
): Promise<BlogPostSummary[]> {
  const { posts } = await getAllPosts({
    locale: post.locale,
    pageSize: 50,
  });

  const sameGroup = post.translationGroup
    ? posts.filter(
        (candidate) =>
          candidate.slug !== post.slug &&
          candidate.translationGroup === post.translationGroup,
      )
    : [];

  const sharedTags = new Set(post.tags);
  const byTags = posts.filter(
    (candidate) =>
      candidate.slug !== post.slug &&
      candidate.tags.some((tag) => sharedTags.has(tag)),
  );

  const fallback = posts.filter((candidate) => candidate.slug !== post.slug);

  const ranked = [...sameGroup, ...byTags, ...fallback];
  const seen = new Set<string>();

  return ranked.filter((candidate) => {
    if (seen.has(candidate.slug)) {
      return false;
    }
    seen.add(candidate.slug);
    return true;
  }).slice(0, limit);
}
