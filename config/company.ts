export const company = {
  companyName: "Structonix Sistem Global S.L.",
  legalName: "Structonix Sistem Global S.L.",
  phone: "+34604427398",
  email: "info@structonixsistem.com",
  /** Display string used in footer/contact UI. */
  address: "Calle Teide, 3/2 Benalmadena, Malaga 29631",
  /** Structured HQ address for schema (matches published company details). */
  addressStructured: {
    streetAddress: "Calle Teide, 3/2",
    addressLocality: "Benalmádena",
    addressRegion: "Málaga",
    postalCode: "29631",
    addressCountry: "ES",
  },
  /** Approximate HQ coordinates (Benalmádena) — not a Marbella branch office. */
  geo: {
    lat: 36.5988,
    lng: -4.5167,
  },
  areaServed: [
    "Marbella",
    "Costa del Sol",
    "Benalmádena",
    "Málaga",
    "Mijas",
    "Fuengirola",
    "Estepona",
    "Benahavís",
    "Torremolinos",
  ],
  availableLanguage: ["es", "en", "ru"],
  whatsapp: "https://wa.me/34645018598",
  instagram:
    "https://www.instagram.com/structonixglobal?igsi=MTZwbW5zYWVwbmdieA%3D%3D&utm_source=qr",
  youtube: "https://www.youtube.com/@StructonixGlobal",
  /** Careers / recruitment WhatsApp. */
  careersWhatsappPhone: "34645018598",
  careersEmail: "structonixglobal@gmail.com",
  // TODO: Provide final Facebook URL
  facebook: "",
  // TODO: Replace with Google Maps URL when available (currently a website link)
  googleMaps: "https://structonixsistem.com",
} as const;
