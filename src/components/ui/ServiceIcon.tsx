"use client";

import {
  Hammer,
  Layers,
  Paintbrush,
  PenTool,
  Settings,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import type { GalleryKey } from "@data/galleries";
import { serviceIcons } from "@data/service-icons";
import { cn } from "@/lib/utils";

const lucideIcons: Record<GalleryKey, LucideIcon> = {
  estructura: Layers,
  ingenieria: Settings,
  arquitectura: PenTool,
  acabados: Paintbrush,
  carpinteria: Hammer,
};

type ServiceIconProps = {
  service: GalleryKey;
  label: string;
  className?: string;
};

export function ServiceIcon({ service, label, className }: ServiceIconProps) {
  const iconSrc = serviceIcons[service];

  if (iconSrc) {
    return (
      <Image
        src={iconSrc}
        alt={label}
        width={64}
        height={64}
        className={cn("h-16 w-16 object-contain", className)}
      />
    );
  }

  const LucideIcon = lucideIcons[service];

  return (
    <div
      className={cn(
        "flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary",
        className,
      )}
    >
      {/* TODO: replace with image icon asset from /public/icons */}
      <LucideIcon className="h-8 w-8" aria-hidden="true" />
    </div>
  );
}
