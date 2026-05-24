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

export interface ComparisonData {
  ultracem: {
    productName: string;
    sacos: number;
    precioSaco: number;
    costoBase: number;
    wasteFactor: number;
    costoFinal: number;
    co2Total: number;
  };
  generico: {
    precioSaco: number;
    costoBase: number;
    wasteFactor: number;
    costoFinal: number;
    co2Total: number;
  };
  ahorroPesos: number;
  ahorroCO2Kg: number;
  ahorroPorc: number;
  wasteFactorBase: number;
}

export interface RecommendationResult {
  product: Product;
  quantity_bags: number;
  estimated_cost_cop: number;
  savings_cop: number;
  co2_saved_kg: number;
  justification: ProductJustification;
  comparison: ComparisonData;
}
