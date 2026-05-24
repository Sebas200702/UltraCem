import type {
  Materials,
  Product,
  ProductJustification,
  StructureType,
} from "@/types/database.types";

export interface RecommendationInput {
  structureType: StructureType;
  materials: Materials;
  resistancePsi: number;
  isQuickProject?: boolean;
}

export interface CostAnalysis {
  estimated_cost_cop: number;
  savings_cop: number;
  co2_saved_kg: number;
}

export interface RecommendationResult {
  product: Product;
  quantity_bags: number;
  estimated_cost_cop: number;
  savings_cop: number;
  co2_saved_kg: number;
  justification: ProductJustification;
}
