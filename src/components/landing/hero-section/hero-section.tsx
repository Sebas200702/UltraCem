import { MessageCircle, Sparkles } from "lucide-react";
import { Button, Container, Eyebrow } from "@/components/ui";
import { ChatMockup } from "@/components/landing/chat-mockup";
import { HERO_KPIS } from "@/components/landing/hero-section/hero-section-data";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center bg-ultracem-blue pt-16">
      <Container className="grid items-center gap-10 py-12 md:grid-cols-12 md:gap-12 md:py-20 lg:gap-16">
        <div className="animate-fade-up md:col-span-7">
          <Eyebrow tone="light" className="mb-6">
            <Sparkles className="h-3 w-3" strokeWidth={2.5} />
            Inteligencia artificial para tu obra
          </Eyebrow>
          <div className="mb-6 h-1 w-32 rounded-full bg-ultracem-yellow" />
          <h1 className="mb-5 max-w-[520px] text-display text-white md:text-[3.5rem]">
            Calcula tus materiales en segundos
          </h1>
          <p className="mb-9 max-w-[520px] text-body leading-relaxed text-white/75">
            Cuéntale a Vanesa qué vas a construir. Ella calcula cuántos sacos
            de cemento, arena, grava y agua necesitas con una dosificación
            clara para reducir desperdicio en obra.
          </p>
          <div className="mb-10 flex flex-wrap gap-3">
            <Button href="/chat" variant="secondary" className="gap-2">
              <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
              Hablar con Vanesa
            </Button>
            <Button href="#ejemplos" variant="white">
              Ver cómo funciona
            </Button>
          </div>

          <dl className="grid max-w-[520px] grid-cols-3 gap-3 border-t border-white/15 pt-6">
            {HERO_KPIS.map((kpi) => (
              <div key={kpi.label} className="flex flex-col gap-1">
                <dt className="text-caption font-semibold uppercase tracking-wider text-white/55">
                  {kpi.label}
                </dt>
                <dd className="text-h2 font-semibold text-ultracem-yellow">
                  {kpi.value}
                </dd>
                <dd className="text-caption text-white/65">{kpi.detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="animate-fade-up [animation-delay:0.2s] md:col-span-5">
          <ChatMockup />
        </div>
      </Container>
    </section>
  );
}
