export interface InvestmentProject {
  id: string;
  title: string;
  image: string;
  pdf: string;
  type: string;
  area: string;
  description: string;
}

export const investments: InvestmentProject[] = [
  {
    id: "mille-de-oro",
    title: "Mille de Oro",
    image: "/investors/Parcela-en-la-Milla-de-Oro.jpg",
    pdf: "/pdfs/Mille-de-oro.pdf",
    type: "Para construir entre una y diez villas",
    // TODO: Provide exact project area when available
    area: "unknown m²",
    description: "Para construir entre una y diez villas",
  },
  {
    id: "parcela-en-guadalmina",
    title: "Parcela en Guadalmina",
    image: "/investors/Parcela-en-Guadalmina.png",
    pdf: "/pdfs/Parcela-en-Guadalmina.pdf",
    type: "Villa Primera linea de playa",
    area: "20 000 m²",
    description: "Villa Primera linea de playa",
  },
  {
    id: "urbanizacion-en-corral-nou-nacera-valencia",
    title: "Urbanizacion en Corral Nou – Náquera (Valencia)",
    image: "/investors/urbanizacionValencia.png",
    pdf: "/pdfs/Proecto-de-urbanizacion-en-Nquera%2C%20Valencia.pdf",
    type: "Para construir entre una y diez villas",
    // TODO: Provide exact project area when available
    area: "unknown m²",
    description: "Para construir entre una y diez villas",
  },
];
