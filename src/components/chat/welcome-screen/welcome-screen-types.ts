import { type ComponentType } from "react";

export interface WelcomeScreenProps {
  onStart: () => void;
}

export interface Feature {
  icon: ComponentType<{ className?: string }>;
  label: string;
  desc: string;
}
