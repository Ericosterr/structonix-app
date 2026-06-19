import { backgrounds } from "./backgrounds";
import { zoneGeo } from "./zones";

export const serviceLocationSlugs = [
  "construction-company-marbella",
  "villa-construction-marbella",
] as const;

export type ServiceLocationSlug = (typeof serviceLocationSlugs)[number];

/** Background image per page. Replace with real Marbella project photography for stronger EEAT. */
export const serviceLocationBackgrounds: Record<ServiceLocationSlug, string> = {
  "construction-company-marbella": backgrounds.services.estructura,
  "villa-construction-marbella": backgrounds.services.arquitectura,
};

/** Geo + areaServed for LocalBusiness / GeneralContractor schema. */
export const serviceLocationGeo: Record<
  ServiceLocationSlug,
  { lat: number; lng: number; region: string; areaServed: string }
> = {
  "construction-company-marbella": { ...zoneGeo.marbella, areaServed: "Marbella" },
  "villa-construction-marbella": { ...zoneGeo.marbella, areaServed: "Marbella" },
};
