"use client";

import { ArrowRight, Ruler, BrickWall, Hammer, PaintBucket } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

const FEATURES = [
  { icon: Ruler, label: "Cálculo exacto", desc: "Dimensiones a materiales" },
  { icon: BrickWall, label: "Producto ideal", desc: "Recomendación UltraCem" },
  { icon: Hammer, label: "Ahorro real", desc: "Económico y ambiental" },
  { icon: PaintBucket, label: "En 90 segundos", desc: "De idea a cotización" },
];

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-ultracem-blue px-6">
      {/* Content */}
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        {/* Logo mark */}
        <div className="mb-6 animate-fade-in-up">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-uc-card border border-white/10 bg-ultracem-blue-dark/50">
            <span className="text-4xl font-bold text-ultracem-yellow">UC</span>
          </div>
        </div>

        {/* Headline */}
        <div className="mb-2 animate-fade-in-up stagger-1">
          <h2 className="text-5xl font-bold leading-tight tracking-wide text-white sm:text-6xl">
            CALCULA TUS
            <br />
            <span className="text-ultracem-yellow">MATERIALES</span>
          </h2>
        </div>

        {/* Accent line */}
        <div
          className="mx-auto mb-6 h-[3px] w-32 bg-ultracem-yellow"
          style={{ animation: "draw-line 1.2s ease-out 0.4s forwards" }}
        />

        {/* Subheadline */}
        <p className="mb-10 max-w-xs text-sm leading-relaxed text-white/70 animate-fade-in-up stagger-2">
          Describe tu obra en lenguaje natural. Te decimos exactamente cuánto
          cemento, arena y agua necesitas — y cuál producto UltraCem es ideal.
        </p>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="group relative mb-12 inline-flex items-center gap-3 rounded-uc-button bg-ultracem-yellow px-8 py-4 text-sm font-bold uppercase tracking-wider text-ultracem-blue transition-all hover:bg-ultracem-yellow-hover hover:shadow-[0_0_30px_rgba(255,202,0,0.3)] animate-fade-in-up stagger-3"
        >
          <span>Iniciar cálculo</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Features grid */}
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 animate-fade-in-up stagger-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.label}
              className="flex flex-col items-center gap-2 rounded-lg border border-white/10 bg-ultracem-blue-dark/30 p-3"
            >
              <feature.icon className="h-5 w-5 text-ultracem-yellow" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                {feature.label}
              </span>
              <span className="text-[9px] text-white/50">{feature.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom technical detail */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
          UltraCem Colombia — Fábrica de Cemento
        </p>
      </div>
    </div>
  );
}
