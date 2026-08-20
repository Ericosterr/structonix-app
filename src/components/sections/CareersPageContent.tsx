"use client";

import { Briefcase, FileText, TrendingUp, HardHat } from "lucide-react";
import { useTranslations } from "next-intl";
import { company } from "@config/company";
import {
  buildCareersWhatsAppUrl,
  careerBenefitKeys,
  careerJobKeys,
} from "@data/careers";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

const benefitIcons = {
  salary: TrendingUp,
  contract: FileText,
  growth: Briefcase,
  projects: HardHat,
} as const;

export function CareersPageContent() {
  const t = useTranslations("careers");

  return (
    <>
      <AnimatedSection className="border-t border-border py-12 md:py-16">
        <Container className="space-y-8">
          <SectionHeading title={t("vacanciesTitle")} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {careerJobKeys.map((key) => {
              const title = t(`jobs.${key}.title`);
              const whatsappUrl = buildCareersWhatsAppUrl(
                company.careersWhatsappPhone,
                t("whatsappMessage", { title }),
              );

              return (
                <article
                  key={key}
                  className="flex h-full flex-col rounded-[var(--radius-card)] border border-border bg-background p-6 shadow-[var(--shadow-soft)]"
                >
                  <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {t(`jobs.${key}.description`)}
                  </p>
                  <Button asChild className="mt-5 w-full sm:w-auto">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("apply")}
                    </a>
                  </Button>
                </article>
              );
            })}
          </div>
        </Container>
      </AnimatedSection>

      <AnimatedSection className="border-t border-border bg-muted/40 py-12 md:py-16">
        <Container className="space-y-8">
          <SectionHeading title={t("benefitsTitle")} />
          <div className="grid gap-6 sm:grid-cols-2">
            {careerBenefitKeys.map((key) => {
              const Icon = benefitIcons[key];
              return (
                <div
                  key={key}
                  className="rounded-[var(--radius-card)] border border-border bg-background p-6 shadow-[var(--shadow-soft)]"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="font-semibold tracking-tight">
                    {t(`benefits.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(`benefits.${key}.text`)}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </AnimatedSection>

      <AnimatedSection className="border-t border-border py-12 md:py-16">
        <Container className="max-w-3xl space-y-5 text-center">
          <SectionHeading title={t("fallbackTitle")} />
          <p className="leading-relaxed text-muted-foreground">
            {t("fallbackText")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <a
                href={`https://wa.me/${company.careersWhatsappPhone}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("fallbackCta")}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={`mailto:${company.careersEmail}`}>{company.careersEmail}</a>
            </Button>
          </div>
        </Container>
      </AnimatedSection>
    </>
  );
}
