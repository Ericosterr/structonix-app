import { blogConfig } from "@config/blog";
import { getAllPosts } from "@/lib/notion";
import type { Locale } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { BlogCard } from "@/components/blog/BlogCard";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type BlogListProps = {
  locale: Locale;
  page?: number;
  labels: {
    sectionTitle: string;
    readMore: string;
    minuteRead: string;
    empty: string;
    previous: string;
    next: string;
  };
};

export async function BlogList({ locale, page = 1, labels }: BlogListProps) {
  const { posts, totalPages, page: currentPage } = await getAllPosts({
    locale,
    page,
    pageSize: blogConfig.pageSize,
  });
  const t = await getTranslations("blog");

  if (posts.length === 0) {
    return (
      <Container className="py-16">
        <p className="text-center text-muted-foreground">{labels.empty}</p>
      </Container>
    );
  }

  return (
    <Container className="space-y-12 py-12 md:py-16">
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {labels.sectionTitle}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              post={post}
              locale={locale}
              readMoreLabel={labels.readMore}
              minuteLabel={labels.minuteRead}
            />
          ))}
        </div>
      </section>

      {totalPages > 1 ? (
        <nav
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
          aria-label="Blog pagination"
        >
          {currentPage > 1 ? (
            <Link
              href={currentPage === 2 ? "/blog" : `/blog?page=${currentPage - 1}`}
              className="rounded-[var(--radius-button)] border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              {labels.previous}
            </Link>
          ) : null}

          <span className="text-sm text-muted-foreground">
            {t("pageOf", { current: currentPage, total: totalPages })}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={`/blog?page=${currentPage + 1}`}
              className="rounded-[var(--radius-button)] border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              {labels.next}
            </Link>
          ) : null}
        </nav>
      ) : null}
    </Container>
  );
}

export function BlogListSkeleton({ className }: { className?: string }) {
  return (
    <Container className={cn("grid gap-6 py-12 md:grid-cols-2 lg:grid-cols-3 md:py-16", className)}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-80 animate-pulse rounded-[var(--radius-card)] bg-muted"
        />
      ))}
    </Container>
  );
}
