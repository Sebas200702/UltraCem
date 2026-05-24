import Image from "next/image";
import { cn } from "@/lib/utils";
import { LOGOS, type UltraCemLogoProps } from '@/components/brand/ultracem-logo/ultracem-logo-types';

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
