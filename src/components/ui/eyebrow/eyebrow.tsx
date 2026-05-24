import { cn } from "@/lib/utils";
import { type EyebrowProps, type EyebrowTone } from '@/components/ui/eyebrow/eyebrow-types';

const toneClasses: Record<EyebrowTone, string> = {
  light: "border-white/20 bg-white/10 text-white before:bg-ultracem-yellow",
  blue:
    "border-ultracem-blue/10 bg-ultracem-blue/5 text-ultracem-blue before:bg-ultracem-blue",
  yellow:
    "border-ultracem-yellow/30 bg-ultracem-yellow/15 text-ultracem-blue before:bg-ultracem-yellow",
};

export function Eyebrow({
  className,
  tone = "blue",
  ...props
}: EyebrowProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-caption font-semibold uppercase tracking-wider before:h-1.5 before:w-1.5 before:rounded-full before:content-['']",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
