import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { backgrounds } from "@data/backgrounds";
import { generatePageMetadata } from "@/lib/page-metadata";
import type { Locale } from "@/i18n/routing";
import { Hero } from "@/components/sections/Hero";
import { CareersPageContent } from "@/components/sections/CareersPageContent";

type CareersPageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({
  params,
}: CareersPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata({
    locale,
    path: "/carrera",
    namespace: "seo.careers",
  });
}

export default async function CareersPage({ params }: CareersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("careers");

  return (
    <>
      <Hero backgroundImage={backgrounds.about} size="tall">
        <div className="max-w-3xl space-y-5">
          <h1 className="text-3xl font-semibold tracking-tight text-primary-foreground md:text-4xl lg:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="text-base leading-relaxed text-white/90 md:text-lg">
            {t("heroDescription")}
          </p>
        </div>
      </Hero>

      <CareersPageContent />
    </>
  );
}
