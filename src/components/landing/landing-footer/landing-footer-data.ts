export interface FooterLink {
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
}

export interface FooterGroup {
  readonly title: string;
  readonly links: ReadonlyArray<FooterLink>;
}

export const footerGroups: ReadonlyArray<FooterGroup> = [
  {
    title: "Productos",
    links: [
      {
        label: "Mezcla Lista",
        href: "https://ultracem.co/productos/",
        external: true,
      },
      {
        label: "Cal hidratada",
        href: "https://ultracem.co/productos/",
        external: true,
      },
      {
        label: "Pegantes",
        href: "https://ultracem.co/productos/",
        external: true,
      },
      {
        label: "Concretos",
        href: "https://ultracem.co/productos/",
        external: true,
      },
    ],
  },
  {
    title: "Compañía",
    links: [
      {
        label: "Trayectoria",
        href: "https://ultracem.co/nosotros/",
        external: true,
      },
      {
        label: "Asesores comerciales",
        href: "https://ultracem.co/directorio-comercial-asesores/",
        external: true,
      },
      {
        label: "Noticias",
        href: "https://ultracem.co/category/noticias/",
        external: true,
      },
      {
        label: "Inversionistas",
        href: "https://ultracem.co/inversionistas/",
        external: true,
      },
    ],
  },
  {
    title: "Contacto",
    links: [
      {
        label: "WhatsApp Vanesa",
        href: "https://api.whatsapp.com/send?phone=573164034858",
        external: true,
      },
      {
        label: "UltraCem B2B",
        href: "https://b2b.ultracem.co/landing",
        external: true,
      },
      {
        label: "Tienda hogar",
        href: "https://b2c.ultracem.co/",
        external: true,
      },
      {
        label: "Cotiza aquí",
        href: "https://ultracem.co/cotizar-ultracem/",
        external: true,
      },
    ],
  },
];

export const footerLegalLinks: ReadonlyArray<FooterLink> = [
  { label: "ultracem.co", href: "https://ultracem.co/", external: true },
  {
    label: "Política de privacidad",
    href: "https://ultracem.co/",
    external: true,
  },
];
