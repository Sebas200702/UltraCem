"use client";

import {
  ArrowRight,
  CheckCircle,
  Download,
  FileText,
  Loader2,
  RotateCcw,
  TreePine,
  Wallet,
} from "lucide-react";
import { usePDFDownload } from "@/components/calculator/use-pdf-download";

export interface CalculatorResultData {
  volume_m3: number;
  materials: {
    cement_bags_50kg: number;
    sand_m3: number;
    gravel_m3?: number;
    water_liters: number;
  };
  product: {
    id: string;
    name: string;
    sku: string;
    price_per_bag_cop: number;
    datasheet_url: string | null;
  };
  quantity_bags: number;
  estimated_cost_cop: number;
  savings_cop: number;
  co2_saved_kg: number;
  justification: {
    technical_reason: string;
    economic_reason: string;
    environmental_reason?: string;
  };
}

interface CalculatorResultProps {
  data: CalculatorResultData;
  onReset: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function CalculatorResult({ data, onReset }: CalculatorResultProps) {
  const { elementRef, downloadPDF, isGenerating } = usePDFDownload({
    filename: `ultracem-especificaciones-${data.product.sku.toLowerCase()}.pdf`,
  });

  return (
    <div className="animate-fade-in-up" ref={elementRef}>
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
                {data.materials.gravel_m3 != null && (
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
        </div>

        <div className="relative border-t border-ultracem-gray-100 px-5 py-4">
          <p className="mb-3 text-caption font-bold uppercase tracking-widest text-ultracem-gray-600">
            Producto recomendado
          </p>
          <div className="rounded-lg border-2 border-ultracem-yellow/30 bg-ultracem-yellow/5 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-body font-bold text-ultracem-gray-900">
                {data.product.name}
              </h4>
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
          <div className="rounded-lg border border-ultracem-green/20 bg-ultracem-green/5 p-4">
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
          </div>

          <div className="rounded-lg border border-ultracem-green/20 bg-ultracem-green/5 p-4">
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
          </div>
        </div>

        <div className="relative flex flex-col gap-2 border-t border-ultracem-gray-100 px-5 py-4 sm:flex-row">
          <button
            onClick={downloadPDF}
            disabled={isGenerating}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-uc-button border border-ultracem-gray-200 bg-ultracem-surface px-4 py-3 text-caption font-semibold text-ultracem-gray-700 transition-colors hover:bg-ultracem-gray-50 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generando PDF...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Descargar PDF</span>
              </>
            )}
          </button>
          <a
            href={data.product.datasheet_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-uc-button border border-ultracem-gray-200 bg-ultracem-surface px-4 py-3 text-caption font-semibold text-ultracem-gray-700 transition-colors hover:bg-ultracem-gray-50 ${
              !data.product.datasheet_url ? "pointer-events-none opacity-50" : ""
            }`}
            aria-disabled={!data.product.datasheet_url}
          >
            <FileText className="h-4 w-4" />
            <span>Ver ficha técnica</span>
          </a>
          <a
            href="https://b2b.ultracem.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-uc-button bg-ultracem-blue px-4 py-3 text-caption font-semibold text-white shadow-uc-button transition-colors hover:bg-ultracem-blue/90"
          >
            <span>Cotizar ahora</span>
            <ArrowRight className="h-4 w-4" />
          </a>
          <button
            onClick={onReset}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-uc-button border border-ultracem-gray-200 bg-ultracem-surface px-4 py-3 text-caption font-semibold text-ultracem-gray-700 transition-colors hover:bg-ultracem-gray-50"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Nuevo cálculo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
