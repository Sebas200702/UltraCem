import { BrickWall, Hammer, PaintBucket, Ruler } from "lucide-react";
import { type QuickAction } from '@/components/chat/chat-container/chat-container-types';

export const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Placa",
    icon: Ruler,
    prompt: "Necesito calcular una placa de 5m x 4m x 10cm",
  },
  {
    label: "Muro",
    icon: BrickWall,
    prompt: "Muro de 3m de largo por 2.5m de alto, bloque de 15",
  },
  {
    label: "Columna",
    icon: Hammer,
    prompt: "Columna de 30x30 y 3m de altura",
  },
  {
    label: "Revoque",
    icon: PaintBucket,
    prompt: "Revocar 50 metros cuadrados con 2cm",
  },
];
