"use client";

import { ArrowRight } from "lucide-react";
import { UltraCemLogo } from "@/components/brand";
import { Button, Card, Eyebrow } from "@/components/ui";
import {
  FEATURES,
  QUICK_PROMPTS,
} from "@/components/chat/welcome-screen/welcome-screen-data";
import { type WelcomeScreenProps } from "@/components/chat/welcome-screen/welcome-screen-types";

export function WelcomeScreen({ onStart, onQuickStart }: WelcomeScreenProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center overflow-y-auto bg-ultracem-blue px-6 py-10 text-center">
      <div className="flex w-full max-w-2xl flex-col items-center">
        <div className="mb-6 animate-fade-in-up">
          <div className="mx-auto flex min-h-24 items-center justify-center rounded-uc-card border border-white/15 bg-white/10 px-8 py-5">
            <UltraCemLogo variant="light" priority className="h-16 w-auto" />
          </div>
        </div>

        <Eyebrow tone="light" className="mb-5 animate-fade-in-up stagger-1">
          Calculadora de materiales
        </Eyebrow>
        <div className="mx-auto mb-6 h-1 w-32 rounded-full bg-ultracem-yellow" />

        <h1 className="mb-4 max-w-xl text-display text-white animate-fade-in-up stagger-2">
          Calcula tus materiales con Vanesa
        </h1>
        <p className="mb-8 max-w-md text-body text-white/75 animate-fade-in-up stagger-3">
          Describe tu obra en lenguaje natural. Te decimos exactamente cuánto
          cemento, arena y agua necesitas, y cuál producto UltraCem es ideal.
        </p>

        <Button
          type="button"
          onClick={onStart}
          variant="secondary"
          className="mb-6 gap-3 animate-fade-in-up stagger-4"
        >
          <span>Iniciar cálculo</span>
          <ArrowRight className="h-4 w-4" />
        </Button>

        {onQuickStart && (
          <div className="mb-10 w-full animate-fade-in-up stagger-4">
            <p className="mb-3 text-caption font-semibold uppercase tracking-wider text-white/55">
              O empieza con un ejemplo
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_PROMPTS.map((quick) => (
                <button
                  key={quick.label}
                  type="button"
                  onClick={() => onQuickStart(quick.prompt)}
                  className="inline-flex min-h-10 items-center rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-body-sm font-medium text-white/85 transition-colors hover:border-ultracem-yellow hover:bg-white/15 hover:text-white"
                >
                  {quick.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 animate-fade-in-up stagger-5">
          {FEATURES.map((feature) => (
            <Card
              key={feature.label}
              className="flex flex-col items-center gap-2 border-white/15 bg-white/10 p-4 shadow-none"
            >
              <feature.icon className="h-5 w-5 text-ultracem-yellow" />
              <span className="text-caption font-semibold uppercase tracking-wider text-white">
                {feature.label}
              </span>
              <span className="text-caption text-white/60">{feature.desc}</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
