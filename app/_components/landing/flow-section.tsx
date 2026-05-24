"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { flowExamples } from "./flow-data";

export function FlowSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = flowExamples[activeIndex];

  return (
    <section className="bg-ultracem-blue px-6 py-20" id="ejemplos">
      <div className="mx-auto max-w-uc-container">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-ultracem-yellow/20 bg-ultracem-yellow/[0.12] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-ultracem-yellow">
          Ejemplo real
        </div>
        <h2 className="mb-3 text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-white">
          ¿Cómo le hablas a Vanesa?
        </h2>
        <p className="mb-12 max-w-[540px] text-[15px] leading-relaxed text-white/65">
          No necesitas saber de técnica. Escribe exactamente como le contarías
          el trabajo a un colega.
        </p>

        <div className="grid items-start gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            {flowExamples.map((example, index) => (
              <button
                key={example.tag}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-all md:px-5 md:py-4",
                  activeIndex === index
                    ? "border-ultracem-yellow/40 bg-ultracem-yellow/10"
                    : "border-white/10 bg-white/[0.07] hover:border-ultracem-yellow/30 hover:bg-white/[0.12]",
                )}
              >
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-ultracem-yellow">
                  {example.tag}
                </p>
                <p className="text-sm italic text-white/90">{example.message}</p>
              </button>
            ))}
          </div>

          <div className="sticky top-20 rounded-[20px] border border-white/10 bg-white/[0.05] p-6">
            <p className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-white/50">
              Resultado estimado
            </p>
            <div className="space-y-0">
              {active.rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between border-b border-white/[0.08] py-2.5 last:border-b-0"
                >
                  <span className="flex items-center gap-2 text-[13px] text-white/60">
                    <span className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-white/[0.08] text-[11px]">
                      {row.icon}
                    </span>
                    {row.label}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-ultracem-green/25 bg-ultracem-green/15 p-3 px-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ultracem-green/20 text-sm">
                🌱
              </span>
              <p
                className="text-[13px] leading-snug text-white/80 [&_strong]:text-ultracem-green"
                dangerouslySetInnerHTML={{ __html: active.savingHtml }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
