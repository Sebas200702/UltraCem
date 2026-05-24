"use client";

import { History } from "lucide-react";

export interface PriceHistoryEntry {
  id: string;
  old_price: number | null;
  new_price: number;
  changed_by: string | null;
  created_at: string;
}

interface PriceHistoryTableProps {
  data: PriceHistoryEntry[];
  isLoading?: boolean;
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function PriceHistoryTable({ data, isLoading }: PriceHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface p-6 shadow-uc-card">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-ultracem-gray-600" />
          <h3 className="text-lg font-semibold text-ultracem-gray-900">
            Historial de precios
          </h3>
        </div>
        <div className="mt-4 flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-ultracem-blue border-t-transparent" />
          <span className="ml-2 text-sm text-ultracem-gray-600">
            Cargando historial...
          </span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface p-6 shadow-uc-card">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-ultracem-gray-600" />
          <h3 className="text-lg font-semibold text-ultracem-gray-900">
            Historial de precios
          </h3>
        </div>
        <p className="mt-4 text-sm text-ultracem-gray-600">
          No hay cambios de precio registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface p-6 shadow-uc-card">
      <div className="mb-4 flex items-center gap-2">
        <History className="h-5 w-5 text-ultracem-gray-600" />
        <h3 className="text-lg font-semibold text-ultracem-gray-900">
          Historial de precios
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ultracem-gray-100 text-xs font-semibold uppercase tracking-wider text-ultracem-gray-600">
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Precio anterior</th>
              <th className="px-4 py-3">Precio nuevo</th>
              <th className="px-4 py-3">Cambiado por</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-ultracem-gray-100 last:border-0"
              >
                <td className="whitespace-nowrap px-4 py-3 text-ultracem-gray-900">
                  {formatDate(entry.created_at)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ultracem-gray-600">
                  {entry.old_price !== null
                    ? formatCOP(entry.old_price)
                    : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-ultracem-gray-900">
                  {formatCOP(entry.new_price)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ultracem-gray-600">
                  {entry.changed_by || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
