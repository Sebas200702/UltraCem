import { type FormEvent, useState } from "react";
import {
  type ProductFormData,
  type ProductFormErrors,
  type ProductFormProps,
} from '@/components/admin/product-form/product-form-types';

export function useProductForm({
  initialData,
  onSubmit,
}: Pick<ProductFormProps, "initialData" | "onSubmit">) {
  const [sku, setSku] = useState(initialData?.sku ?? "");
  const [name, setName] = useState(initialData?.name ?? "");
  const [category, setCategory] = useState<ProductFormData["category"]>(
    initialData?.category ?? "structural",
  );
  const [subcategory, setSubcategory] = useState(
    initialData?.subcategory ?? "",
  );
  const [pricePerBagCop, setPricePerBagCop] = useState(
    initialData?.price_per_bag_cop?.toString() ?? "",
  );
  const [co2PerKg, setCo2PerKg] = useState(
    initialData?.co2_per_kg?.toString() ?? "0.900",
  );
  const [datasheetUrl, setDatasheetUrl] = useState(
    initialData?.datasheet_url ?? "",
  );
  const [technicalSpecs, setTechnicalSpecs] = useState(
    initialData?.technical_specs ?? "{}",
  );
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [errors, setErrors] = useState<ProductFormErrors>({});

  const validate = (): boolean => {
    const newErrors: ProductFormErrors = {};

    if (!sku.trim()) newErrors.sku = "El SKU es obligatorio.";
    if (!name.trim()) newErrors.name = "El nombre es obligatorio.";
    if (!category) newErrors.category = "La categoría es obligatoria.";

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      sku: sku.trim(),
      name: name.trim(),
      category,
      subcategory: subcategory.trim(),
      technical_specs: technicalSpecs,
      price_per_bag_cop: Number(pricePerBagCop),
      co2_per_kg: Number(co2PerKg || "0.900"),
      datasheet_url: datasheetUrl.trim(),
      is_active: isActive,
    });
  };

  return {
    category,
    co2PerKg,
    datasheetUrl,
    errors,
    handleSubmit,
    isActive,
    name,
    pricePerBagCop,
    setCategory,
    setCo2PerKg,
    setDatasheetUrl,
    setIsActive,
    setName,
    setPricePerBagCop,
    setSku,
    setSubcategory,
    setTechnicalSpecs,
    sku,
    subcategory,
    technicalSpecs,
  };
}
