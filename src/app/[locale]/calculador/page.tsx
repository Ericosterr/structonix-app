import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { generatePageMetadata } from "@/lib/page-metadata";
import type { Locale } from "@/i18n/routing";
import { CalculatorCard } from "@/components/ui/CalculatorCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

type CalculatorPageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({
  params,
}: CalculatorPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata({
    locale,
    path: "/calculador",
    namespace: "seo.calculator",
  });
}

export default async function CalculatorPage({ params }: CalculatorPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("calculador");

  return (
    <AnimatedSection className="py-16">
      <Container className="space-y-10">
        <SectionHeading title={t("pageTitle")} />
        <div className="grid gap-8 md:grid-cols-2">
          <CalculatorCard type="structure" />
          <CalculatorCard type="construction" />
        </div>
      </Container>
    </AnimatedSection>
  );
}
