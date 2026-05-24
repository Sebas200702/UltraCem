import { MessageCircle } from "lucide-react";
import { Button, Section } from "@/components/ui";

export function CtaSection() {
  return (
    <Section tone="yellow" id="chat" className="text-center">
      <div className="mx-auto max-w-[640px]">
        <h2 className="mb-4 text-h1 text-ultracem-blue md:text-display">
          Listo para calcular tu obra
        </h2>
        <p className="mb-8 text-body text-ultracem-blue/75">
          Abre el chat con Vanesa ahora mismo. En menos de 90 segundos sabras
          cuanto material necesitas y que producto UltraCem se ajusta mejor.
        </p>
        <Button href="/chat" variant="primary" className="gap-2">
          <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
          Abrir chat con Vanesa
        </Button>
      </div>
    </Section>
  );
}
