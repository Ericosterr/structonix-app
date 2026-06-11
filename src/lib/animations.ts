import type { Variants, Transition } from "framer-motion";

export const defaultTransition: Transition = {
  duration: 0.45,
  ease: [0.25, 0.1, 0.25, 1],
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: defaultTransition,
  },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: defaultTransition,
  },
};

const heroEase: Transition["ease"] = [0.25, 0.1, 0.25, 1];

export const heroLogoReveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: heroEase },
  },
};

export const heroBrandNameReveal: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, delay: 0.2, ease: heroEase },
  },
};

export const hoverScale = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.3 },
};

export const hoverZoom = {
  whileHover: { scale: 1.06 },
  transition: { duration: 0.35 },
};

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.3 },
  },
};
