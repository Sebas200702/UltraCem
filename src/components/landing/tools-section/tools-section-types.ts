import { type LucideIcon } from "lucide-react";

export interface Tool {
  tag: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  external: boolean;
  icon: LucideIcon;
}
