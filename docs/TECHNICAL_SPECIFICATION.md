\# STRUCTONIX WEBSITE — TECHNICAL SPECIFICATION (v1.0)



\## 1. PROJECT OVERVIEW



\### Project Name



Structonix Sistem Global S.L.



\### Purpose



Develop a modern multilingual corporate website for a construction, engineering and architecture company operating in Spain.



The website must present company services, investor opportunities, calculators, company information and contact channels.



\### Primary Language



Spanish (default)



\### Additional Languages



\* English

\* Russian



\### Target Audience



\* Private clients

\* Property developers

\* Investors

\* Construction partners



\---



\# 2. TECHNOLOGY STACK



Use the following stack:



\* Next.js 15 (App Router)

\* TypeScript

\* Tailwind CSS

\* Shadcn/UI

\* Framer Motion

\* next-intl

\* React Hook Form

\* Zod

\* Embla Carousel

\* Lucide React

\* Resend

\* Google reCAPTCHA v3

\* Vercel



\---



\# 3. DESIGN SYSTEM



\### Colors



Primary:

\#0F016A



Secondary:

\#FFFFFF



Neutral:

\#F5F5F5

\#EAEAEA



\### Typography



Font Family:

Montserrat



\### Style Direction



The website must feel:



\* Premium

\* Modern

\* Engineering-focused

\* Minimalistic

\* Luxury construction company

\* Spacious layout

\* Professional



\### UI Rules



Container Width:

1440px



Card Radius:

16px



Button Radius:

12px



Soft Shadows



Responsive Layout:



\* Mobile

\* Tablet

\* Desktop



\---



\# 4. ANIMATIONS



Use Framer Motion.



Required animations:



\* Fade In

\* Slide Up

\* Hover Scale

\* Hover Zoom

\* Smooth page transitions



Animation duration:

300–600ms



\---



\# 5. IMAGE REQUIREMENTS



Use Next.js Image component.



Requirements:



\* Lazy loading

\* WebP support

\* Responsive images

\* Optimized performance



\---



\# 6. INTERNATIONALIZATION



Use next-intl.



Locales:



\* es (default)

\* en

\* ru



Translation files:



/messages/es.json

/messages/en.json

/messages/ru.json



All visible texts must come from translation files.



\---



\# 7. SITE STRUCTURE



/

├── Home

├── Quienes Somos

├── Servicios

│   ├── Estructura

│   ├── Ingenieria

│   ├── Arquitectura

│   ├── Acabados

│   ├── Carpinteria

│   └── Gestion Administrativa

├── Para Inversores

├── Calculador

├── Politica de Privacidad

└── 404



\---



\# 8. GLOBAL HEADER



Header must be reusable across all pages.



Contents:



Left Side:



\* Company Logo

\* Quienes Somos

\* Servicios (Dropdown)



&#x20; \* Estructura

&#x20; \* Ingenieria

&#x20; \* Arquitectura

&#x20; \* Acabados

&#x20; \* Carpinteria

&#x20; \* Gestion Administrativa

\* Para Inversores



Right Side:



\* Instagram Icon

\* YouTube Icon

\* Calculador Button

\* WhatsApp Button

\* Language Switcher



All links open in same tab except external social links.



\---



\# 9. GLOBAL FOOTER



Contents:



Logo



Text:



© 2026 Todos los derechos reservados.

Structonix Sistem Global S.L.

CIF B24937930



Links:



\* Política de privacidad

\* WhatsApp

\* Instagram

\* YouTube



\---



\# 10. COMPANY CONFIGURATION



Create:



config/company.ts



Contains:



\* companyName

\* phone

\* email

\* address

\* whatsapp

\* instagram

\* youtube

\* googleMaps



\---



\# 11. HOME PAGE



SEO Title:



Structonix – Ingeniería, Arquitectura y Construcción en España



Sections:



\## Hero Section



Background:

Custom image



Elements:



\* Company Logo

\* Main Slogan



"DAMOS FORMA A LOS ESPACIOS MEDIANTE LA INGENIERÍA, LA PRECISIÓN Y LA VISIÓN, CREANDO ESTRUCTURAS DISEÑADAS PARA EL FUTURO."



Service Quick Links:



\* Estructura

\* Ingenieria

\* Arquitectura

\* Acabados

\* Carpinteria



Each service contains icon and link.



\## Contact Section



Background:

ContactosBackground.jpg



Contents:



\* Click-to-call phone

\* Clickable address

\* WhatsApp button



\---



\# 12. QUIENES SOMOS PAGE



Hero Section:

QuienesSomosBackground.jpg



Content Sections:



\* Sobre Structonix

\* Equipo Structonix

\* Gestión Administrativa

\* Control de Calidad

\* Arquitectura e Innovación

\* Structonix Sistem Global



\## Team Section



Data source:



/data/team.ts



Structure:



{

name: "",

position: "",

image: ""

}



Render dynamic cards.



\---



\# 13. SERVICE PAGES



Pages:



\* Estructura

\* Ingenieria

\* Arquitectura

\* Acabados

\* Carpinteria

\* Gestion Administrativa



Common structure:



1\. Hero Section

2\. Description

3\. Full Width Gallery Slider

4\. Footer



Slider requirements:



\* Autoplay 5 sec

\* Navigation arrows

\* Swipe support

\* Lazy loading



\---



\# 14. INVESTORS PAGE



Hero:

InversoresBackground.jpg



Title:



OFERTAS PARA INVERSORES



\## Investment Cards



Data source:



/data/investments.ts



Structure:



{

id: "",

title: "",

image: "",

pdf: "",

type: "",

area: "",

description: ""

}



Features:



\* Hover overlay

\* "Más Información" button

\* Modal window



Modal contains:



Left:



PDF preview

View PDF button



Right:



Project description



Bottom:



Download PDF button



\---



\# 15. CONTACT FORM



Fields:



\* Nombre

\* Email

\* Teléfono

\* Mensaje



Validation:

Zod



Protection:

Google reCAPTCHA v3



After submit:



\* Success message

\* Clear form

\* Send email using Resend



\---



\# 16. CALCULATOR PAGE



Contains two calculator cards.



\## Calculator 1



Title:



Calculadora de Estructura



Formula:



price = area × 650



Realtime calculation.



\## Calculator 2



Title:



Calculadora de Construcción



Modes:



Standard = 1650 €/m²



Premium = 2300 €/m²



Formula:



price = area × selectedRate



Realtime calculation.



\---



\# 17. SEO REQUIREMENTS



Every page must include:



\* unique title

\* unique description

\* Open Graph

\* Twitter Card



Use Next.js Metadata API.



Generate:



\* sitemap.xml

\* robots.txt



Structured Data:



\* ConstructionCompany

\* LocalBusiness

\* Organization



\---



\# 18. PERFORMANCE REQUIREMENTS



Target Lighthouse Score:



90+



Core Web Vitals:



Good



Requirements:



\* Code splitting

\* Lazy loading

\* Optimized images

\* Minimal layout shift



\---



\# 19. DEPLOYMENT



Platform:



Vercel



Environment variables:



\* RESEND\_API\_KEY

\* RECAPTCHA\_SITE\_KEY

\* RECAPTCHA\_SECRET\_KEY



Production ready.





\# 10.1 CONTENT MANAGEMENT SYSTEM (WITHOUT CRM)



The website must be easily editable without using any external CMS or CRM.



All dynamic content must be stored in dedicated TypeScript data files.



The goal is that future content updates can be performed by editing a single file without modifying React components.



\---



\## Team Members



Store in:



data/team.ts



Structure:



export interface TeamMember {

name: string;

position: string;

image: string;

}



export const teamMembers: TeamMember\[] = \[];



Requirements:



\* Add employee by adding new object

\* Remove employee by deleting object

\* Edit employee by modifying object

\* Team section renders automatically



\---



\## Investor Projects



Store in:



data/investments.ts



Structure:



export interface InvestmentProject {

id: string;

title: string;

image: string;

pdf: string;

type: string;

area: string;

description: string;

}



export const investments: InvestmentProject\[] = \[];



Requirements:



\* Add project by adding new object

\* Remove project by deleting object

\* Edit project by modifying object

\* Investor cards render automatically



\---



\## Service Galleries



Store in:



data/galleries.ts



Structure:



export const galleries = {

estructura: \[],

ingenieria: \[],

arquitectura: \[],

acabados: \[],

carpinteria: \[]

};



Requirements:



\* Add image by adding new path

\* Remove image by deleting path

\* Sliders update automatically



\---



\## Company Information



Store in:



config/company.ts



Structure:



export const company = {

companyName: "",

phone: "",

email: "",

address: "",

whatsapp: "",

instagram: "",

youtube: "",

googleMaps: ""

};



Requirements:



\* Contact section reads from this file

\* Footer reads from this file

\* Header social links read from this file



\---



\## Translation Files



Store in:



messages/es.json

messages/en.json

messages/ru.json



Requirements:



\* All visible texts must come from translation files

\* No hardcoded texts inside components

\* Adding new language should require only a new translation file



\---



\## Image Organization



Store images inside:



public/



Structure:



public/

├── logo/

├── team/

├── investors/

├── services/

│   ├── estructura/

│   ├── ingenieria/

│   ├── arquitectura/

│   ├── acabados/

│   └── carpinteria/

├── backgrounds/

└── icons/



Requirements:



\* Components must read image paths from data files

\* No image paths hardcoded inside components



\---



\## Future Scalability



Website architecture must allow:



\* Adding new employees

\* Adding new investor projects

\* Adding new service images

\* Updating company information

\* Updating translations



without changing component logic.



\# ASSETS MAP



Logo:

\- StructonixLogo.jpg

\- StructonixLogoWhite.jpg



Home:

\- ContactosBackground.jpg



About:

\- QuienesSomosBackground.jpg



Services:

\- EstructuraBackground.jpg

\- IngenieriaBackground.jpg

\- ArquitecturaBackground.jpg

\- AcabadosBackground.jpg

\- CarpinteriaBackground.jpg

\- GestionAdministrativaBackground.jpg



Investors:

\- InversoresBackground.jpg



Icons:

\- Icon\_Estructura.jpg

\- Icon\_Ingenieria.jpg

\- Icon\_Arquitectura.jpg

\- Icon\_Acabados.jpg

\- Icon\_Carpinteria.jpg



\# COMPONENT ARCHITECTURE



Создать переиспользуемые компоненты:



components/

├── layout/

│   ├── Header.tsx

│   ├── Footer.tsx

│

├── sections/

│   ├── Hero.tsx

│   ├── ContactSection.tsx

│   ├── TeamSection.tsx

│   ├── InvestorSection.tsx

│

├── ui/

│   ├── ServiceCard.tsx

│   ├── TeamCard.tsx

│   ├── InvestmentCard.tsx

│   ├── ImageSlider.tsx

│   ├── CalculatorCard.tsx

│

├── forms/

│   └── ContactForm.tsx



\# RESPONSIVE DESIGN



Mobile First.



Breakpoints:



sm: 640px

md: 768px

lg: 1024px

xl: 1280px

2xl: 1536px



На мобильных:



\- Бургер меню

\- Dropdown услуг внутри мобильного меню

\- Кнопка WhatsApp всегда видна

\- Слайдер поддерживает свайп

\- Карточки располагаются в один столбец



\# FLOATING WHATSAPP



На всех страницах должна быть закрепленная кнопка WhatsApp.



Расположение:



Нижний правый угол.



Поведение:



\- плавное появление

\- hover animation

\- открывает WhatsApp чат



\# PDF HANDLING



PDF файлы хранятся:



public/pdfs/



При открытии объекта инвестора:



\- показывать превью PDF

\- кнопка View PDF открывает PDF в новой вкладке

\- кнопка Download PDF скачивает PDF



Если PDF отсутствует:



\- скрывать кнопки автоматически



\# FUTURE EXTENSIONS



Архитектура должна позволять:



\- подключить CMS позже

\- подключить блог позже

\- подключить CRM позже

\- добавить новые языки

\- добавить новые услуги

\- добавить новые калькуляторы



без изменения основной архитектуры проекта.

Все изображения уже находятся в папке /public.

Не использовать заглушки.

Использовать реальные изображения из следующих директорий:

/public/logo
/public/backgrounds
/public/icons
/public/team
/public/services
/public/investors

При отсутствии изображения выводить fallback.