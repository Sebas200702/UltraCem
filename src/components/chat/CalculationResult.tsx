"use client";

import { CalculationData } from "./ChatContainer";
import { useState } from "react";
import {
  CheckCircle,
  TreePine,
  Wallet,
  FileText,
  RotateCcw,
  ArrowRight,
  MessageCircle,
  Copy,
  Share2,
} from "lucide-react";

interface CalculationResultProps {
  data: CalculationData;
  onNewCalculation: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function generateSummary(data: CalculationData): string {
  const lines = [
    `*Resultado del cálculo UltraCem*`,
    ``,
    `*Volumen total:* ${data.volume_m3.toFixed(2)} m³`,
    `*Materiales necesarios:*`,
    `- Cemento: ${data.materials.cement_bags_50kg} sacos de 50kg`,
    `- Arena: ${data.materials.sand_m3} m³`,
    ...(data.materials.gravel_m3 ? [`- Grava: ${data.materials.gravel_m3} m³`] : []),
    `- Agua: ${data.materials.water_liters} litros`,
    ``,
    `*Producto recomendado:* ${data.product.name} (${data.product.sku})`,
    `*Precio por bulto:* ${formatCurrency(data.product.price_per_bag_cop)}`,
    `*Costo estimado:* ${formatCurrency(data.estimated_cost_cop)}`,
    `*Ahorro económico:* ${formatCurrency(data.savings_cop)}`,
    `*Impacto ambiental:* ${Math.round(data.co2_saved_kg)} kg de CO₂ ahorrados`,
  ];
  return lines.join("\n");
}

export function CalculationResult({ data, onNewCalculation }: CalculationResultProps) {
  const [copied, setCopied] = useState(false);

  const summary = generateSummary(data);

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(summary);
    window.open(`https://wa.me/573164034858?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Error al copiar al portapapeles:", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Resultado del cálculo UltraCem",
          text: summary,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          handleCopySummary();
        }
      }
    } else {
      handleCopySummary();
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Spec Sheet Container */}
      <div className="corner-brackets relative overflow-hidden border border-ultracem-blue/20 bg-ultracem-surface shadow-uc-card">
        {/* Blueprint grid background inside card */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,62,120,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,62,120,0.3) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Header */}
        <div className="relative border-b border-dashed border-ultracem-blue/20 bg-ultracem-blue/5 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-ultracem-gray-600">
                Hoja de especificaciones
              </p>
              <h3 className="font-display text-2xl tracking-wide text-ultracem-blue">
                RESULTADO DEL CÁLCULO
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ultracem-green/10">
              <CheckCircle className="h-5 w-5 text-ultracem-green" />
            </div>
          </div>
        </div>

        {/* Volume */}
        <div className="relative px-5 py-4">
          <div className="flex items-baseline gap-2">
            <span className="text-body-sm text-ultracem-gray-600">Volumen total:</span>
            <span className="font-display text-3xl text-ultracem-blue">
              {data.volume_m3.toFixed(2)}
            </span>
            <span className="text-sm font-medium text-ultracem-gray-600">m³</span>
          </div>
        </div>

        {/* Materials Table */}
        <div className="relative px-5 pb-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-ultracem-gray-600">
            Materiales necesarios
          </p>
          <div className="overflow-hidden rounded-lg border border-ultracem-gray-100">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-ultracem-surface-subtle">
                  <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-ultracem-gray-600">
                    Material
                  </th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-ultracem-gray-600">
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
                    <span className="font-display text-lg text-ultracem-blue">
                      {data.materials.cement_bags_50kg}
                    </span>
                    <span className="ml-1 text-xs text-ultracem-gray-600">
                      sacos de 50kg
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-ultracem-gray-900">
                    Arena
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-display text-lg text-ultracem-blue">
                      {data.materials.sand_m3}
                    </span>
                    <span className="ml-1 text-xs text-ultracem-gray-600">m³</span>
                  </td>
                </tr>
                {data.materials.gravel_m3 && (
                  <tr>
                    <td className="px-4 py-3 font-medium text-ultracem-gray-900">
                      Grava
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-display text-lg text-ultracem-blue">
                        {data.materials.gravel_m3}
                      </span>
                      <span className="ml-1 text-xs text-ultracem-gray-600">m³</span>
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="px-4 py-3 font-medium text-ultracem-gray-900">
                    Agua
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-display text-lg text-ultracem-blue">
                      {data.materials.water_liters}
                    </span>
                    <span className="ml-1 text-xs text-ultracem-gray-600">litros</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Recommendation */}
        <div className="relative border-t border-dashed border-ultracem-blue/20 px-5 py-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-ultracem-gray-600">
            Producto recomendado
          </p>
          <div className="rounded-lg border-2 border-ultracem-yellow/30 bg-ultracem-yellow/5 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-base font-bold text-ultracem-gray-900">
                {data.product.name}
              </h4>
              <span className="rounded bg-ultracem-blue px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-white">
                {data.product.sku}
              </span>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-ultracem-gray-600">
              {data.justification.technical_reason}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-ultracem-gray-600">Precio:</span>
              <span className="font-display text-xl text-ultracem-blue">
                {formatCurrency(data.product.price_per_bag_cop)}
              </span>
              <span className="text-xs text-ultracem-gray-600">/ bulto</span>
            </div>
          </div>
        </div>

        {/* Savings & Environmental */}
        <div className="relative grid grid-cols-1 gap-3 border-t border-dashed border-ultracem-blue/20 px-5 py-4 sm:grid-cols-2">
          {/* Economic savings */}
          <div className="rounded-lg border border-ultracem-green/20 bg-ultracem-green/5 p-4 animate-fade-in-up stagger-1">
            <div className="mb-2 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-ultracem-green" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-ultracem-green">
                Ahorro económico
              </span>
            </div>
            <p className="mb-1 font-display text-2xl text-ultracem-green">
              {formatCurrency(data.savings_cop)}
            </p>
            <p className="text-[10px] leading-relaxed text-ultracem-gray-600">
              {data.justification.economic_reason}
            </p>
          </div>

          {/* Environmental impact */}
          <div className="rounded-lg border border-ultracem-green/20 bg-ultracem-green/5 p-4 animate-fade-in-up stagger-2">
            <div className="mb-2 flex items-center gap-2">
              <TreePine className="h-4 w-4 text-ultracem-green" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-ultracem-green">
                Impacto ambiental
              </span>
            </div>
            <p className="mb-1 font-display text-2xl text-ultracem-green">
              {Math.round(data.co2_saved_kg)} kg
            </p>
            <p className="text-[10px] leading-relaxed text-ultracem-gray-600">
              {data.justification.environmental_reason || 'Menor huella de carbono frente a alternativas convencionales.'}
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="relative flex flex-col gap-2 border-t border-ultracem-gray-100 px-5 py-4 sm:flex-row">
          <a
            href={data.product.datasheet_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn-secondary flex-1 items-center gap-2 ${!data.product.datasheet_url ? 'pointer-events-none opacity-50' : ''}`}
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

        {/* Share Actions */}
        <div className="relative flex flex-col gap-2 border-t border-dashed border-ultracem-blue/20 px-5 py-4 sm:flex-row">
          <button
            onClick={handleWhatsAppShare}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#25D366" }}
          >
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={handleCopySummary}
            className="btn-outline flex flex-1 items-center justify-center gap-2"
          >
            <Copy className="h-4 w-4" />
            <span>Copiar resumen</span>
          </button>
          <button
            onClick={handleNativeShare}
            className="btn-secondary flex flex-1 items-center justify-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            <span>Compartir</span>
          </button>
        </div>

        {/* Toast notification */}
        {copied && (
          <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-ultracem-gray-900 px-4 py-2 text-xs font-medium text-white shadow-lg animate-fade-in-up">
            ¡Copiado al portapapeles!
          </div>
        )}
      </div>
    </div>
  );
}
