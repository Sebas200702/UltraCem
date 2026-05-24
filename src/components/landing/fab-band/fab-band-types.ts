import { type LucideIcon } from "lucide-react";

export interface FabAction {
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly tone: "primary" | "accent" | "whatsapp";
}
