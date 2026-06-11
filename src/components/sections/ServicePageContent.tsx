import { getTranslations } from "next-intl/server";
import type { ServiceSlug } from "@config/navigation";
import { redesignedServiceSlugs } from "@config/navigation";
import { backgrounds } from "@data/backgrounds";
import { galleries, type GalleryKey } from "@data/galleries";
import { Hero } from "@/components/sections/Hero";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { GalleryCarousel } from "@/components/ui/GalleryCarousel";
import { ImageSlider } from "@/components/ui/ImageSlider";
import { SectionHeading } from "@/components/ui/SectionHeading";

type ServicePageContentProps = {
  slug: ServiceSlug;
};

function isGalleryKey(slug: ServiceSlug): slug is GalleryKey {
  return slug in galleries;
}

function getServiceBackground(slug: ServiceSlug): string {
  const map = backgrounds.services;
  switch (slug) {
    case "estructura":
      return map.estructura;
    case "ingenieria":
      return map.ingenieria;
    case "arquitectura":
      return map.arquitectura;
    case "acabados":
      return map.acabados;
    case "carpinteria":
      return map.carpinteria;
    case "gestion-administrativa":
      return map.gestionAdministrativa;
    default:
      return "";
  }
}

export async function ServicePageContent({ slug }: ServicePageContentProps) {
  const tNav = await getTranslations("nav");
  const tServices = await getTranslations("services");

  const title = tNav(slug);
  const heroDescription = tServices(`heroDescription.${slug}`);
  const backgroundImage = getServiceBackground(slug);
  const galleryImages = isGalleryKey(slug) ? galleries[slug] : [];
  const isRedesigned = redesignedServiceSlugs.includes(slug);

  return (
    <>
      <Hero
        backgroundImage={backgroundImage}
        size={isRedesigned ? "tall" : "default"}
      >
        <div className="max-w-3xl space-y-6">
          <SectionHeading title={title} className="text-primary-foreground" />
          {heroDescription ? (
            <div className="space-y-4 text-base leading-relaxed text-white/90 md:text-lg">
              {heroDescription.split("\n\n").map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          ) : null}
        </div>
      </Hero>

      {galleryImages.length > 0 ? (
        <AnimatedSection className="pb-16 pt-8">
          {isRedesigned ? (
            <GalleryCarousel images={galleryImages} />
          ) : (
            <ImageSlider images={galleryImages} />
          )}
        </AnimatedSection>
      ) : null}
    </>
  );
}
