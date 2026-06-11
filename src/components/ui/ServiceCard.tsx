"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import type { GalleryKey } from "@data/galleries";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { ServiceIconAdmin } from "@/components/ui/ServiceIconAdmin";
import { hoverScale } from "@/lib/animations";
import { cn } from "@/lib/utils";

type ServiceCardProps = {
  href: string;
  label: string;
  service: GalleryKey | "gestion-administrativa";
  className?: string;
  variant?: "light" | "dark";
};

export function ServiceCard({
  href,
  label,
  service,
  className,
  variant = "light",
}: ServiceCardProps) {
  const isDark = variant === "dark";

  return (
    <motion.div {...hoverScale} className={cn("flex flex-col items-center gap-3", className)}>
      <Link
        href={href}
        className={cn(
          "flex w-full flex-col items-center gap-3 rounded-[var(--radius-card)] p-6 text-center shadow-[var(--shadow-soft)] transition-colors",
          isDark
            ? "border border-white/15 bg-white/10 hover:bg-white/15"
            : "bg-background hover:bg-muted",
        )}
      >
        {service === "gestion-administrativa" ? (
          <ServiceIconAdmin
            className={cn(isDark && "bg-white/15 text-white")}
          />
        ) : (
          <ServiceIcon
            service={service}
            label={label}
            className={cn(isDark && "bg-white/15 text-white [&_svg]:text-white")}
          />
        )}
        <span
          className={cn(
            "text-sm font-medium",
            isDark ? "text-white" : "text-foreground",
          )}
        >
          {label}
        </span>
      </Link>
    </motion.div>
  );
}
