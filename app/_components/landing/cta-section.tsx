import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function CtaSection() {
  return (
    <section className="bg-ultracem-yellow px-6 py-[72px] text-center" id="chat">
      <div className="mx-auto max-w-[640px]">
        <h2 className="mb-3.5 text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-tight text-ultracem-blue">
          ¿Listo para calcular tu obra?
        </h2>
        <p className="mb-8 text-[15px] leading-relaxed text-ultracem-blue/70">
          Abre el chat con Vanesa ahora mismo. En menos de 90 segundos sabrás
          exactamente cuánto material necesitas.
        </p>
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 rounded-uc-button bg-ultracem-blue px-8 py-3.5 text-[15px] font-bold text-white transition-all hover:-translate-y-px hover:bg-ultracem-blue-dark"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
          Abrir chat con Vanesa
        </Link>
      </div>
    </section>
  );
}
