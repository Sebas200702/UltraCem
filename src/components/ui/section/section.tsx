import { cn } from "@/lib/utils";
import { Container } from '@/components/ui/container';
import { type SectionProps, type SectionTone } from '@/components/ui/section/section-types';

const toneClasses: Record<SectionTone, string> = {
  light: "bg-ultracem-surface text-ultracem-gray-900",
  blue: "bg-ultracem-blue text-white",
  yellow: "bg-ultracem-yellow text-ultracem-blue",
};

export function Section({
  className,
  tone = "light",
  contained = true,
  children,
  ...props
}: SectionProps) {
  const content = contained ? <Container>{children}</Container> : children;

  return (
    <section
      className={cn("py-16 md:py-20", toneClasses[tone], className)}
      {...props}
    >
      {content}
    </section>
  );
}
