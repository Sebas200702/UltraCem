"use client";

import { useState, useCallback } from "react";
import {
  ArrowRight,
  Ruler,
  HardHat,
  Layers,
  Columns,
  Paintbrush,
  Calculator,
} from "lucide-react";

export type StructureType = "slab" | "wall" | "column" | "plaster";

export interface DimensionsInput {
  length_m?: number;
  width_m?: number;
  height_m?: number;
  thickness_m?: number;
  diameter_m?: number;
  area_m2?: number;
}

export interface CalculatorFormData {
  structureType: StructureType;
  dimensions: DimensionsInput;
  resistancePsi: number;
}

interface CalculatorFormProps {
  onCalculate: (data: CalculatorFormData) => void;
  isLoading: boolean;
}

const STRUCTURE_OPTIONS: { value: StructureType; label: string; icon: React.ElementType }[] = [
  { value: "slab", label: "Placa / Losa", icon: Layers },
  { value: "wall", label: "Muro", icon: HardHat },
  { value: "column", label: "Columna", icon: Columns },
  { value: "plaster", label: "Revoque", icon: Paintbrush },
];

function NumberInput({
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
  step = 0.01,
  unit,
}: {
  label: string;
  value: number | undefined;
  onChange: (val: number | undefined) => void;
  placeholder: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-caption font-semibold uppercase tracking-wider text-ultracem-gray-600">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => {
            const val = e.target.value === "" ? undefined : Number(e.target.value);
            onChange(val);
          }}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className="w-full rounded-uc-input border border-ultracem-gray-100 bg-ultracem-surface px-4 py-3 text-body-sm text-ultracem-gray-900 outline-none transition-all placeholder:text-ultracem-gray-400 focus:border-ultracem-blue focus:ring-2 focus:ring-ultracem-blue/10"
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-caption text-ultracem-gray-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export function CalculatorForm({ onCalculate, isLoading }: CalculatorFormProps) {
  const [structureType, setStructureType] = useState<StructureType>("slab");
  const [dimensions, setDimensions] = useState<DimensionsInput>({});
  const [resistancePsi, setResistancePsi] = useState<number>(3000);
  const [columnShape, setColumnShape] = useState<"rectangular" | "circular">("rectangular");

  const updateDimension = useCallback(
    (key: keyof DimensionsInput, val: number | undefined) => {
      setDimensions((prev) => ({ ...prev, [key]: val }));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onCalculate({ structureType, dimensions, resistancePsi });
    },
    [structureType, dimensions, resistancePsi, onCalculate]
  );

  const renderDimensionInputs = () => {
    switch (structureType) {
      case "slab":
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <NumberInput
              label="Largo"
              value={dimensions.length_m}
              onChange={(v) => updateDimension("length_m", v)}
              placeholder="Ej: 5"
              unit="m"
            />
            <NumberInput
              label="Ancho"
              value={dimensions.width_m}
              onChange={(v) => updateDimension("width_m", v)}
              placeholder="Ej: 4"
              unit="m"
            />
            <NumberInput
              label="Espesor"
              value={dimensions.thickness_m}
              onChange={(v) => updateDimension("thickness_m", v)}
              placeholder="Ej: 0.10"
              unit="m"
            />
          </div>
        );
      case "wall":
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <NumberInput
              label="Largo"
              value={dimensions.length_m}
              onChange={(v) => updateDimension("length_m", v)}
              placeholder="Ej: 3"
              unit="m"
            />
            <NumberInput
              label="Alto"
              value={dimensions.height_m}
              onChange={(v) => updateDimension("height_m", v)}
              placeholder="Ej: 2.5"
              unit="m"
            />
            <NumberInput
              label="Espesor"
              value={dimensions.thickness_m}
              onChange={(v) => updateDimension("thickness_m", v)}
              placeholder="Ej: 0.15"
              unit="m"
            />
          </div>
        );
      case "column":
        return (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setColumnShape("rectangular")}
                className={`rounded-uc-button px-4 py-2 text-caption font-medium transition-colors ${
                  columnShape === "rectangular"
                    ? "bg-ultracem-blue text-white"
                    : "border border-ultracem-gray-100 bg-ultracem-surface text-ultracem-gray-600 hover:bg-ultracem-gray-50"
                }`}
              >
                Rectangular
              </button>
              <button
                type="button"
                onClick={() => setColumnShape("circular")}
                className={`rounded-uc-button px-4 py-2 text-caption font-medium transition-colors ${
                  columnShape === "circular"
                    ? "bg-ultracem-blue text-white"
                    : "border border-ultracem-gray-100 bg-ultracem-surface text-ultracem-gray-600 hover:bg-ultracem-gray-50"
                }`}
              >
                Circular
              </button>
            </div>
            {columnShape === "rectangular" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <NumberInput
                  label="Base"
                  value={dimensions.length_m}
                  onChange={(v) => updateDimension("length_m", v)}
                  placeholder="Ej: 0.30"
                  unit="m"
                />
                <NumberInput
                  label="Base"
                  value={dimensions.width_m}
                  onChange={(v) => updateDimension("width_m", v)}
                  placeholder="Ej: 0.30"
                  unit="m"
                />
                <NumberInput
                  label="Altura"
                  value={dimensions.height_m}
                  onChange={(v) => updateDimension("height_m", v)}
                  placeholder="Ej: 3"
                  unit="m"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <NumberInput
                  label="Diámetro"
                  value={dimensions.diameter_m}
                  onChange={(v) => updateDimension("diameter_m", v)}
                  placeholder="Ej: 0.30"
                  unit="m"
                />
                <NumberInput
                  label="Altura"
                  value={dimensions.height_m}
                  onChange={(v) => updateDimension("height_m", v)}
                  placeholder="Ej: 3"
                  unit="m"
                />
              </div>
            )}
          </div>
        );
      case "plaster":
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NumberInput
              label="Área"
              value={dimensions.area_m2}
              onChange={(v) => updateDimension("area_m2", v)}
              placeholder="Ej: 50"
              unit="m²"
            />
            <NumberInput
              label="Espesor"
              value={dimensions.thickness_m}
              onChange={(v) => updateDimension("thickness_m", v)}
              placeholder="Ej: 0.02"
              unit="m"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label className="text-caption font-semibold uppercase tracking-wider text-ultracem-gray-600">
          Tipo de estructura
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STRUCTURE_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setStructureType(option.value);
                  setDimensions({});
                }}
                className={`flex flex-col items-center gap-2 rounded-uc-card border p-4 transition-all ${
                  structureType === option.value
                    ? "border-ultracem-blue bg-ultracem-blue/5 text-ultracem-blue"
                    : "border-ultracem-gray-100 bg-ultracem-surface text-ultracem-gray-600 hover:border-ultracem-gray-200 hover:bg-ultracem-gray-50"
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-caption font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-ultracem-blue" />
          <h3 className="text-body font-semibold text-ultracem-gray-900">Dimensiones</h3>
        </div>
        {renderDimensionInputs()}
      </div>

      <div className="space-y-3">
        <label className="text-caption font-semibold uppercase tracking-wider text-ultracem-gray-600">
          Resistencia del concreto (opcional)
        </label>
        <div className="flex gap-2">
          {[3000, 4000, 5000].map((psi) => (
            <button
              key={psi}
              type="button"
              onClick={() => setResistancePsi(psi)}
              className={`rounded-uc-button px-4 py-2 text-caption font-medium transition-colors ${
                resistancePsi === psi
                  ? "bg-ultracem-blue text-white"
                  : "border border-ultracem-gray-100 bg-ultracem-surface text-ultracem-gray-600 hover:bg-ultracem-gray-50"
              }`}
            >
              {psi} psi
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-uc-button bg-ultracem-blue px-6 py-4 text-body font-semibold text-white shadow-uc-button transition-all hover:bg-ultracem-blue/90 active:scale-[0.98] disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Calculando...</span>
          </>
        ) : (
          <>
            <Calculator className="h-5 w-5" />
            <span>Calcular materiales</span>
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>
    </form>
  );
}
