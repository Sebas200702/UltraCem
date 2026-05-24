import { type ComponentType } from "react";

export interface WelcomeScreenProps {
  onStart: () => void;
  onQuickStart?: (prompt: string) => void;
}

export interface Feature {
  icon: ComponentType<{ className?: string }>;
  label: string;
  desc: string;
}

export interface QuickPrompt {
  readonly label: string;
  readonly prompt: string;
}
