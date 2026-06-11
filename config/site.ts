export const site = {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://structonixsistem.com",
  containerMaxWidth: 1440,
  cardRadius: 16,
  buttonRadius: 12,
  cif: "B24937930",
  structureRatePerSqm: 650,
  constructionRates: {
    standard: 1650,
    premium: 2300,
  },
  carouselAutoplayDelay: 5000,
  assets: {
    // TODO: spec asset StructonixLogoHeader.png not present — using CompanyLogo.jpg
    logo: "/logo/CompanyLogo.jpg",
    companyLogo: "/logo/CompanyLogo.jpg",
    logoWhite: "/logo/StructonixLogoWhite.jpg",
    whatsappIcon: "/icons/whatsapp-icon.png",
    ogImage: "/og/structonix-og.jpg",
  },
} as const;
