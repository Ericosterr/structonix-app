import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { site } from "@config/site";
import { getLandingPath } from "@data/landings";
import { zoneSectionImages } from "@data/zone-section-images";
import { relatedZones, zoneBackgrounds, zoneGeo, type ZoneSlug } from "@data/zones";
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
import { cn } from "@/lib/utils";

type ZonePageContentProps = {
  zona: ZoneSlug;
  locale: Locale;
};

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

export async function ZonePageContent({ zona, locale }: ZonePageContentProps) {
  const t = await getTranslations("zones");
  const tNav = await getTranslations("nav");

  const name = t(`${zona}.name`);
  const faqItems = t.raw(`${zona}.faq`) as FaqItem[];
  const background = zoneBackgrounds[zona];
  const geo = zoneGeo[zona];

  const pageUrl = getLocalizedUrl(site.baseUrl, locale, `/zonas/${zona}`);
  const homeUrl = getLocalizedUrl(site.baseUrl, locale, "/");

  const breadcrumbItems = [
    { label: t("common.breadcrumbHome"), href: "/" },
    { label: name },
  ];

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: t("common.breadcrumbHome"), url: homeUrl },
    { name, url: pageUrl },
  ]);
  const faqJsonLd = buildFaqJsonLd(faqItems);
  const localBusinessJsonLd = buildLocalBusinessJsonLd({
    name: `Structonix — ${name}`,
    url: pageUrl,
    areaServed: name,
    geo,
  });

  const otherZones = relatedZones.filter((zone) => zone !== zona);

  const marbellaServiceLinks =
    zona === "marbella"
      ? await (async () => {
          const tLandings = await getTranslations("landings");
          return (
            [
              "constructora-marbella",
              "villa-construction-marbella",
              "construction-company-marbella",
            ] as const
          ).map((key) => ({
            href: getLandingPath(key, locale),
            label: tLandings(`${key}.linkLabel`),
          }));
        })()
      : [];

  const sections = [
    {
      key: "market",
      title: t("common.marketTitle"),
      body: t(`${zona}.market`),
      image: zoneSectionImages.market,
    },
    {
      key: "architecture",
      title: t("common.architectureTitle"),
      body: t(`${zona}.architecture`),
      image: zoneSectionImages.architecture,
    },
    {
      key: "engineering",
      title: t("common.engineeringTitle"),
      body: t(`${zona}.engineering`),
      image: zoneSectionImages.engineering,
    },
    {
      key: "projectManagement",
      title: t("common.pmTitle"),
      body: t(`${zona}.projectManagement`),
      image: zoneSectionImages.projectManagement,
    },
    {
      key: "investment",
      title: t("common.investmentTitle"),
      body: t(`${zona}.investment`),
      image: zoneSectionImages.investment,
    },
  ] as const;

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
            {t(`${zona}.h1`)}
          </h1>
          <p className="text-base leading-relaxed text-white/90 md:text-lg">
            {t(`${zona}.heroTagline`)}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link href="#contacto">{t("common.ctaButton")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/para-inversores">{tNav("investors")}</Link>
            </Button>
          </div>
        </div>
      </Hero>

      <AnimatedSection className="py-14 md:py-20">
        <Container className="max-w-3xl space-y-5">
          <SectionHeading title={t(`${zona}.overviewTitle`)} />
          <div className="space-y-4 leading-relaxed text-foreground/90">
            {paragraphs(t(`${zona}.overview`))}
          </div>
        </Container>
      </AnimatedSection>

      {sections.map((section, index) => {
        const imageFirst = index % 2 === 1;

        return (
          <AnimatedSection
            key={section.key}
            className="border-t border-border py-12 md:py-16"
          >
            <Container>
              <div
                className={cn(
                  "grid items-center gap-8 lg:grid-cols-2 lg:gap-12",
                  imageFirst && "lg:[&>*:first-child]:order-2",
                )}
              >
                <div className="space-y-4">
                  <SectionHeading title={section.title} />
                  <div className="space-y-4 leading-relaxed text-foreground/90">
                    {paragraphs(section.body)}
                  </div>
                </div>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-soft)]">
                  <Image
                    src={section.image}
                    alt={section.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            </Container>
          </AnimatedSection>
        );
      })}

      <AnimatedSection className="border-t border-border bg-muted/40 py-14 md:py-20">
        <Container className="space-y-6">
          <SectionHeading title={t("common.servicesTitle")} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICE_LINKS.map((service) => (
              <Link
                key={service.key}
                href={service.href}
                className="rounded-[var(--radius-card)] border border-border bg-background p-5 font-medium shadow-[var(--shadow-soft)] transition-colors hover:bg-muted"
              >
                {tNav(service.key)} <span aria-hidden="true">→</span>
              </Link>
            ))}
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
          <SectionHeading title={t("common.otherAreas")} />
          <div className="flex flex-wrap gap-3">
            {otherZones.map((zone) => (
              <Link
                key={zone}
                href={`/zonas/${zone}`}
                className="rounded-[var(--radius-button)] border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                {t(`${zone}.name`)}
              </Link>
            ))}
            {marbellaServiceLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[var(--radius-button)] border border-primary/40 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/blog"
              className="rounded-[var(--radius-button)] border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              {tNav("blog")}
            </Link>
          </div>
        </Container>
      </AnimatedSection>

      <div id="contacto" className="scroll-mt-24">
        <ContactSection backgroundImage={background} />
      </div>
    </>
  );
}
