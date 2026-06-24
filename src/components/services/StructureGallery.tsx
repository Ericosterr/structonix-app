import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { site } from "@config/site";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Real Structonix structural-works photos. Paths are locale-independent; the
 * `id` keys the localized alt text and caption in the `structureGallery`
 * namespace, so a single component serves ES/EN/RU.
 *
 * Filenames are lowercase, kebab-case, ASCII and `.jpg` (SEO- and Linux-safe).
 */
const structureGalleryImages = [
  {
    id: "reinforcedFoundations",
    src: "/services/estructura/estructura-hormigon-armado-costa-del-sol.jpg",
  },
  {
    id: "concreteStructure",
    src: "/services/estructura/concrete-structure-construction-costa-del-sol.jpg",
  },
  {
    id: "slabPouring",
    src: "/services/estructura/concrete-slab-pouring-structural-works-costa-del-sol.jpg",
  },
  {
    id: "columnFormwork",
    src: "/services/estructura/concrete-column-formwork-structural-construction-costa-del-sol.jpg",
  },
  {
    id: "aerialSlab",
    src: "/services/estructura/aerial-concrete-slab-construction-costa-del-sol.jpg",
  },
] as const;

const HEADING_ID = "structure-gallery-heading";

/**
 * Project gallery for the Estructura / Structure / Конструкции service page.
 *
 * CLS strategy: each image renders with `fill` inside a fixed `aspect-[4/3]`
 * container (the same pattern as `GalleryCarousel`). The container reserves the
 * layout box before load, so there is no layout shift and no risk of distorting
 * photos with guessed intrinsic dimensions.
 */
export async function StructureGallery() {
  const t = await getTranslations("structureGallery");

  const items = structureGalleryImages.map((image) => ({
    id: image.id,
    src: image.src,
    absoluteUrl: `${site.baseUrl}${image.src}`,
    alt: t(`images.${image.id}.alt`),
    caption: t(`images.${image.id}.caption`),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: t("title"),
    description: t("intro"),
    image: items.map((item) => ({
      "@type": "ImageObject",
      contentUrl: item.absoluteUrl,
      url: item.absoluteUrl,
      name: item.caption,
      description: item.alt,
    })),
  };

  return (
    <section
      aria-labelledby={HEADING_ID}
      className="bg-background py-16 md:py-20"
    >
      <Container className="space-y-8">
        <div className="max-w-3xl space-y-4">
          <SectionHeading id={HEADING_ID} title={t("title")} />
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("intro")}
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <figure className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-card shadow-[var(--shadow-soft)]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <figcaption className="px-4 py-3 text-sm text-muted-foreground">
                  {item.caption}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
