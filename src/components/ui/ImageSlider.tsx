"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { site } from "@config/site";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImageSliderProps = {
  images: readonly string[];
  className?: string;
};

export function ImageSlider({ images, className }: ImageSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: site.carouselAutoplayDelay, stopOnInteraction: false }),
  ]);
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
    <div className={cn("relative", className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((src, index) => (
            <div key={src} className="relative min-w-0 flex-[0_0_100%]">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="100vw"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2"
        onClick={scrollPrev}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2"
        onClick={scrollNext}
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {images.map((src, index) => (
          <span
            key={src}
            className={cn(
              "h-2 w-2 rounded-full bg-white/50",
              index === selectedIndex && "bg-white",
            )}
          />
        ))}
      </div>
    </div>
  );
}
