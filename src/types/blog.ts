import type { Locale } from "@/i18n/routing";

/** Serializable Notion block for server rendering. */
export type NotionBlock = {
  id: string;
  type: string;
  hasChildren: boolean;
  children?: NotionBlock[];
  richText: RichTextSegment[];
  url?: string;
  caption?: string;
  language?: string;
  checked?: boolean;
};

export type RichTextSegment = {
  plainText: string;
  href?: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
};

export type BlogPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  /** Optional override; falls back to title. */
  seoTitle: string | null;
  /** Optional override; falls back to excerpt. */
  seoDescription: string | null;
  coverImage: string | null;
  publishedDate: string;
  locale: Locale;
  author: string;
  tags: string[];
  featured: boolean;
  /** Shared ID linking translated versions across locales (for hreflang). */
  translationGroup: string | null;
  readingTimeMinutes: number;
};

/** A published translation of an article in another locale. */
export type BlogTranslationAlternate = {
  locale: Locale;
  slug: string;
};

export type BlogPost = BlogPostSummary & {
  blocks: NotionBlock[];
};

export type GetAllPostsOptions = {
  locale: Locale;
  page?: number;
  pageSize?: number;
  tag?: string;
};

export type PaginatedPosts = {
  posts: BlogPostSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
