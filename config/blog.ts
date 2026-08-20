export const blogConfig = {
  /** ISR revalidation interval (seconds). ~5 minutes keeps Notion edits fresh. */
  revalidate: 300,
  /** Default posts per page on the blog index. */
  pageSize: 12,
  /** Maximum featured posts on the index hero. */
  featuredLimit: 3,
  /** Notion database property names (must match your Notion schema). */
  properties: {
    title: "title",
    slug: "slug",
    excerpt: "excerpt",
    seoTitle: "seoTitle",
    seoDescription: "seoDescription",
    coverImage: "coverImage",
    publishedDate: "publishedDate",
    published: "published",
    locale: "locale",
    author: "author",
    tags: "tags",
    featured: "featured",
    /** Shared key across ES/EN/RU rows for the same article (e.g. building-license-malaga). */
    translationGroup: "translationGroup",
  },
} as const;
