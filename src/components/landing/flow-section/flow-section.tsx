"use client";

import { cn } from "@/lib/utils";
import { Card, Eyebrow, Section } from "@/components/ui";
import { useFlowSection } from '@/components/landing/flow-section/use-flow-section';

export function FlowSection() {
  const { activeIndex, active, flowExamples, setActiveIndex } = useFlowSection();

  return (
    <Section id="ejemplos" tone="light">
      <Eyebrow className="mb-4">Ejemplo real</Eyebrow>
      <div className="mb-5 h-1 w-24 rounded-full bg-ultracem-yellow" />
      <h2 className="mb-3 max-w-[620px] text-h1 text-ultracem-gray-900 md:text-display">
        Así le puedes hablar a Vanesa
      </h2>
      <p className="mb-12 max-w-[560px] text-body text-ultracem-gray-600">
        No necesitas saber de técnica. Escribe exactamente como le contarías el
        trabajo a un colega y recibe un resultado escaneable.
      </p>

      <div className="grid items-start gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          {flowExamples.map((example, index) => (
            <button
              key={example.tag}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "group rounded-uc-card border p-5 text-left transition-all duration-200",
                activeIndex === index
                  ? "border-ultracem-blue bg-ultracem-blue/5 shadow-uc-card"
                  : "border-ultracem-gray-100 bg-ultracem-surface hover:-translate-y-0.5 hover:border-ultracem-blue/40 hover:shadow-uc-card",
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-caption font-semibold uppercase tracking-wider text-ultracem-blue">
                  {example.tag}
                </p>
                <span
                  aria-hidden
                  className={cn(
                    "h-1.5 w-6 rounded-full transition-colors",
                    activeIndex === index
                      ? "bg-ultracem-yellow"
                      : "bg-ultracem-gray-100 group-hover:bg-ultracem-yellow/50",
                  )}
                />
              </div>
              <p className="text-body-sm italic text-ultracem-gray-900">
                {example.message}
              </p>
            </button>
          ))}
        </div>

        <Card className="md:sticky md:top-24">
          <p className="mb-4 text-caption font-semibold uppercase tracking-wider text-ultracem-gray-600">
            Resultado estimado
          </p>
          <div>
            {active.rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-ultracem-gray-100 py-3 last:border-b-0"
              >
                <span className="flex items-center gap-3 text-body-sm text-ultracem-gray-600">
                  <span className="flex min-w-12 items-center justify-center rounded-lg bg-ultracem-blue/5 px-2 py-1 text-caption font-semibold text-ultracem-blue">
                    {row.icon}
                  </span>
                  {row.label}
                </span>
                <span className="text-body-sm font-semibold text-ultracem-gray-900">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-uc-input border border-ultracem-green/25 bg-ultracem-green/10 p-4">
            <p
              className="text-body-sm leading-snug text-ultracem-gray-900 [&_strong]:font-semibold [&_strong]:text-ultracem-green"
              dangerouslySetInnerHTML={{ __html: active.savingHtml }}
            />
          </div>
        </Card>
      </div>
    </Section>
  );
}
