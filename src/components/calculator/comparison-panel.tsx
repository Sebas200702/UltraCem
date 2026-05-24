"use client";

import { useEffect, useState } from "react";
import type { ComparisonData } from "@/domains/recommendation/recommendation.types";

export interface ComparisonPanelProps {
  data: ComparisonData;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatWasteFactor(factor: number) {
  return factor.toFixed(2);
}

function useCountUp(target: number, durationMs = 800, decimals = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let raf = 0;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min(1, (timestamp - start) / durationMs);
      const eased = 1 - (1 - progress) ** 2;
      const current = eased * target;

      if (decimals > 0) {
        const factor = 10 ** decimals;
        setValue(Math.round(current * factor) / factor);
      } else {
        setValue(Math.round(current));
      }

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, decimals]);

  return value;
}

interface ComparisonColumnProps {
  variant: "generico" | "ultracem";
  data: ComparisonData;
}

function ComparisonColumn({ variant, data }: ComparisonColumnProps) {
  const isGenerico = variant === "generico";
  const column = isGenerico ? data.generico : data.ultracem;
  const extraCost = column.costoFinal - column.costoBase;
  const maxCo2 = Math.max(data.generico.co2Total, data.ultracem.co2Total);
  const co2WidthPercent = isGenerico
    ? 100
    : maxCo2 > 0
      ? (column.co2Total / maxCo2) * 100
      : 0;

  return (
    <div
      className={
        isGenerico
          ? "rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface-subtle p-4"
          : "rounded-uc-card border border-ultracem-blue/20 bg-ultracem-blue/5 p-4"
      }
    >
      <span
        className={
          isGenerico
            ? "mb-4 inline-block rounded-full bg-ultracem-error/10 px-3 py-1 text-caption font-bold uppercase tracking-wider text-ultracem-error"
            : "mb-4 inline-block rounded-full bg-ultracem-blue/10 px-3 py-1 text-caption font-bold uppercase tracking-wider text-ultracem-blue"
        }
      >
        {isGenerico ? "Sin receta" : "UltraCem"}
      </span>

      {!isGenerico && (
        <p className="mb-3 text-body-sm font-medium text-ultracem-gray-900">
          {data.ultracem.productName}
        </p>
      )}

      <div className="space-y-3">
        <div>
          <p className="text-caption text-ultracem-gray-600">Precio / saco</p>
          <p className="text-body font-semibold text-ultracem-gray-900">
            {formatCurrency(column.precioSaco)}
          </p>
        </div>

        <div>
          <p className="text-caption text-ultracem-gray-600">Costo base</p>
          <p className="text-body font-semibold text-ultracem-gray-900">
            {formatCurrency(column.costoBase)}
          </p>
        </div>

        <div>
          <p className="text-caption text-ultracem-gray-600">
            {isGenerico
              ? `+ Sobrecompra (×${formatWasteFactor(column.wasteFactor)})`
              : `+ Desperdicio técnico (×${formatWasteFactor(column.wasteFactor)})`}
          </p>
          <p
            className={
              isGenerico
                ? "text-body-sm font-semibold text-ultracem-error"
                : "text-body-sm font-semibold text-ultracem-gray-600"
            }
          >
            +{formatCurrency(extraCost)}
          </p>
        </div>

        <div className="border-t border-ultracem-gray-100 pt-3">
          <p className="text-caption font-bold uppercase tracking-wider text-ultracem-gray-600">
            Total
          </p>
          <p
            className={
              isGenerico
                ? "text-h2 font-bold text-ultracem-error"
                : "text-h2 font-bold text-ultracem-blue"
            }
          >
            {formatCurrency(column.costoFinal)}
          </p>
        </div>

        <div>
          <p className="mb-1.5 text-caption text-ultracem-gray-600">CO₂ total</p>
          <p className="mb-2 text-body-sm font-semibold text-ultracem-gray-900">
            {column.co2Total.toFixed(1)} kg
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-ultracem-gray-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isGenerico ? "bg-ultracem-error" : "bg-ultracem-green"
              }`}
              style={{ width: `${co2WidthPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ComparisonPanel({ data }: ComparisonPanelProps) {
  const animatedPesos = useCountUp(data.ahorroPesos, 800, 0);
  const animatedCo2 = useCountUp(data.ahorroCO2Kg, 800, 1);
  const animatedPorc = useCountUp(data.ahorroPorc, 800, 1);

  return (
    <section className="animate-fade-in-up border-t border-ultracem-gray-100 px-5 py-4">
      <header className="mb-5">
        <h4 className="text-h3 font-bold text-ultracem-gray-900">
          ¿Cuánto ahorras con UltraCem?
        </h4>
        <p className="mt-1 text-caption text-ultracem-gray-600">
          vs. cemento genérico del mercado · factor de sobrecompra informal
          ×1.30
        </p>
      </header>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ComparisonColumn variant="generico" data={data} />
        <ComparisonColumn variant="ultracem" data={data} />
      </div>

      <div className="mb-3 rounded-uc-card border border-ultracem-green/20 bg-ultracem-green/10 px-4 py-3 text-center text-body-sm text-ultracem-gray-900">
        <span aria-hidden>🌱</span>{" "}
        <span className="font-semibold text-ultracem-green">
          Ahorras {formatCurrency(animatedPesos)}
        </span>
        {" · "}
        <span className="font-semibold text-ultracem-green">
          {animatedCo2.toFixed(1)} kg menos de CO₂
        </span>
        {" "}
        <span className="font-semibold text-ultracem-green">
          ({animatedPorc.toFixed(1)}%)
        </span>
      </div>

      <p className="text-caption leading-relaxed text-ultracem-gray-600">
        * Sobrecompra estimada basada en prácticas de obra informal. Factor
        conservador × 1.30 sobre desperdicio técnico NSR-10.
      </p>
    </section>
  );
}
