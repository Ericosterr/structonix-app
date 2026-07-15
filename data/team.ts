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
    position: "CEO de Structonix",
    image: "/team/OlegFounderStructonix.jpg",
  },
  {
    name: "Dmitri Volkov",
    position: "Jefe de obra Structonix",
    image: "/team/DmitriyStructonix_11.jpg",
  },
  {
    name: "Viktoria Bolshakova",
    position: "Coordinacion y seguridad Structonix",
    image: "/team/ViktoriaStructonix.jpg",
  },
  {
    name: "Vasyl Matsur",
    position: "Jefe de obra Structonix",
    image: "/team/VasylMatsurStructonix.jpeg",
  },
  {
    name: "Denis Yelnikov",
    position: "Ingeniero, energias renovables",
    image: "/team/DenisYelnikov.webp",
  },
  {
    name: "Viktor Osinskiy",
    position: "Encargado Structonix",
    image: "/team/ViktorOsinskiy.JPG",
  },
  {
    name: "Ruslan Horbachev",
    position: "Encargado Structonix",
    image: "/team/RuslanHorbachev.jpg",
  },
  {
    name: "Smuk Volodimir",
    position: "Maquinista Structonix",
    image: "/team/VolodimirSmukStructonix.jpg",
  },
  {
    name: "Antonio Vicente Barona",
    position: "Arquitecto Structonix",
    image: "/team/AntonioVicenteBarona.jpg",
  },
  {
    name: "Irene Castro Tamarit",
    position: "Tecnico en arquitectura Structonix",
    image: "/team/IreneCastroTamarit.jpeg",
  },
  {
    name: "Alexey Kuznetsov",
    position: "Director de Technologias de la informacion",
    image: "/team/StructonixHeadofITjpg.jpg",
  },
  {
    name: "Oleksandr Besarab",
    position: "Albanil de Structonix",
    image: "/team/Oleksandr%20Besarab.JPG",
  },
  {
    name: "Volodymir Chuenko",
    position: "Albanil de Structonix",
    image: "/team/VolodymirChuenko.jpg",
  },
  {
    name: "Andrei Chervatiuk",
    position: "Albanil de Structonix",
    image: "/team/AndreiChervatiukAlbanilStructonix.jpeg",
  },
  {
    name: "Vitalyi Voytenko",
    position: "Albanil de Structonix",
    image: "/team/VitalyiVoytenkoalbanilStructonix.jpg",
  },
  {
    name: "Oleksander Dudchenko",
    position: "Albanil de Structonix",
    image: "/team/OleksanderDudchenkoAlbanilStructonix.JPG",
  },
  {
    name: "Tolkachev Yakiv",
    position: "Albanil de Structonix",
    image: "/team/TolkachevYakivAlbanilStructonix.JPG",
  },
  {
    name: "Oleg Saranchuk",
    positionKey: "olegSaranchuk",
    image: "/team/OlegSaranchuk.JPG",
  },
];
