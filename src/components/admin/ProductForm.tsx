"use client";

import { useState } from "react";
import { Save, X } from "lucide-react";

export interface ProductFormData {
  sku: string;
  name: string;
  category: "structural" | "plaster" | "specialty";
  subcategory: string;
  technical_specs: string;
  price_per_bag_cop: number;
  co2_per_kg: number;
  datasheet_url: string;
  is_active: boolean;
}

interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  structural: "Estructural",
  plaster: "Pañete / Revoque",
  specialty: "Especialidad",
};

const CATEGORIES = ["structural", "plaster", "specialty"] as const;

export function ProductForm({
  initialData,
  onSubmit,
  isLoading = false,
  onCancel,
}: ProductFormProps) {
  const [sku, setSku] = useState(initialData?.sku ?? "");
  const [name, setName] = useState(initialData?.name ?? "");
  const [category, setCategory] = useState<string>(
    initialData?.category ?? "structural"
  );
  const [subcategory, setSubcategory] = useState(
    initialData?.subcategory ?? ""
  );
  const [pricePerBagCop, setPricePerBagCop] = useState(
    initialData?.price_per_bag_cop?.toString() ?? ""
  );
  const [co2PerKg, setCo2PerKg] = useState(
    initialData?.co2_per_kg?.toString() ?? "0.900"
  );
  const [datasheetUrl, setDatasheetUrl] = useState(
    initialData?.datasheet_url ?? ""
  );
  const [technicalSpecs, setTechnicalSpecs] = useState(
    initialData?.technical_specs ?? "{}"
  );
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!sku.trim()) {
      newErrors.sku = "El SKU es obligatorio.";
    }

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio.";
    }

    if (!category) {
      newErrors.category = "La categoría es obligatoria.";
    }

    if (!pricePerBagCop || Number(pricePerBagCop) <= 0) {
      newErrors.price_per_bag_cop = "El precio debe ser mayor a 0.";
    }

    if (co2PerKg && Number(co2PerKg) < 0) {
      newErrors.co2_per_kg = "El CO₂ por kg no puede ser negativo.";
    }

    try {
      JSON.parse(technicalSpecs);
    } catch {
      newErrors.technical_specs =
        "Las especificaciones técnicas deben ser JSON válido.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    await onSubmit({
      sku: sku.trim(),
      name: name.trim(),
      category: category as ProductFormData["category"],
      subcategory: subcategory.trim(),
      technical_specs: technicalSpecs,
      price_per_bag_cop: Number(pricePerBagCop),
      co2_per_kg: Number(co2PerKg || "0.900"),
      datasheet_url: datasheetUrl.trim(),
      is_active: isActive,
    });
  };

  const inputClass =
    "min-h-12 w-full rounded-uc-input border border-ultracem-border bg-ultracem-surface px-4 text-body text-ultracem-gray-900 placeholder:text-ultracem-gray-600 focus:border-ultracem-blue focus:outline-none focus:ring-2 focus:ring-uc-focus focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none";
  const errorClass = "mt-1 text-xs text-ultracem-error";
  const labelClass =
    "block text-sm font-medium text-ultracem-gray-900 mb-1.5";
  const selectClass =
    "min-h-12 w-full rounded-uc-input border border-ultracem-border bg-ultracem-surface px-4 text-body text-ultracem-gray-900 focus:border-ultracem-blue focus:outline-none focus:ring-2 focus:ring-uc-focus focus:ring-offset-1 appearance-none disabled:opacity-50 disabled:pointer-events-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="sku" className={labelClass}>
            SKU
          </label>
          <input
            id="sku"
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className={`${inputClass} ${errors.sku ? "border-ultracem-error" : ""}`}
            placeholder="Ej: UC-EST-GR-3000"
            disabled={isLoading}
          />
          {errors.sku && <p className={errorClass}>{errors.sku}</p>}
        </div>

        <div>
          <label htmlFor="name" className={labelClass}>
            Nombre
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputClass} ${errors.name ? "border-ultracem-error" : ""}`}
            placeholder="Ej: UltraCem Estructural Gris 3000 PSI"
            disabled={isLoading}
          />
          {errors.name && <p className={errorClass}>{errors.name}</p>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="category" className={labelClass}>
            Categoría
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${selectClass} ${errors.category ? "border-ultracem-error" : ""}`}
            disabled={isLoading}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
          {errors.category && <p className={errorClass}>{errors.category}</p>}
        </div>

        <div>
          <label htmlFor="subcategory" className={labelClass}>
            Subcategoría
          </label>
          <input
            id="subcategory"
            type="text"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className={inputClass}
            placeholder="Ej: Concreto 3000 PSI"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="price_per_bag_cop" className={labelClass}>
            Precio por bulto (COP)
          </label>
          <input
            id="price_per_bag_cop"
            type="number"
            min="0"
            step="100"
            value={pricePerBagCop}
            onChange={(e) => setPricePerBagCop(e.target.value)}
            className={`${inputClass} ${errors.price_per_bag_cop ? "border-ultracem-error" : ""}`}
            placeholder="Ej: 28500"
            disabled={isLoading}
          />
          {errors.price_per_bag_cop && (
            <p className={errorClass}>{errors.price_per_bag_cop}</p>
          )}
        </div>

        <div>
          <label htmlFor="co2_per_kg" className={labelClass}>
            CO₂ por kg
          </label>
          <input
            id="co2_per_kg"
            type="number"
            min="0"
            step="0.001"
            value={co2PerKg}
            onChange={(e) => setCo2PerKg(e.target.value)}
            className={`${inputClass} ${errors.co2_per_kg ? "border-ultracem-error" : ""}`}
            placeholder="Ej: 0.900"
            disabled={isLoading}
          />
          {errors.co2_per_kg && (
            <p className={errorClass}>{errors.co2_per_kg}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="datasheet_url" className={labelClass}>
          URL ficha técnica
        </label>
        <input
          id="datasheet_url"
          type="url"
          value={datasheetUrl}
          onChange={(e) => setDatasheetUrl(e.target.value)}
          className={inputClass}
          placeholder="https://..."
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="technical_specs" className={labelClass}>
          Especificaciones técnicas (JSON)
        </label>
        <textarea
          id="technical_specs"
          rows={4}
          value={technicalSpecs}
          onChange={(e) => setTechnicalSpecs(e.target.value)}
          className={`${inputClass} min-h-[100px] resize-y ${errors.technical_specs ? "border-ultracem-error" : ""}`}
          disabled={isLoading}
        />
        {errors.technical_specs && (
          <p className={errorClass}>{errors.technical_specs}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          id="is_active"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-ultracem-border text-ultracem-blue focus:ring-uc-focus"
          disabled={isLoading}
        />
        <label htmlFor="is_active" className="text-sm text-ultracem-gray-900">
          Producto activo
        </label>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary inline-flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {initialData ? "Guardar cambios" : "Crear producto"}
            </>
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="btn-outline inline-flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
