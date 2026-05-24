import type { Product } from "@/types/database.types";

export interface PriceChange {
  productId: string;
  oldPrice: number | null;
  newPrice: number;
  changedBy: string | null;
}

export interface ProductInput {
  sku: string;
  name: string;
  category: "structural" | "plaster" | "specialty";
  subcategory?: string;
  technical_specs: Record<string, unknown>;
  price_per_bag_cop: number;
  co2_per_kg: number;
  datasheet_url?: string;
  is_active?: boolean;
}

export interface PriceStaleness {
  stale: boolean;
  daysOld: number;
  disclaimer: string;
}
