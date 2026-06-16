import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildBlogPostMetadata } from "@/lib/blog-metadata";
import {
  getPostBySlug,
  getPostTranslationAlternates,
  getPublishedSlugsForLocale,
  isNotionConfigured,
} from "@/lib/notion";
import type { Locale } from "@/i18n/routing";
import { BlogPostHeader } from "@/components/blog/BlogPostHeader";
import { NotionContent } from "@/components/blog/NotionContent";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";

export const revalidate = 3600;

type BlogPostPageProps = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  if (!isNotionConfigured()) {
    return [];
  }

  return getPublishedSlugsForLocale(params.locale as Locale);
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug, locale);

  if (!post) {
    return {};
  }

  const translations = await getPostTranslationAlternates(post);

  return buildBlogPostMetadata({
    locale,
    post,
    translations,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await getPostBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  const t = await getTranslations("blog");

  return (
    <article>
      {post.coverImage ? (
        <div className="relative aspect-[21/9] w-full bg-muted">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
        </div>
      ) : null}

      <Container className="py-10 md:py-14">
        <div className="mx-auto max-w-3xl space-y-8">
          <Link
            href="/blog"
            className="inline-flex text-sm font-medium text-primary transition-opacity hover:opacity-80"
          >
            ← {t("backToBlog")}
          </Link>

          <BlogPostHeader
            post={post}
            locale={locale}
            minuteLabel={t("minuteRead")}
            byLabel={t("byAuthor")}
          />

          <NotionContent blocks={post.blocks} />
        </div>
      </Container>
    </article>
  );
}
