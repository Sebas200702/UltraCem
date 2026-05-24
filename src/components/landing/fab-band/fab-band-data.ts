import { Building2, FileText, MessageCircle, ShoppingCart } from "lucide-react";
import { type FabAction } from "@/components/landing/fab-band/fab-band-types";

export const FAB_ACTIONS: ReadonlyArray<FabAction> = [
  {
    label: "WhatsApp Vanesa",
    href: "https://api.whatsapp.com/send?phone=573164034858",
    icon: MessageCircle,
    tone: "whatsapp",
  },
  {
    label: "Cotiza",
    href: "https://ultracem.co/cotizar-ultracem/",
    icon: FileText,
    tone: "accent",
  },
  {
    label: "B2B",
    href: "https://b2b.ultracem.co/landing",
    icon: Building2,
    tone: "primary",
  },
  {
    label: "Tienda hogar",
    href: "https://b2c.ultracem.co/",
    icon: ShoppingCart,
    tone: "primary",
  },
];
