"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { site } from "@config/site";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GalleryCarouselProps = {
  images: readonly string[];
  className?: string;
};

export function GalleryCarousel({ images, className }: GalleryCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "center", loop: true, containScroll: "trimSnaps" },
    [Autoplay({ delay: site.carouselAutoplayDelay, stopOnInteraction: false })],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (images.length === 0) {
    return (
      <div className={cn("flex h-64 items-center justify-center bg-muted", className)}>
        {/* TODO: no gallery images configured */}
      </div>
    );
  }

  return (
    <div className={cn("relative w-full px-4 py-8 md:px-8", className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="-ml-4 flex">
          {images.map((src, index) => {
            const isActive = index === selectedIndex;
            return (
              <div
                key={src}
                className="min-w-0 flex-[0_0_88%] pl-4 sm:flex-[0_0_72%] lg:flex-[0_0_48%]"
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1 : 0.92,
                    opacity: isActive ? 1 : 0.55,
                  }}
                  transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
                  className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-soft)]"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 88vw, (max-width: 1024px) 72vw, 48vw"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="bg-primary text-white hover:bg-primary/90"
          onClick={scrollPrev}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="bg-primary text-white hover:bg-primary/90"
          onClick={scrollNext}
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
