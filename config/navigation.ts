import { zoneSlugs } from "@data/zones";

export type ServiceSlug =
  | "estructura"
  | "ingenieria"
  | "arquitectura"
  | "acabados"
  | "carpinteria"
  | "gestion-administrativa";

export type NavItem = {
  key: string;
  href: string;
  external?: boolean;
};

export const serviceSlugs: ServiceSlug[] = [
  "estructura",
  "ingenieria",
  "arquitectura",
  "acabados",
  "carpinteria",
  "gestion-administrativa",
];

export const mainNavItems: NavItem[] = [
  { key: "about", href: "/quienes-somos" },
  { key: "investors", href: "/para-inversores" },
  { key: "blog", href: "/blog" },
];

/**
 * Single source of truth for the Areas/Zones navigation. Generated from the
 * same `zoneSlugs` that produce the /zonas/[zona] pages, so adding a new zone
 * automatically adds it to the header and footer navigation.
 */
export const zoneNavItems: NavItem[] = zoneSlugs.map((slug) => ({
  key: slug,
  href: `/zonas/${slug}`,
}));

export const serviceNavItems: NavItem[] = serviceSlugs.map((slug) => ({
  key: slug,
  href: `/servicios/${slug}`,
}));

export const footerSocialItems = [
  { key: "instagram", href: "instagram", external: true },
  { key: "youtube", href: "youtube", external: true },
] as const;

/** Home hero shortcuts and services grid (Phase 3 design revision). */
export const homeFeaturedServices: ServiceSlug[] = [
  "estructura",
  "ingenieria",
  "acabados",
  "arquitectura",
  "carpinteria",
  "gestion-administrativa",
];

/** Service pages with redesigned hero + gallery carousel. */
export const redesignedServiceSlugs: ServiceSlug[] = [
  "estructura",
  "ingenieria",
  "arquitectura",
  "acabados",
  "carpinteria",
  "gestion-administrativa",
];
