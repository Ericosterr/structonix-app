"use client";

import { motion } from "framer-motion";
import { slideUp } from "@/lib/animations";
import { cn } from "@/lib/utils";

type AnimatedSectionProps = {
  children: React.ReactNode;
  className?: string;
};

export function AnimatedSection({ children, className }: AnimatedSectionProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={slideUp}
      className={cn(className)}
    >
      {children}
    </motion.section>
  );
}
