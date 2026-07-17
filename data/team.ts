export interface TeamMember {
  name: string;
  image: string;
  /** Legacy Spanish-only label kept for members not yet migrated to i18n. */
  position?: string;
  /** Translation key under `about.teamMembers.{positionKey}.position`. */
  positionKey?: string;
}

export const teamMembers: TeamMember[] = [
  {
    name: "Oleg Nazarov",
    positionKey: "olegNazarov",
    image: "/team/OlegFounderStructonix.jpg",
  },
  {
    name: "Dmitri Volkov",
    positionKey: "dmitriVolkov",
    image: "/team/DmitriyStructonix_11.jpg",
  },
  {
    name: "Viktoria Bolshakova",
    positionKey: "viktoriaBolshakova",
    image: "/team/ViktoriaStructonix.jpg",
  },
  {
    name: "Vasyl Matsur",
    positionKey: "vasylMatsur",
    image: "/team/VasylMatsurStructonix.jpeg",
  },
  {
    name: "Oleg Saranchuk",
    positionKey: "olegSaranchuk",
    image: "/team/OlegSaranchuk.JPG",
  },
  {
    name: "Denis Yelnikov",
    positionKey: "denisYelnikov",
    image: "/team/DenisYelnikov.webp",
  },
  {
    name: "Viktor Osinskiy",
    positionKey: "viktorOsinskiy",
    image: "/team/ViktorOsinskiy.JPG",
  },
  {
    name: "Ruslan Horbachev",
    positionKey: "ruslanHorbachev",
    image: "/team/RuslanHorbachev.jpg",
  },
  {
    name: "Smuk Volodimir",
    positionKey: "smukVolodimir",
    image: "/team/VolodimirSmukStructonix.jpg",
  },
  {
    name: "Antonio Vicente Barona",
    positionKey: "antonioVicenteBarona",
    image: "/team/AntonioVicenteBarona.jpg",
  },
  {
    name: "Irene Castro Tamarit",
    positionKey: "ireneCastroTamarit",
    image: "/team/IreneCastroTamarit.jpeg",
  },
  {
    name: "Alexey Kuznetsov",
    positionKey: "alexeyKuznetsov",
    image: "/team/StructonixHeadofITjpg.jpg",
  },
  {
    name: "Oleksandr Besarab",
    positionKey: "albanilStructonix",
    image: "/team/Oleksandr%20Besarab.JPG",
  },
  {
    name: "Volodymir Chuenko",
    positionKey: "albanilStructonix",
    image: "/team/VolodymirChuenko.jpg",
  },
  {
    name: "Andrei Chervatiuk",
    positionKey: "albanilStructonix",
    image: "/team/AndreiChervatiukAlbanilStructonix.jpeg",
  },
  {
    name: "Vitalyi Voytenko",
    positionKey: "albanilStructonix",
    image: "/team/VitalyiVoytenkoalbanilStructonix.jpg",
  },
  {
    name: "Oleksander Dudchenko",
    positionKey: "albanilStructonix",
    image: "/team/OleksanderDudchenkoAlbanilStructonix.JPG",
  },
  {
    name: "Tolkachev Yakiv",
    positionKey: "albanilStructonix",
    image: "/team/TolkachevYakivAlbanilStructonix.JPG",
  },
];
