import { type HTMLAttributes, type ReactNode } from "react";

export type SectionTone = "light" | "blue" | "yellow";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
  contained?: boolean;
  children: ReactNode;
}
