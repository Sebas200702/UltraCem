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

export interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export type ProductCategory = ProductFormData["category"];
export type ProductFormErrors = Record<string, string>;
