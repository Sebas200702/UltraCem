import { MessageCircle } from "lucide-react";
import { Button, Container, Eyebrow } from "@/components/ui";
import { ChatMockup } from '@/components/landing/chat-mockup';

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center bg-ultracem-blue pt-16">
      <Container className="grid items-center gap-10 py-12 md:grid-cols-2 md:gap-16 md:py-20">
        <div className="animate-fade-up">
          <Eyebrow tone="light" className="mb-6">
            Inteligencia artificial para tu obra
          </Eyebrow>
          <div className="mb-6 h-1 w-32 rounded-full bg-ultracem-yellow" />
          <h1 className="mb-5 max-w-[520px] text-display text-white md:text-[3.5rem]">
            Calcula tus materiales 
          </h1>
          <p className="mb-9 max-w-[500px] text-body leading-relaxed text-white/75">
            Cuentale a Vanesa que vas a construir. Ella calcula cuantos sacos de
            cemento, arena, grava y agua necesitas con una dosificacion clara
            para reducir desperdicio en obra.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href="/chat" variant="secondary" className="gap-2">
              <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
              Hablar con Vanesa
            </Button>
            <Button href="#ejemplos" variant="white">
              Ver como funciona
            </Button>
          </div>
        </div>

        <div className="animate-fade-up [animation-delay:0.2s]">
          <ChatMockup />
        </div>
      </Container>
    </section>
  );
}
