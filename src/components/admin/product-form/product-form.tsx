"use client";

import { Save, X } from "lucide-react";
import { CATEGORIES, CATEGORY_LABELS } from '@/components/admin/product-form/product-form-data';
import { type ProductFormProps } from '@/components/admin/product-form/product-form-types';
import { useProductForm } from '@/components/admin/product-form/use-product-form';

const inputClass =
  "min-h-12 w-full rounded-uc-input border border-ultracem-border bg-ultracem-surface px-4 text-body text-ultracem-gray-900 placeholder:text-ultracem-gray-600 focus:border-ultracem-blue focus:outline-none focus:ring-2 focus:ring-uc-focus focus:ring-offset-1 disabled:pointer-events-none disabled:opacity-50";
const errorClass = "mt-1 text-caption text-ultracem-error";
const labelClass =
  "mb-1.5 block text-body-sm font-medium text-ultracem-gray-900";
const selectClass =
  "min-h-12 w-full appearance-none rounded-uc-input border border-ultracem-border bg-ultracem-surface px-4 text-body text-ultracem-gray-900 focus:border-ultracem-blue focus:outline-none focus:ring-2 focus:ring-uc-focus focus:ring-offset-1 disabled:pointer-events-none disabled:opacity-50";

export function ProductForm({
  initialData,
  onSubmit,
  isLoading = false,
  onCancel,
}: ProductFormProps) {
  const form = useProductForm({ initialData, onSubmit });

  return (
    <form onSubmit={form.handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="sku" className={labelClass}>
            SKU
          </label>
          <input
            id="sku"
            type="text"
            value={form.sku}
            onChange={(e) => form.setSku(e.target.value)}
            className={`${inputClass} ${form.errors.sku ? "border-ultracem-error" : ""}`}
            placeholder="Ej: UC-EST-GR-3000"
            disabled={isLoading}
          />
          {form.errors.sku && <p className={errorClass}>{form.errors.sku}</p>}
        </div>

        <div>
          <label htmlFor="name" className={labelClass}>
            Nombre
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => form.setName(e.target.value)}
            className={`${inputClass} ${form.errors.name ? "border-ultracem-error" : ""}`}
            placeholder="Ej: UltraCem Estructural Gris 3000 PSI"
            disabled={isLoading}
          />
          {form.errors.name && (
            <p className={errorClass}>{form.errors.name}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="category" className={labelClass}>
            Categoría
          </label>
          <select
            id="category"
            value={form.category}
            onChange={(e) =>
              form.setCategory(e.target.value as typeof form.category)
            }
            className={`${selectClass} ${form.errors.category ? "border-ultracem-error" : ""}`}
            disabled={isLoading}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
          {form.errors.category && (
            <p className={errorClass}>{form.errors.category}</p>
          )}
        </div>

        <div>
          <label htmlFor="subcategory" className={labelClass}>
            Subcategoría
          </label>
          <input
            id="subcategory"
            type="text"
            value={form.subcategory}
            onChange={(e) => form.setSubcategory(e.target.value)}
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
            value={form.pricePerBagCop}
            onChange={(e) => form.setPricePerBagCop(e.target.value)}
            className={`${inputClass} ${form.errors.price_per_bag_cop ? "border-ultracem-error" : ""}`}
            placeholder="Ej: 28500"
            disabled={isLoading}
          />
          {form.errors.price_per_bag_cop && (
            <p className={errorClass}>{form.errors.price_per_bag_cop}</p>
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
            value={form.co2PerKg}
            onChange={(e) => form.setCo2PerKg(e.target.value)}
            className={`${inputClass} ${form.errors.co2_per_kg ? "border-ultracem-error" : ""}`}
            placeholder="Ej: 0.900"
            disabled={isLoading}
          />
          {form.errors.co2_per_kg && (
            <p className={errorClass}>{form.errors.co2_per_kg}</p>
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
          value={form.datasheetUrl}
          onChange={(e) => form.setDatasheetUrl(e.target.value)}
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
          value={form.technicalSpecs}
          onChange={(e) => form.setTechnicalSpecs(e.target.value)}
          className={`${inputClass} min-h-[100px] resize-y ${
            form.errors.technical_specs ? "border-ultracem-error" : ""
          }`}
          disabled={isLoading}
        />
        {form.errors.technical_specs && (
          <p className={errorClass}>{form.errors.technical_specs}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          id="is_active"
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => form.setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-ultracem-border text-ultracem-blue focus:ring-uc-focus"
          disabled={isLoading}
        />
        <label htmlFor="is_active" className="text-body-sm text-ultracem-gray-900">
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
