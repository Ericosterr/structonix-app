import { backgrounds } from "./backgrounds";

export const zoneSlugs = [
  "marbella",
  "benahavis",
  "estepona",
  "costa-del-sol",
] as const;

export type ZoneSlug = (typeof zoneSlugs)[number];

/** Background image per zone. Replace with real location photography for stronger EEAT. */
export const zoneBackgrounds: Record<ZoneSlug, string> = {
  marbella: backgrounds.services.arquitectura,
  benahavis: backgrounds.services.estructura,
  estepona: backgrounds.services.ingenieria,
  "costa-del-sol": backgrounds.investors,
};

/** Geo data for LocalBusiness / Place schema (areaServed + coordinates). */
export const zoneGeo: Record<
  ZoneSlug,
  { lat: number; lng: number; region: string }
> = {
  marbella: { lat: 36.5101, lng: -4.8824, region: "Málaga" },
  benahavis: { lat: 36.5236, lng: -5.0469, region: "Málaga" },
  estepona: { lat: 36.4276, lng: -5.145, region: "Málaga" },
  "costa-del-sol": { lat: 36.5, lng: -4.8, region: "Málaga" },
};

/** Sibling zones to surface as related areas (excludes the current zone at render time). */
export const relatedZones: ZoneSlug[] = [
  "marbella",
  "benahavis",
  "estepona",
  "costa-del-sol",
];
