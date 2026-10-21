"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import type { GalleryKey } from "@data/galleries";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { ServiceIconAdmin } from "@/components/ui/ServiceIconAdmin";
import { hoverScale } from "@/lib/animations";
import { cn } from "@/lib/utils";

type ServiceShortcutButtonProps = {
  href: string;
  label: string;
  service: GalleryKey | "gestion-administrativa";
  className?: string;
};

export function ServiceShortcutButton({
  href,
  label,
  service,
  className,
}: ServiceShortcutButtonProps) {
  return (
    <motion.div {...hoverScale} className={cn("h-full", className)}>
      <Link
        href={href}
        className="flex h-full min-h-[7.5rem] flex-col items-center justify-center gap-2 rounded-[var(--radius-button)] border border-white/20 bg-white/10 px-3 py-4 text-center backdrop-blur-sm transition-colors hover:bg-white/20 sm:min-h-[8rem]"
      >
        {service === "gestion-administrativa" ? (
          <ServiceIconAdmin className="bg-white/15 text-white" />
        ) : (
          <ServiceIcon
            service={service}
            label={label}
            className="bg-white/15 text-white [&_svg]:text-white"
          />
        )}
        <span className="flex min-h-[2.5em] items-center justify-center text-xs font-medium leading-tight text-white sm:text-sm">
          {label}
        </span>
      </Link>
    </motion.div>
  );
}
