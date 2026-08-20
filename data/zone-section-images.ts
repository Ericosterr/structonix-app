import { backgrounds } from "./backgrounds";

/**
 * Images for zone page content sections (market → investment).
 * Alternating text/image layout uses these assets from existing service galleries.
 */
export const zoneSectionImages = {
  market: "/services/estructura/concrete-structure-construction-costa-del-sol.jpg",
  architecture: "/services/arquitectura/arquitectura-2.jpg",
  engineering: "/services/ingenieria/ingenieria-2.webp",
  projectManagement:
    "/services/estructura/concrete-column-formwork-structural-construction-costa-del-sol.jpg",
  investment: "/services/arquitectura/arquitectura-5.jpg",
  overview: backgrounds.services.estructura,
} as const;

export type ZoneSectionImageKey = keyof typeof zoneSectionImages;
