import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { formatBlogDate } from "@/lib/blog-utils";
import type { Locale } from "@/i18n/routing";
import type { BlogPostSummary } from "@/types/blog";
import { cn } from "@/lib/utils";

type BlogCardProps = {
  post: BlogPostSummary;
  locale: Locale;
  readMoreLabel: string;
  minuteLabel: string;
  className?: string;
};

export function BlogCard({
  post,
  locale,
  readMoreLabel,
  minuteLabel,
  className,
}: BlogCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-background shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[0_12px_40px_rgba(15,1,106,0.12)]",
        className,
      )}
    >
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-muted">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {post.title}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
        {post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="space-y-2">
          <Link href={`/blog/${post.slug}`}>
            <h2 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-primary">
              {post.title}
            </h2>
          </Link>
          {post.excerpt ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <time dateTime={post.publishedDate}>{formatBlogDate(post.publishedDate, locale)}</time>
          <span aria-hidden="true">·</span>
          <span>
            {post.readingTimeMinutes} {minuteLabel}
          </span>
          {post.author ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{post.author}</span>
            </>
          ) : null}
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="text-sm font-medium text-primary transition-opacity hover:opacity-80"
        >
          {readMoreLabel} →
        </Link>
      </div>
    </article>
  );
}
