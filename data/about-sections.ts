/** About page content section order (design revision). Team cards render separately at page bottom. */
export const aboutContentSectionKeys = [
  "sobreStructonix",
  "equipoStructonix",
  "gestionAdministrativa",
  "controlDeCalidad",
  "arquitecturaEInnovacion",
  "structonixSistemGlobal",
] as const;

export type AboutSectionKey = (typeof aboutContentSectionKeys)[number];
