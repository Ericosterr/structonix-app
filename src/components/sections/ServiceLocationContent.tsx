import { getTranslations } from "next-intl/server";
import { company } from "@config/company";
import { site } from "@config/site";
import {
  serviceLocationBackgrounds,
  serviceLocationGeo,
  type ServiceLocationSlug,
} from "@data/service-locations";
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

type ServiceLocationContentProps = {
  service: ServiceLocationSlug;
  locale: Locale;
};

type StatItem = { value: string; label: string };
type CardItem = { title: string; text: string };

const SERVICE_LINKS = [
  { href: "/servicios/arquitectura", key: "arquitectura" },
  { href: "/servicios/ingenieria", key: "ingenieria" },
  { href: "/servicios/estructura", key: "estructura" },
  { href: "/servicios/gestion-administrativa", key: "gestion-administrativa" },
] as const;

const RELATED_LINKS = [
  { href: "/zonas/marbella", key: "zoneMarbella" },
  { href: "/zonas/costa-del-sol", key: "zoneCosta" },
  { href: "/para-inversores", key: "investors" },
] as const;

function paragraphs(text: string) {
  return text.split("\n\n").map((paragraph) => (
    <p key={paragraph.slice(0, 32)}>{paragraph}</p>
  ));
}

export async function ServiceLocationContent({
  service,
  locale,
}: ServiceLocationContentProps) {
  const t = await getTranslations("serviceLocations");
  const tNav = await getTranslations("nav");

  const h1 = t(`${service}.h1`);
  const breadcrumbLabel = t(`${service}.breadcrumb`);
  const background = serviceLocationBackgrounds[service];
  const geo = serviceLocationGeo[service];

  const trust = t.raw(`${service}.trust`) as StatItem[];
  const process = t.raw(`${service}.process`) as CardItem[];
  const why = t.raw(`${service}.why`) as CardItem[];
  const faqItems = t.raw(`${service}.faq`) as FaqItem[];

  const pageUrl = getLocalizedUrl(site.baseUrl, locale, `/services/${service}`);
  const homeUrl = getLocalizedUrl(site.baseUrl, locale, "/");

  const breadcrumbItems = [
    { label: t("common.breadcrumbHome"), href: "/" },
    { label: breadcrumbLabel },
  ];

  const localBusinessJsonLd = buildLocalBusinessJsonLd({
    name: `Structonix — ${breadcrumbLabel}`,
    url: pageUrl,
    areaServed: geo.areaServed,
    geo,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: t("common.breadcrumbHome"), url: homeUrl },
    { name: breadcrumbLabel, url: pageUrl },
  ]);
  const faqJsonLd = buildFaqJsonLd(faqItems);

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
            {t(`${service}.heroTagline`)}
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
              <a href={company.whatsapp} target="_blank" rel="noopener noreferrer">
                {t("common.ctaSecondary")}
              </a>
            </Button>
          </div>
        </div>
      </Hero>

      <AnimatedSection className="py-14 md:py-20">
        <Container className="max-w-3xl space-y-5">
          <SectionHeading title={t(`${service}.introTitle`)} />
          <div className="space-y-4 leading-relaxed text-foreground/90">
            {paragraphs(t(`${service}.intro`))}
          </div>
        </Container>
      </AnimatedSection>

      <AnimatedSection className="border-t border-border bg-muted/40 py-14 md:py-20">
        <Container className="space-y-8">
          <SectionHeading title={t("common.trustTitle")} className="text-center" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trust.map((item) => (
              <div
                key={item.label}
                className="rounded-[var(--radius-card)] border border-border bg-background p-6 text-center shadow-[var(--shadow-soft)]"
              >
                <div className="text-2xl font-semibold text-primary md:text-3xl">
                  {item.value}
                </div>
                <p className="mt-2 text-sm leading-snug text-muted-foreground">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </AnimatedSection>

      <AnimatedSection className="border-t border-border py-14 md:py-20">
        <Container className="space-y-8">
          <SectionHeading title={t("common.processTitle")} />
          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {process.map((step, index) => (
              <li
                key={step.title}
                className="rounded-[var(--radius-card)] border border-border p-6"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </AnimatedSection>

      <AnimatedSection className="border-t border-border bg-muted/40 py-14 md:py-20">
        <Container className="space-y-8">
          <SectionHeading title={t("common.whyTitle")} />
          <div className="grid gap-5 md:grid-cols-2">
            {why.map((item) => (
              <div
                key={item.title}
                className="rounded-[var(--radius-card)] border border-border bg-background p-6 shadow-[var(--shadow-soft)]"
              >
                <h3 className="font-medium text-primary">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </AnimatedSection>

      <AnimatedSection className="border-t border-border py-14 md:py-20">
        <Container className="max-w-3xl space-y-5">
          <SectionHeading title={t("common.integrationTitle")} />
          <div className="space-y-4 leading-relaxed text-foreground/90">
            {paragraphs(t(`${service}.integration`))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {SERVICE_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="rounded-[var(--radius-card)] border border-border p-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                {tNav(link.key)} <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </Container>
      </AnimatedSection>

      <AnimatedSection className="border-t border-border bg-muted/40 py-14 md:py-20">
        <Container className="max-w-3xl space-y-5">
          <SectionHeading title={t("common.turnkeyTitle")} />
          <div className="space-y-4 leading-relaxed text-foreground/90">
            {paragraphs(t(`${service}.turnkey`))}
          </div>
        </Container>
      </AnimatedSection>

      <AnimatedSection className="relative overflow-hidden border-t border-border py-16 md:py-20">
        <div className="absolute inset-0 bg-primary" />
        <Container className="relative z-10 flex flex-col items-center gap-6 text-center text-white">
          <h2 className="max-w-2xl text-2xl font-semibold md:text-3xl">
            {t(`${service}.ctaBlockTitle`)}
          </h2>
          <p className="max-w-2xl leading-relaxed text-white/90">
            {t(`${service}.ctaBlockText`)}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link href="#contacto">{t("common.ctaPrimary")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <a href={company.whatsapp} target="_blank" rel="noopener noreferrer">
                {t("common.ctaSecondary")}
              </a>
            </Button>
          </div>
        </Container>
      </AnimatedSection>

      <FaqSection
        title={t("common.faqTitle")}
        items={faqItems}
        className="border-t border-border"
      />

      <AnimatedSection className="border-t border-border py-12 md:py-16">
        <Container className="space-y-6">
          <SectionHeading title={t("common.relatedTitle")} />
          <div className="flex flex-wrap gap-3">
            {RELATED_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="rounded-[var(--radius-button)] border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                {t(`common.${link.key}`)}
              </Link>
            ))}
          </div>
        </Container>
      </AnimatedSection>

      <div id="contacto" className="scroll-mt-24">
        <ContactSection backgroundImage={background} />
      </div>
    </>
  );
}
