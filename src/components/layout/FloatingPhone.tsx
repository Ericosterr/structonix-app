"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { company } from "@config/company";
import { hoverScale } from "@/lib/animations";
import {
  GOOGLE_ADS_CONVERSIONS,
  trackGoogleAdsConversion,
} from "@/lib/google-ads";
import { cn } from "@/lib/utils";

export function FloatingPhone() {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!company.phone) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className="fixed right-4 z-50 flex flex-col items-end gap-3 bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:right-6"
    >
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={t("callAria")}
          className="w-[min(calc(100vw-2rem),18rem)] rounded-[var(--radius-card)] border border-border bg-background p-4 shadow-[var(--shadow-soft)]"
        >
          <p className="text-sm font-semibold tracking-tight text-foreground">
            {company.phone}
          </p>
          <a
            href={`tel:${company.phone}`}
            className={cn(
              "mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-button)]",
              "bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            onClick={() =>
              trackGoogleAdsConversion(GOOGLE_ADS_CONVERSIONS.phoneClick)
            }
          >
            <Phone className="h-4 w-4" aria-hidden />
            {t("call")}
          </a>
        </div>
      ) : null}

      <motion.button
        type="button"
        aria-label={t("callAria")}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-soft)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => setOpen((current) => !current)}
        {...hoverScale}
      >
        <Phone className="h-6 w-6" aria-hidden />
      </motion.button>
    </div>
  );
}
