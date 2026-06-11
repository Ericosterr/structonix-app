"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { site } from "@config/site";
import { heroBrandNameReveal, heroLogoReveal } from "@/lib/animations";
import { cn } from "@/lib/utils";

export function HomeHeroBranding() {
  return (
    <div
      className={cn(
        "flex max-w-full flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6 md:gap-8",
      )}
    >
      <motion.div
        variants={heroLogoReveal}
        initial="hidden"
        animate="visible"
        className="shrink-0"
      >
        <Image
          src={site.assets.logoWhite}
          alt="Structonix"
          width={240}
          height={64}
          className="h-auto w-32 sm:w-36 md:w-40 lg:w-44"
          style={{ height: "auto" }}
          priority
        />
      </motion.div>

      <motion.div
        variants={heroBrandNameReveal}
        initial="hidden"
        animate="visible"
        className="min-w-0 text-center font-sans sm:text-left"
      >
        <span className="block text-[2.25rem] font-bold uppercase leading-none text-white sm:text-5xl md:text-6xl lg:text-7xl">
          STRUCTONIX
        </span>
        <span className="mt-1 block text-lg font-bold uppercase leading-none text-white sm:text-2xl md:text-3xl lg:text-[2rem]">
          SISTEM GLOBAL, S.L.
        </span>
      </motion.div>
    </div>
  );
}
