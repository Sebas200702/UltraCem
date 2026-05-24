import Image from "next/image";
import { cn } from "@/lib/utils";

/** Official UltraCem assets — source: ultracem.co (foundations.md §2) */
const LOGOS = {
  /** Yellow wordmark for dark blue backgrounds (header, footer) */
  light: {
    src: "/images/ultracem-logo-yellow.png",
    width: 123,
    height: 97,
  },
  /** Blue wordmark for light backgrounds */
  dark: {
    src: "/images/ultracem-logo-blue.webp",
    width: 300,
    height: 69,
  },
} as const;

type UltraCemLogoVariant = keyof typeof LOGOS;

interface UltraCemLogoProps {
  variant?: UltraCemLogoVariant;
  className?: string;
  priority?: boolean;
}

export function UltraCemLogo({
  variant = "light",
  className,
  priority = false,
}: UltraCemLogoProps) {
  const logo = LOGOS[variant];

  return (
    <Image
      src={logo.src}
      alt="UltraCem"
      width={logo.width}
      height={logo.height}
      priority={priority}
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
}
