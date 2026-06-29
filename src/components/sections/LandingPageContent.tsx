import { getTranslations } from "next-intl/server";
import { company } from "@config/company";
import { site } from "@config/site";
import {
  getLandingPath,
  landingBackgrounds,
  landingGeo,
  landingLinks,
  type LandingKey,
} from "@data/landings";
import type { Locale } from "@/i18n/routing";
import { getLocalizedUrl } from "@/lib/locale-path";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildLocalBusinessJsonLd,
} from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { Hero } from "@/components/sections/Hero";
import { FaqSection, type FaqItem } from "@/components/sections/FaqSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WhatsAppConversionLink } from "@/components/analytics/WhatsAppConversionLink";

type LandingPageContentProps = {
  landingKey: LandingKey;
  locale: Locale;
};

type Section = { title: string; body: string };

const SERVICE_LINKS = [
  { href: "/servicios/arquitectura", key: "arquitectura" },
  { href: "/servicios/ingenieria", key: "ingenieria" },
  { href: "/servicios/estructura", key: "estructura" },
  { href: "/servicios/gestion-administrativa", key: "gestion-administrativa" },
] as const;

function paragraphs(text: string) {
  return text.split("\n\n").map((paragraph) => (
    <p key={paragraph.slice(0, 32)}>{paragraph}</p>
  ));
}

export async function LandingPageContent({
  landingKey,
  locale,
}: LandingPageContentProps) {
  const t = await getTranslations("landings");
  const tNav = await getTranslations("nav");

  const h1 = t(`${landingKey}.h1`);
  const sections = t.raw(`${landingKey}.sections`) as Section[];
  const faqItems = t.raw(`${landingKey}.faq`) as FaqItem[];
  const background = landingBackgrounds[landingKey];
  const geo = landingGeo[landingKey];

  const path = getLandingPath(landingKey, locale);
  const pageUrl = getLocalizedUrl(site.baseUrl, locale, path);
  const homeUrl = getLocalizedUrl(site.baseUrl, locale, "/");

  const breadcrumbItems = [
    { label: t("common.breadcrumbHome"), href: "/" },
    { label: t(`${landingKey}.linkLabel`) },
  ];

  const localBusinessJsonLd = buildLocalBusinessJsonLd({
    name: `Structonix — ${t(`${landingKey}.linkLabel`)}`,
    url: pageUrl,
    areaServed: geo.areaServed,
    geo,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: t("common.breadcrumbHome"), url: homeUrl },
    { name: t(`${landingKey}.linkLabel`), url: pageUrl },
  ]);
  const faqJsonLd = buildFaqJsonLd(faqItems);

  const clusterLinks = landingLinks[landingKey].map((targetKey) => ({
    href: getLandingPath(targetKey, locale),
    label: t(`${targetKey}.linkLabel`),
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Hero backgroundImage={background} size="tall">
        <div className="max-w-3xl space-y-6">
          <Breadcrumbs items={breadcrumbItems} className="text-white/80" />
          <h1 className="text-3xl font-semibold tracking-tight text-primary-foreground md:text-4xl lg:text-5xl">
            {h1}
          </h1>
          <p className="text-base leading-relaxed text-white/90 md:text-lg">
            {t(`${landingKey}.heroTagline`)}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link href="#contacto">{t("common.ctaPrimary")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <WhatsAppConversionLink
                href={company.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("common.ctaSecondary")}
              </WhatsAppConversionLink>
            </Button>
          </div>
        </div>
      </Hero>

      <AnimatedSection className="py-14 md:py-20">
        <Container className="max-w-3xl space-y-5">
          <SectionHeading title={t(`${landingKey}.introTitle`)} />
          <div className="space-y-4 leading-relaxed text-foreground/90">
            {paragraphs(t(`${landingKey}.intro`))}
          </div>
        </Container>
      </AnimatedSection>

      {sections.map((section, index) => (
        <AnimatedSection
          key={section.title}
          className={
            index % 2 === 0
              ? "border-t border-border bg-muted/40 py-12 md:py-16"
              : "border-t border-border py-12 md:py-16"
          }
        >
          <Container className="max-w-3xl space-y-4">
            <SectionHeading title={section.title} />
            <div className="space-y-4 leading-relaxed text-foreground/90">
              {paragraphs(section.body)}
            </div>
          </Container>
        </AnimatedSection>
      ))}

      <AnimatedSection className="border-t border-border py-14 md:py-20">
        <Container className="space-y-6">
          <SectionHeading title={t("common.relatedTitle")} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clusterLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[var(--radius-card)] border border-primary/30 bg-primary/5 p-5 font-medium text-primary transition-colors hover:bg-primary/10"
              >
                {link.label} <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </Container>
      </AnimatedSection>

      <AnimatedSection className="border-t border-border bg-muted/40 py-12 md:py-16">
        <Container className="space-y-6">
          <SectionHeading title={t("common.servicesTitle")} />
          <div className="flex flex-wrap gap-3">
            {SERVICE_LINKS.map((service) => (
              <Link
                key={service.key}
                href={service.href}
                className="rounded-[var(--radius-button)] border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                {tNav(service.key)}
              </Link>
            ))}
            <Link
              href="/zonas/marbella"
              className="rounded-[var(--radius-button)] border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              {t("common.zoneMarbella")}
            </Link>
            <Link
              href="/para-inversores"
              className="rounded-[var(--radius-button)] border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              {tNav("investors")}
            </Link>
          </div>
        </Container>
      </AnimatedSection>

      <FaqSection
        title={t("common.faqTitle")}
        items={faqItems}
        className="border-t border-border"
      />

      <div id="contacto" className="scroll-mt-24">
        <ContactSection backgroundImage={background} />
      </div>
    </>
  );
}
