import { BrickWall, Hammer, PaintBucket, Ruler } from "lucide-react";
import { type Feature } from '@/components/chat/welcome-screen/welcome-screen-types';

export const FEATURES: Feature[] = [
  { icon: Ruler, label: "Calculo exacto", desc: "Dimensiones a materiales" },
  { icon: BrickWall, label: "Producto ideal", desc: "Recomendacion UltraCem" },
  { icon: Hammer, label: "Ahorro real", desc: "Economico y ambiental" },
  { icon: PaintBucket, label: "En 90 segundos", desc: "De idea a cotizacion" },
];
