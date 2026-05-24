import { Calculator, ClipboardList, Leaf, Phone } from "lucide-react";
import { type Tool } from "@/components/landing/tools-section/tools-section-types";

export const tools: Tool[] = [
  {
    tag: "Calculo manual",
    title: "Calculadora de materiales",
    description:
      "Ajusta dimensiones y obten dosificacion detallada para distintos tipos de estructura.",
    href: "/calculadora",
    cta: "Ir a la calculadora",
    external: false,
    icon: Calculator,
  },
  {
    tag: "Gestion de obras",
    title: "Seguimiento de proyectos",
    description:
      "Crea proyectos, registra avances y prepara informacion para cotizaciones futuras.",
    href: "/chat",
    cta: "Ver mis obras",
    external: false,
    icon: ClipboardList,
  },
  {
    tag: "Sostenibilidad",
    title: "Panel de impacto",
    description:
      "Revisa CO2 evitado, material ahorrado y presupuesto optimizado en tus obras.",
    href: "/chat",
    cta: "Ver impacto",
    external: false,
    icon: Leaf,
  },
  {
    tag: "Comercial",
    title: "Cotiza con UltraCem",
    description:
      "Cuando tengas el calculo, conecta con asesores comerciales por region.",
    href: "https://ultracem.co/cotizar-ultracem/",
    cta: "Cotizar ahora",
    external: true,
    icon: Phone,
  },
];
