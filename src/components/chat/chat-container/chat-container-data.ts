import {
  BrickWall,
  Brush,
  Building2,
  Circle,
  Construction,
  Grid2x2,
  Hammer,
  Layers,
  PaintBucket,
} from "lucide-react";
import { type QuickAction } from '@/components/chat/chat-container/chat-container-types';

export const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Placa de entrepiso",
    icon: Layers,
    prompt: "Quiero calcular una placa de entrepiso",
  },
  {
    label: "Piso en concreto",
    icon: Grid2x2,
    prompt: "Quiero calcular un piso de concreto",
  },
  {
    label: "Andén",
    icon: Construction,
    prompt: "Quiero calcular un andén de concreto",
  },
  {
    label: "Zapata",
    icon: Building2,
    prompt: "Quiero calcular una zapata de cimentación",
  },
  {
    label: "Muro bloque 10",
    icon: BrickWall,
    prompt: "Quiero calcular un muro en bloque 10",
  },
  {
    label: "Muro bloque 15",
    icon: BrickWall,
    prompt: "Quiero calcular un muro en bloque 15",
  },
  {
    label: "Columna rectangular",
    icon: Hammer,
    prompt: "Quiero calcular una columna rectangular",
  },
  {
    label: "Columna circular",
    icon: Circle,
    prompt: "Quiero calcular una columna circular",
  },
  {
    label: "Revoque interior",
    icon: PaintBucket,
    prompt: "Quiero calcular un revoque interior",
  },
  {
    label: "Revoque exterior",
    icon: Brush,
    prompt: "Quiero calcular un revoque exterior",
  },
];
