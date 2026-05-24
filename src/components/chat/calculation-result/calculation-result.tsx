"use client";

import {
  ArrowRight,
  CheckCircle,
  FileText,
  MapPin,
  RotateCcw,
  ShieldAlert,
  TreePine,
  Wallet,
} from "lucide-react";
import { type CalculationResultProps } from '@/components/chat/calculation-result/calculation-result-types';

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

const REGION_LABELS: Record<string, string> = {
  caribe: 'Caribe (cálido, salino)',
  andina: 'Andina (templado)',
  pacifica: 'Pacífica (húmedo, salino)',
};

const SEVERITY_STYLES: Record<string, string> = {
  low: 'bg-blue-50 text-blue-800 border-blue-200',
  medium: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  high: 'bg-red-50 text-red-800 border-red-200',
};

export function CalculationResult({
  data,
  onNewCalculation,
}: CalculationResultProps) {
  const hasRegion = data.region && data.region !== 'andina';
  const hasStandards = data.standardsApplied && data.standardsApplied.length > 0;
  const hasWarnings = data.warnings && data.warnings.length > 0;
  const hasFormula = data.formulaUsed || data.wasteFactor;
  const productUrl = data.product.product_url;

  return (
    <div className="animate-fade-in-up">
      <div className="relative overflow-hidden rounded-uc-card border border-ultracem-blue/15 bg-ultracem-surface shadow-uc-card">
        <div className="relative border-b border-ultracem-gray-100 bg-ultracem-blue/5 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption font-semibold uppercase tracking-wider text-ultracem-gray-600">
                Hoja de especificaciones
              </p>
              <h3 className="text-h2 text-ultracem-blue">
                Resultado del cálculo
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ultracem-green/10">
              <CheckCircle className="h-5 w-5 text-ultracem-green" />
            </div>
          </div>
        </div>

        <div className="relative px-5 py-4">
          <div className="flex items-baseline gap-2">
            <span className="text-body-sm text-ultracem-gray-600">
              Volumen total:
            </span>
            <span className="text-h1 font-bold text-ultracem-blue">
              {data.volume_m3.toFixed(2)}
            </span>
            <span className="text-body-sm font-medium text-ultracem-gray-600">
              m³
            </span>
          </div>

          {hasRegion && (
            <div className="mt-2 flex items-center gap-1.5 text-body-sm text-ultracem-gray-600">
              <MapPin className="h-3.5 w-3.5 text-ultracem-blue" />
              <span>
                Región {data.region ? (REGION_LABELS[data.region] ?? data.regionLabel ?? data.region) : (data.regionLabel ?? 'Andina (templado)')}
                {data.region === 'caribe' && ' — ajuste costero aplicado'}
                {data.region === 'pacifica' && ' — ajuste por humedad aplicado'}
              </span>
            </div>
          )}

          {hasFormula && (
            <div className="mt-1.5 text-caption text-ultracem-gray-600">
              Fórmula: <span className="font-medium">{data.formulaUsed}</span>
              {data.wasteFactor && (
                <span> | Desperdicio: {(data.wasteFactor * 100 - 100).toFixed(0)}%</span>
              )}
            </div>
          )}
        </div>

        <div className="relative px-5 pb-4">
          <p className="mb-3 text-caption font-bold uppercase tracking-widest text-ultracem-gray-600">
            Materiales necesarios
          </p>
          <div className="overflow-hidden rounded-lg border border-ultracem-gray-100">
            <table className="w-full text-left text-body-sm">
              <thead>
                <tr className="bg-ultracem-surface-subtle">
                  <th className="px-4 py-2.5 text-caption font-bold uppercase tracking-wider text-ultracem-gray-600">
                    Material
                  </th>
                  <th className="px-4 py-2.5 text-right text-caption font-bold uppercase tracking-wider text-ultracem-gray-600">
                    Cantidad
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ultracem-gray-100">
                <tr>
                  <td className="px-4 py-3 font-medium text-ultracem-gray-900">
                    Cemento
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-h3 font-semibold text-ultracem-blue">
                      {data.materials.cement_bags_50kg}
                    </span>
                    <span className="ml-1 text-caption text-ultracem-gray-600">
                      sacos de 50kg
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-ultracem-gray-900">
                    Arena
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-h3 font-semibold text-ultracem-blue">
                      {data.materials.sand_m3}
                    </span>
                    <span className="ml-1 text-caption text-ultracem-gray-600">
                      m³
                    </span>
                  </td>
                </tr>
                {data.materials.gravel_m3 && (
                  <tr>
                    <td className="px-4 py-3 font-medium text-ultracem-gray-900">
                      Grava
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-h3 font-semibold text-ultracem-blue">
                        {data.materials.gravel_m3}
                      </span>
                      <span className="ml-1 text-caption text-ultracem-gray-600">
                        m³
                      </span>
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="px-4 py-3 font-medium text-ultracem-gray-900">
                    Agua
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-h3 font-semibold text-ultracem-blue">
                      {data.materials.water_liters}
                    </span>
                    <span className="ml-1 text-caption text-ultracem-gray-600">
                      litros
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ultracem-gray-500">
            Las cantidades incluyen un factor de desperdicio del{' '}
            {data.wasteFactor ? ((data.wasteFactor - 1) * 100).toFixed(0) : '5–15'}% para
            pérdidas en vaciado y compactación (estándar de obra según tipo de estructura).
            Dosificación basada en NSR-10 C.8.1.
          </p>
        </div>

        {/* Metodología del cálculo */}
        <div className="relative border-t border-ultracem-gray-100 px-5 py-4">
          <p className="mb-3 text-caption font-bold uppercase tracking-widest text-ultracem-gray-600">
            Cómo se calculó
          </p>
          <ul className="flex flex-col gap-2 text-caption text-ultracem-gray-600">
            <li className="flex gap-2">
              <span className="text-ultracem-blue">•</span>
              <span>
                <strong className="text-ultracem-gray-800">Volumen:</strong>{' '}
                Dimensiones ingresadas multiplicadas por el factor de desperdicio del{' '}
                {data.wasteFactor ? ((data.wasteFactor - 1) * 100).toFixed(0) : '5–15'}%.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-ultracem-blue">•</span>
              <span>
                <strong className="text-ultracem-gray-800">Dosificación:</strong>{' '}
                Tabla NSR-10 C.8.1 —{' '}
                {data.formulaUsed ?? 'slab_3000psi'} ={' '}
                {data.formulaUsed?.includes('4000')
                  ? '420'
                  : data.formulaUsed?.includes('plaster')
                    ? '280'
                    : data.formulaUsed?.includes('wall')
                      ? '300'
                      : '350'}{' '}
                kg de cemento por m³ de concreto.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-ultracem-blue">•</span>
              <span>
                <strong className="text-ultracem-gray-800">Ajuste regional:</strong>{' '}
                {data.region === 'caribe'
                  ? '+5% cemento y reducción de 0.05 en relación agua/cemento por alta temperatura (Camacol/Caribe).'
                  : data.region === 'pacifica'
                    ? '+3% cemento y reducción de 0.03 en relación agua/cemento por alta humedad.'
                    : 'Sin ajuste — clima templado andino.'}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-ultracem-blue">•</span>
              <span>
                <strong className="text-ultracem-gray-800">Comparativa CO₂:</strong>{' '}
                Baseline cemento genérico 0.95 kg CO₂/kg (referencia sectorial NTC-6112).
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-ultracem-blue">•</span>
              <span>
                <strong className="text-ultracem-gray-800">Ahorro estimado:</strong>{' '}
                Diferencia de precio vs productos comparables activos del mismo tipo en catálogo UltraCem.
              </span>
            </li>
          </ul>
        </div>

        {hasStandards && (
          <div className="relative border-t border-ultracem-gray-100 px-5 py-4">
            <p className="mb-1 text-caption font-bold uppercase tracking-widest text-ultracem-gray-600">
              Referencias técnicas
            </p>
            <p className="mb-3 text-caption text-ultracem-gray-500">
              Resúmenes UltraCem con base en normativa colombiana — no son citas literales.
            </p>
            <div className="flex flex-col gap-3">
              {data.standardsApplied!.map((s) => (
                <div
                  key={s.code}
                  className="rounded-lg border border-ultracem-blue/10 bg-ultracem-blue/5 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-body-sm font-semibold text-ultracem-blue">
                        {s.code}
                      </p>
                      <p className="text-caption font-medium text-ultracem-gray-700">
                        {s.title}
                      </p>
                    </div>
                    {s.sourceUrl && s.sourceUrl !== '#' && (
                      <a
                        href={s.sourceUrl}
                        target={s.sourceUrl.startsWith('/') ? undefined : '_blank'}
                        rel={s.sourceUrl.startsWith('/') ? undefined : 'noopener noreferrer'}
                        className="shrink-0 text-ultracem-blue hover:underline"
                        title="Ver ficha y fuente oficial"
                      >
                        <FileText className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <p className="mt-1.5 text-caption leading-relaxed text-ultracem-gray-600">
                    {s.implication}
                  </p>
                  {'articleRef' in s && s.articleRef && (
                    <p className="mt-1 text-caption italic text-ultracem-gray-500">
                      Verificar en: {s.articleRef}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {hasWarnings && (
          <div className="relative border-t border-ultracem-gray-100 px-5 py-3">
            <div className="flex flex-col gap-2">
              {data.warnings!.map((w, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-body-sm ${SEVERITY_STYLES[w.severity] ?? SEVERITY_STYLES.medium}`}
                >
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{w.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative border-t border-ultracem-gray-100 px-5 py-4">
          <p className="mb-3 text-caption font-bold uppercase tracking-widest text-ultracem-gray-600">
            Producto recomendado
          </p>
          <div className="rounded-lg border-2 border-ultracem-yellow/30 bg-ultracem-yellow/5 p-4">
            <div className="mb-2 flex items-center justify-between">
              {productUrl ? (
                <a
                  href={productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body font-bold text-ultracem-gray-900 hover:text-ultracem-blue hover:underline"
                >
                  {data.product.name}
                </a>
              ) : (
                <h4 className="text-body font-bold text-ultracem-gray-900">
                  {data.product.name}
                </h4>
              )}
              <span className="rounded bg-ultracem-blue px-2 py-0.5 text-caption font-bold uppercase tracking-wider text-white">
                {data.product.sku}
              </span>
            </div>
            <p className="mb-3 text-caption leading-relaxed text-ultracem-gray-600">
              {data.justification.technical_reason}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-caption text-ultracem-gray-600">
                Precio:
              </span>
              <span className="text-h3 font-semibold text-ultracem-blue">
                {formatCurrency(data.product.price_per_bag_cop)}
              </span>
              <span className="text-caption text-ultracem-gray-600">
                / bulto
              </span>
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-1 gap-3 border-t border-ultracem-gray-100 px-5 py-4 sm:grid-cols-2">
          <div className="rounded-lg border border-ultracem-green/20 bg-ultracem-green/5 p-4 animate-fade-in-up stagger-1">
            <div className="mb-2 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-ultracem-green" />
              <span className="text-caption font-bold uppercase tracking-wider text-ultracem-green">
                Ahorro económico
              </span>
            </div>
            <p className="mb-1 text-h2 font-semibold text-ultracem-green">
              {formatCurrency(data.savings_cop)}
            </p>
            <p className="text-caption leading-relaxed text-ultracem-gray-600">
              {data.justification.economic_reason}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ultracem-gray-500">
              *Referencia: productos comparables activos del mismo tipo en catálogo UltraCem.
            </p>
          </div>

          <div className="rounded-lg border border-ultracem-green/20 bg-ultracem-green/5 p-4 animate-fade-in-up stagger-2">
            <div className="mb-2 flex items-center gap-2">
              <TreePine className="h-4 w-4 text-ultracem-green" />
              <span className="text-caption font-bold uppercase tracking-wider text-ultracem-green">
                Impacto ambiental
              </span>
            </div>
            <p className="mb-1 text-h2 font-semibold text-ultracem-green">
              {Math.round(data.co2_saved_kg)} kg
            </p>
            <p className="text-caption leading-relaxed text-ultracem-gray-600">
              {data.justification.environmental_reason ||
                "Menor huella de carbono frente a alternativas convencionales."}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ultracem-gray-500">
              *Baseline: cemento genérico 0.95 kg CO₂/kg (NTC-6112).
            </p>
          </div>
        </div>

        <div className="hidden flex-col gap-2 border-t border-ultracem-gray-100 px-5 py-4 sm:flex sm:flex-row">
          <a
            href={data.product.datasheet_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn-secondary flex-1 items-center gap-2 ${
              !data.product.datasheet_url ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Ver ficha técnica</span>
          </a>
          <a
            href="https://b2b.ultracem.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 items-center gap-2"
          >
            <span>Cotizar ahora</span>
            <ArrowRight className="h-4 w-4" />
          </a>
          <button
            onClick={onNewCalculation}
            className="btn-outline flex-1 items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Nuevo cálculo</span>
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-uc-card border border-ultracem-blue/15 bg-ultracem-surface/95 p-2 shadow-uc-modal sm:hidden">
        <a
          href={data.product.datasheet_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ver ficha técnica"
          className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-uc-button bg-ultracem-yellow px-2 text-button text-ultracem-blue transition-colors hover:bg-ultracem-yellow-hover ${
            !data.product.datasheet_url ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <FileText className="h-4 w-4" />
          <span className="text-caption font-semibold">Ficha</span>
        </a>
        <a
          href="https://b2b.ultracem.co/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Cotizar ahora"
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-uc-button bg-ultracem-blue px-2 text-button text-white transition-colors hover:bg-ultracem-blue-dark"
        >
          <ArrowRight className="h-4 w-4" />
          <span className="text-caption font-semibold">Cotizar</span>
        </a>
        <button
          type="button"
          onClick={onNewCalculation}
          aria-label="Nuevo cálculo"
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-uc-button border-2 border-ultracem-blue px-2 text-button text-ultracem-blue transition-colors hover:bg-ultracem-blue hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="text-caption font-semibold">Nuevo</span>
        </button>
      </div>
    </div>
  );
}