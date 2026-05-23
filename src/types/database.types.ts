export type StructureType = 'slab' | 'wall' | 'column' | 'plaster';
export type ConversationStatus = 'active' | 'completed' | 'abandoned';
export type MessageRole = 'user' | 'assistant' | 'system';
export type CalculationStatus = 'pending' | 'calculated' | 'error';
export type ProductCategory = 'structural' | 'plaster' | 'specialty';
export type UserType = 'contractor' | 'architect' | 'other';

export interface Dimensions {
  length_m?: number;
  width_m?: number;
  height_m?: number;
  thickness_m?: number;
  diameter_m?: number;
  area_m2?: number;
}

export interface Materials {
  cement_bags_50kg: number;
  sand_m3: number;
  gravel_m3?: number;
  water_liters: number;
}

export interface TechnicalSpecs {
  resistance_psi?: number;
  setting_time_hours?: number;
  coverage_m2_per_bag?: number;
  cement_content_kg_per_m3?: number;
  water_cement_ratio?: number;
}

export interface ProductJustification {
  technical_reason: string;
  economic_reason: string;
  environmental_reason?: string;
}

// Database Tables
export interface User {
  id: string;
  phone: string | null;
  name: string | null;
  user_type: UserType | null;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string | null;
  status: ConversationStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  extracted_data: Record<string, unknown>;
  created_at: string;
}

export interface Calculation {
  id: string;
  conversation_id: string;
  structure_type: StructureType;
  dimensions: Dimensions;
  volume_m3: number | null;
  materials: Materials | null;
  status: CalculationStatus;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  subcategory: string | null;
  technical_specs: TechnicalSpecs;
  price_per_bag_cop: number;
  co2_per_kg: number;
  datasheet_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductRecommendation {
  id: string;
  calculation_id: string;
  product_id: string;
  quantity_bags: number;
  estimated_cost_cop: number;
  savings_cop: number;
  co2_saved_kg: number;
  justification: ProductJustification | null;
  created_at: string;
}

export interface CalculationInput {
  structureType: StructureType;
  dimensions: Dimensions;
  resistancePsi?: number;
}

export interface RecommendationOutput {
  product: Product;
  quantity_bags: number;
  estimated_cost_cop: number;
  savings_cop: number;
  co2_saved_kg: number;
  justification: ProductJustification;
}
