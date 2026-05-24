import { type HTMLAttributes } from "react";

export type EyebrowTone = "light" | "blue" | "yellow";

export interface EyebrowProps extends HTMLAttributes<HTMLDivElement> {
  tone?: EyebrowTone;
}
