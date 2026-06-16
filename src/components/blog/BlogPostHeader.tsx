import type { Locale } from "@/i18n/routing";
import { formatBlogDate } from "@/lib/blog-utils";
import type { BlogPostSummary } from "@/types/blog";

type BlogPostHeaderProps = {
  post: BlogPostSummary;
  locale: Locale;
  minuteLabel: string;
  byLabel: string;
};

export function BlogPostHeader({ post, locale, minuteLabel, byLabel }: BlogPostHeaderProps) {
  return (
    <header className="space-y-4 border-b border-border pb-8">
      {post.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
        {post.title}
      </h1>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <time dateTime={post.publishedDate}>{formatBlogDate(post.publishedDate, locale)}</time>
        <span aria-hidden="true">·</span>
        <span>
          {post.readingTimeMinutes} {minuteLabel}
        </span>
        {post.author ? (
          <>
            <span aria-hidden="true">·</span>
            <span>
              {byLabel} {post.author}
            </span>
          </>
        ) : null}
      </div>
    </header>
  );
}
