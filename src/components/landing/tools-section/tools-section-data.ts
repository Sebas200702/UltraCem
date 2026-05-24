import { Calculator, ClipboardList, Leaf, Phone } from "lucide-react";
import { type Tool } from "@/components/landing/tools-section/tools-section-types";

export const tools: Tool[] = [
  {
    tag: "Cálculo manual",
    title: "Calculadora de materiales",
    description:
      "Ajusta dimensiones y obtén dosificación detallada para distintos tipos de estructura.",
    href: "/calculadora",
    cta: "Ir a la calculadora",
    external: false,
    icon: Calculator,
  },
  {
    tag: "Gestión de obras",
    title: "Seguimiento de proyectos",
    description:
      "Crea proyectos, registra avances y prepara información para cotizaciones futuras.",
    href: "/chat",
    cta: "Ver mis obras",
    external: false,
    icon: ClipboardList,
  },
  {
    tag: "Sostenibilidad",
    title: "Panel de impacto",
    description:
      "Revisa CO₂ evitado, material ahorrado y presupuesto optimizado en tus obras.",
    href: "/chat",
    cta: "Ver impacto",
    external: false,
    icon: Leaf,
  },
  {
    tag: "Comercial",
    title: "Cotiza con UltraCem",
    description:
      "Cuando tengas el cálculo, conecta con asesores comerciales por región.",
    href: "https://ultracem.co/cotizar-ultracem/",
    cta: "Cotizar ahora",
    external: true,
    icon: Phone,
  },
];
