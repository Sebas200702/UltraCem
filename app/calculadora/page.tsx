"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator as CalculatorIcon } from "lucide-react";
import { UltraCemLogo } from "@/components/brand";
import {
  CalculatorForm,
  CalculatorResult,
  type CalculatorFormData,
  type CalculatorResultData,
} from "@/components/calculator";

export default function CalculadoraPage() {
  const [result, setResult] = useState<CalculatorResultData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (data: CalculatorFormData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/calculate/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const parsed = await response.json();

      if (!response.ok || !parsed.success) {
        throw new Error(
          parsed.error?.message || "Error al calcular los materiales."
        );
      }

      setResult(parsed.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error inesperado. Intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-ultracem-surface-muted">
      <header className="relative z-10 flex items-center justify-between border-b border-white/10 bg-ultracem-blue px-4 py-3 shadow-uc-card md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Volver al inicio" className="shrink-0">
            <UltraCemLogo variant="light" priority className="h-12 w-auto" />
          </Link>
          <div>
            <p className="text-caption font-medium uppercase tracking-widest text-ultracem-yellow">
              Calculadora de materiales
            </p>
            <p className="hidden text-caption text-white/65 sm:block">
              Herramienta directa UltraCem
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="ml-2 inline-flex h-9 items-center gap-2 rounded-uc-button border border-white/15 bg-white/10 px-3 text-caption font-semibold text-white transition-colors hover:bg-white/15"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Inicio</span>
        </Link>
      </header>

      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="mx-auto max-w-2xl">
          {!result && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-ultracem-blue/10">
                  <CalculatorIcon className="h-8 w-8 text-ultracem-blue" />
                </div>
                <h1 className="text-h2 font-bold text-ultracem-gray-900">
                  Calculadora de materiales
                </h1>
                <p className="mt-2 text-body text-ultracem-gray-600">
                  Ingresa las dimensiones de tu estructura y obtén el cálculo
                  exacto de materiales, ahorro estimado e impacto ambiental.
                </p>
              </div>

              <div className="rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface p-6 shadow-uc-card md:p-8">
                <CalculatorForm
                  onCalculate={handleCalculate}
                  isLoading={isLoading}
                />
              </div>

              {error && (
                <div className="rounded-uc-card border border-red-200 bg-red-50 p-4 text-center text-body-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <CalculatorResult data={result} onReset={handleReset} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
