"use client";

import { useTranslations } from "next-intl";
import { homeFeaturedServices } from "@config/navigation";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { Container } from "@/components/ui/Container";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { GalleryKey } from "@data/galleries";

export function HomeServices() {
  const tNav = useTranslations("nav");
  const tHome = useTranslations("home");

  return (
    <AnimatedSection className="bg-primary py-16 md:py-20">
      <Container className="space-y-8">
        <SectionHeading title={tHome("servicesTitle")} className="text-white" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {homeFeaturedServices.map((slug) => (
            <ServiceCard
              key={slug}
              href={`/servicios/${slug}`}
              label={tNav(slug)}
              service={
                slug === "gestion-administrativa"
                  ? "gestion-administrativa"
                  : (slug as GalleryKey)
              }
              variant="dark"
            />
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
