import { type ComponentType } from "react";
import type { ComparisonData } from "@/domains/recommendation/recommendation.types";
import type { AppliedStandard } from "@/types";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export type { AppliedStandard };

export interface CalculationData {
  volume_m3: number;
  materials: {
    cement_bags_50kg: number;
    sand_m3: number;
    gravel_m3?: number;
    water_liters: number;
  };
  product: {
    id: string;
    name: string;
    sku: string;
    price_per_bag_cop: number;
    product_url?: string | null;
    datasheet_url: string | null;
  };
  quantity_bags: number;
  estimated_cost_cop: number;
  savings_cop: number;
  co2_saved_kg: number;
  justification: {
    technical_reason: string;
    economic_reason: string;
    environmental_reason?: string;
  };
  region?: string | null;
  regionLabel?: string;
  standardsApplied?: AppliedStandard[];
  formulaUsed?: string;
  wasteFactor?: number;
  warnings?: Array<{ type: string; message: string; severity: string }>;
  comparison?: ComparisonData;
}

export interface QuickAction {
  label: string;
  icon: ComponentType<{ className?: string }>;
  prompt: string;
}