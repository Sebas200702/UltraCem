export const LOGOS = {
  light: {
    src: "/images/ultracem-logo-yellow.png",
    width: 123,
    height: 97,
  },
  dark: {
    src: "/images/ultracem-logo-blue.webp",
    width: 300,
    height: 69,
  },
} as const;

export type UltraCemLogoVariant = keyof typeof LOGOS;

export interface UltraCemLogoProps {
  variant?: UltraCemLogoVariant;
  className?: string;
  priority?: boolean;
}
