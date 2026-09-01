export interface TeamMember {
  name: string;
  image: string;
  /** Legacy Spanish-only label kept for members not yet migrated to i18n. */
  position?: string;
  /** Translation key under `about.teamMembers.{positionKey}.position`. */
  positionKey?: string;
}

/**
 * Display order: management / specialists → Encargado → Albañil.
 * Order in this array is the source of truth for the About Us team grid.
 */
export const teamMembers: TeamMember[] = [
  // Management & specialists
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
  // Encargado
  {
    name: "Viktor Osinskiy",
    positionKey: "encargado",
    image: "/team/ViktorOsinskiy.JPG",
  },
  {
    name: "Ruslan Horbachev",
    positionKey: "encargado",
    image: "/team/RuslanHorbachev.jpg",
  },
  {
    name: "Yuriy Zabrodskiy",
    positionKey: "encargado",
    image: "/team/Yuriy_ZabrodskiyEncargadoStructonix.JPEG",
  },
  {
    name: "Ivan Mishavoda",
    positionKey: "encargado",
    image: "/team/Ivan_MishavodaEncargadoStructonix.PNG",
  },
  // Albañil
  {
    name: "Volodymir Chuenko",
    positionKey: "albanilStructonix",
    image: "/team/VovaChuenkoStructonix.JPG",
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
    name: "Anatoliy Kuzmich",
    positionKey: "albanilOficialPrimera",
    // Filename contains a literal ")" — encoded for URL safety
    image: "/team/Anatoliy_Kuzmich%29AlbanilStructonix.PNG",
  },
  {
    name: "Ruslan Asadov",
    positionKey: "albanilOficialPrimera",
    image: "/team/Ruslan_AsadovAlbanilStructonix.PNG",
  },
  {
    name: "Juan Miguel",
    positionKey: "albanil",
    image: "/team/JuanMiguelStructonixAlbanil.PNG",
  },
];
