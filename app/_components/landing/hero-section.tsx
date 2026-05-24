import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { ChatMockup } from "./chat-mockup";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-ultracem-blue pt-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,202,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,202,0,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -right-[150px] -top-[100px] h-[600px] w-[600px] rounded-full border border-ultracem-yellow/[0.08]" />
        <div className="absolute -bottom-[100px] right-[50px] h-[400px] w-[400px] rounded-full border border-ultracem-yellow/[0.08]" />
        <div className="absolute right-[200px] top-[200px] h-[200px] w-[200px] rounded-full border border-ultracem-yellow/[0.08]" />
      </div>

      <div className="container-uc relative grid w-full items-center gap-10 py-10 md:grid-cols-2 md:gap-16 md:py-20">
        <div className="animate-fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ultracem-yellow/25 bg-ultracem-yellow/[0.12] px-4 py-1.5">
            <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-ultracem-yellow" />
            <span className="text-xs font-semibold uppercase tracking-wider text-ultracem-yellow">
              Inteligencia artificial para tu obra
            </span>
          </div>
          <h1 className="mb-5 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] tracking-tight text-white">
            Calcula tus materiales
            <br />
            en <span className="text-ultracem-yellow">menos de 90</span>
            <br />
            segundos
          </h1>
          <p className="mb-9 max-w-[480px] text-base leading-relaxed text-white/70">
            Cuéntale a Vanesa qué vas a construir. Ella calcula cuántos sacos de
            cemento, arena, grava y agua necesitas — con la dosificación exacta
            para no desperdiciar un peso.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-uc-button bg-ultracem-yellow px-7 py-3.5 text-[15px] font-bold text-ultracem-blue transition-all hover:-translate-y-px hover:bg-ultracem-yellow-hover"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
              Hablar con Vanesa
            </Link>
            <Link
              href="#ejemplos"
              className="inline-flex items-center gap-2 rounded-uc-button border-[1.5px] border-white/30 bg-transparent px-7 py-[13px] text-[15px] font-semibold text-white transition-all hover:border-white/70 hover:bg-white/[0.07]"
            >
              Ver cómo funciona
            </Link>
          </div>
        </div>

        <div className="animate-fade-up [animation-delay:0.3s]">
          <ChatMockup />
        </div>
      </div>
    </section>
  );
}
