"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { company } from "@config/company";
import { site } from "@config/site";
import { hoverScale } from "@/lib/animations";

export function FloatingWhatsApp() {
  const t = useTranslations("common");

  if (!company.whatsapp) {
    return null;
  }

  return (
    <motion.a
      href={company.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsapp")}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[var(--shadow-soft)]"
      {...hoverScale}
    >
      <Image
        src={site.assets.whatsappIcon}
        alt={t("whatsapp")}
        width={28}
        height={28}
      />
    </motion.a>
  );
}
