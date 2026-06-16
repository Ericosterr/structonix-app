import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { backgrounds } from "@data/backgrounds";
import { generatePageMetadata } from "@/lib/page-metadata";
import type { Locale } from "@/i18n/routing";
import { Hero } from "@/components/sections/Hero";
import { BlogList } from "@/components/blog/BlogList";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const revalidate = 3600;

type BlogPageProps = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata({
    locale,
    path: "/blog",
    namespace: "seo.blog",
  });
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations("blog");
  const tNav = await getTranslations("nav");
  const page = pageParam ? Math.max(1, Number.parseInt(pageParam, 10) || 1) : 1;

  return (
    <>
      <Hero backgroundImage={backgrounds.about} size="tall">
        <SectionHeading
          title={tNav("blog")}
          className="text-primary-foreground"
        />
        <p className="mt-4 max-w-2xl text-primary-foreground/90">{t("subtitle")}</p>
      </Hero>

      <BlogList
        locale={locale}
        page={page}
        labels={{
          featuredTitle: t("featuredTitle"),
          allPostsTitle: t("allPostsTitle"),
          readMore: t("readMore"),
          minuteRead: t("minuteRead"),
          empty: t("empty"),
          previous: t("previous"),
          next: t("next"),
        }}
      />
    </>
  );
}
