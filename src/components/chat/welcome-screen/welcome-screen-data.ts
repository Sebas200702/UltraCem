import { BrickWall, Hammer, PaintBucket, Ruler } from "lucide-react";
import {
  type Feature,
  type QuickPrompt,
} from "@/components/chat/welcome-screen/welcome-screen-types";

export const FEATURES: Feature[] = [
  { icon: Ruler, label: "Calculo exacto", desc: "Dimensiones a materiales" },
  { icon: BrickWall, label: "Producto ideal", desc: "Recomendacion UltraCem" },
  { icon: Hammer, label: "Ahorro real", desc: "Economico y ambiental" },
  { icon: PaintBucket, label: "En 90 segundos", desc: "De idea a cotizacion" },
];

export const QUICK_PROMPTS: ReadonlyArray<QuickPrompt> = [
  {
    label: "Placa 5x4m de 10cm",
    prompt: "Voy a fundir una placa de 5 metros por 4 metros con espesor de 10 cm.",
  },
  {
    label: "Muro 3m x 2.5m",
    prompt: "Necesito levantar un muro de 3 metros de largo por 2.5 de alto con bloque de 15.",
  },
  {
    label: "Columna 30x30 x 3m",
    prompt: "Voy a fundir una columna de 30 por 30 centímetros y 3 metros de altura.",
  },
];
