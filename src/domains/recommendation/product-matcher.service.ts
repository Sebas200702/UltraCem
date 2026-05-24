import type { StructureType, Product, Materials, ProductJustification } from '@/types/database.types';

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

const CATEGORY_MAP: Record<StructureType, string> = {
  slab: 'structural',
  column: 'structural',
  wall: 'specialty',
  plaster: 'plaster',
};

const SUBCATEGORY_MAP: Record<StructureType, string> = {
  slab: 'structural',
  column: 'structural',
  wall: 'masonry',
  plaster: 'plaster',
};

export function scoreProduct(product: Product, input: RecommendationInput): number {
  let score = 0;

  if (product.category === CATEGORY_MAP[input.structureType]) {
    score += 40;
  }

  const resistance = product.technical_specs.resistance_psi;
  if (resistance !== undefined && input.resistancePsi > 0) {
    const diff = Math.abs(resistance - input.resistancePsi) / input.resistancePsi;
    if (diff <= 0.2) {
      score += 30;
    }
  }

  if (product.subcategory === SUBCATEGORY_MAP[input.structureType]) {
    score += 15;
  }

  score += product.is_active ? 15 : -50;

  return score;
}

export function findBestProduct(products: Product[], input: RecommendationInput): Product | null {
  if (products.length === 0) return null;

  let bestProduct: Product | null = null;
  let bestScore = -Infinity;

  for (const product of products) {
    const score = scoreProduct(product, input);
    if (score > bestScore) {
      bestScore = score;
      bestProduct = product;
    }
  }

  return bestProduct;
}

export function calculateCostAnalysis(
  product: Product,
  materials: Materials,
  _structureType: StructureType
): CostAnalysis {
  const quantityBags = materials.cement_bags_50kg;
  const estimatedCostCop = Math.round(quantityBags * product.price_per_bag_cop * 100) / 100;
  const savingsCop = Math.round(estimatedCostCop * 0.20 * 100) / 100;
  const totalCementKg = quantityBags * 50;
  const co2SavedKg = Math.round(Math.max(0, (0.950 - product.co2_per_kg) * totalCementKg) * 100) / 100;

  return {
    estimated_cost_cop: estimatedCostCop,
    savings_cop: savingsCop,
    co2_saved_kg: co2SavedKg,
  };
}

export function generateJustification(
  product: Product,
  input: RecommendationInput,
  costAnalysis: CostAnalysis
): ProductJustification {
  const technicalReason = getTechnicalReason(input.structureType, product);
  const economicReason = `Precio por bulto: $${product.price_per_bag_cop.toLocaleString('es-CO')} COP. Ahorro estimado: $${costAnalysis.savings_cop.toLocaleString('es-CO')} COP.`;
  const environmentalReason = costAnalysis.co2_saved_kg > 0
    ? `Ahorro de ${costAnalysis.co2_saved_kg.toFixed(1)} kg de CO\u2082, equivalente a plantar ${Math.round(costAnalysis.co2_saved_kg / 20)} \u00E1rboles.`
    : undefined;

  return {
    technical_reason: technicalReason,
    economic_reason: economicReason,
    environmental_reason: environmentalReason,
  };
}

function getTechnicalReason(structureType: StructureType, product: Product): string {
  switch (structureType) {
    case 'slab':
    case 'column':
      return `${product.name} ofrece la resistencia estructural requerida (${product.technical_specs.resistance_psi ?? 'N/A'} PSI) para elementos de concreto reforzado.`;
    case 'wall':
      return `${product.name} proporciona la adherencia necesaria para la colocaci\u00F3n de mamposter\u00EDa.`;
    case 'plaster':
      return `${product.name} garantiza una cobertura uniforme y acabado liso para revoques y pa\u00F1etes.`;
  }
}

export function recommend(
  input: RecommendationInput,
  products: Product[]
): RecommendationResult | null {
  const product = findBestProduct(products, input);
  if (!product) return null;

  const costAnalysis = calculateCostAnalysis(product, input.materials, input.structureType);
  const justification = generateJustification(product, input, costAnalysis);

  return {
    product,
    quantity_bags: input.materials.cement_bags_50kg,
    estimated_cost_cop: costAnalysis.estimated_cost_cop,
    savings_cop: costAnalysis.savings_cop,
    co2_saved_kg: costAnalysis.co2_saved_kg,
    justification,
  };
}
