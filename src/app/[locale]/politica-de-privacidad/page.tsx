import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { privacySectionKeys } from "@config/privacy-sections";
import { generatePageMetadata } from "@/lib/page-metadata";
import type { Locale } from "@/i18n/routing";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

type PrivacyPageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({
  params,
}: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata({
    locale,
    path: "/politica-de-privacidad",
    namespace: "seo.privacy",
  });
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");

  return (
    <AnimatedSection className="py-16">
      <Container className="max-w-3xl space-y-8">
        <div className="space-y-2">
          <SectionHeading title={t("title")} />
          <p className="text-sm text-muted-foreground">{t("lastUpdated")}</p>
        </div>
        {privacySectionKeys.map((key) => (
          <section key={key} className="space-y-3">
            <h2 className="text-xl font-semibold">{t(`sections.${key}.title`)}</h2>
            <div className="space-y-3 text-base leading-relaxed text-muted-foreground">
              {t(`sections.${key}.content`)
                .split("\n\n")
                .map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
            </div>
          </section>
        ))}
      </Container>
    </AnimatedSection>
  );
}
