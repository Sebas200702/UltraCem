import { type ProductCategory } from '@/components/admin/product-form/product-form-types';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  structural: "Estructural",
  plaster: "Pañete / Revoque",
  specialty: "Especialidad",
};

export const CATEGORIES = [
  "structural",
  "plaster",
  "specialty",
] as const satisfies readonly ProductCategory[];
