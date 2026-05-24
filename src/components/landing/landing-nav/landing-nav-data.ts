import { type NavItem } from '@/components/landing/landing-nav/landing-nav-types';

export const navItems: NavItem[] = [
  { label: "Como funciona", href: "#ejemplos", className: "sm:inline-flex" },
  { label: "Herramientas", href: "#herramientas", className: "sm:inline-flex" },
  {
    label: "Productos",
    href: "https://ultracem.co/productos/",
    className: "md:inline-flex",
    external: true,
  },
];
