import type { StructureType, Product, Materials, ProductJustification } from '@/types/database.types';
import type {
  ComparisonData,
  CostAnalysis,
  RecommendationInput,
  RecommendationResult,
} from '@/domains/recommendation/recommendation.types';

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

  const effectivePsi = input.resistancePsi > 0 ? input.resistancePsi : 3000;

  if (product.category === CATEGORY_MAP[input.structureType]) {
    score += 40;
  }

  const resistance = product.technical_specs.resistance_psi;
  if (resistance !== undefined && effectivePsi > 0) {
    const diff = Math.abs(resistance - effectivePsi) / effectivePsi;
    if (diff <= 0.2) {
      score += 30;
    } else if (diff <= 0.4) {
      score += 10;
    }
  }

  if (product.subcategory === SUBCATEGORY_MAP[input.structureType]) {
    score += 15;
  }

  // product *type* fit: structural concrete needs cement (cement_content_kg_per_m3),
  // mortar/plaster needs a pre-mixed product (coverage_m2_per_bag). Without this,
  // the recommender happily suggests "Mezcla Lista Tipo M" for a slab, which is wrong.
  const hasCementContent = product.technical_specs.cement_content_kg_per_m3 !== undefined;
  const hasCoverage = product.technical_specs.coverage_m2_per_bag !== undefined;
  const isConcreteJob = input.structureType === 'slab' || input.structureType === 'column';

  if (isConcreteJob && hasCementContent) score += 25;
  if (isConcreteJob && hasCoverage && !hasCementContent) score -= 30;
  if (!isConcreteJob && hasCoverage) score += 20;

  score += product.is_active ? 15 : -50;

  if (product.co2_per_kg < 0.75) score += 20;
  else if (product.co2_per_kg < 0.85) score += 10;
  if (product.co2_per_kg > 0.900) score -= 10;

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

/**
 * Análisis de costos y ahorro ambiental.
 *
 * FUENTES:
 * - Ahorro económico: diferencia vs el producto comparable más caro activo del mismo tipo.
 *   Si no hay comparables, se usa un margen del 10% sobre el precio unitario
 *   (estimación conservadora de sobrecompra típica en obra).
 * - CO₂: baseline de cemento Portland genérico = 0.950 kg CO₂/kg cemento.
 *   Fuente: referencia sectorial NTC-6112 y promedios industriales del sector cementero.
 *   Se usa el peso real del bulto (presentation_kg) para no inflar números con bultos de 25-40 kg.
 */
export function calculateCostAnalysis(
  product: Product,
  materials: Materials,
  _structureType: StructureType,
  comparablePrices: number[] = [],
): CostAnalysis {
  const quantityBags = materials.cement_bags_50kg;
  const unitPrice = Number(product.price_per_bag_cop) || 0;
  const estimatedCostCop = Math.round(quantityBags * unitPrice);

  // real savings: against the most expensive comparable product in the same category.
  // if no comparables are provided, fall back to a conservative 10% (vs. typical
  // over-ordering by ±10%).
  const validComparables = comparablePrices.filter((price) => Number.isFinite(price) && price > unitPrice);
  const referencePrice = validComparables.length > 0 ? Math.max(...validComparables) : unitPrice * 1.10;
  const savingsCop = Math.max(0, Math.round((referencePrice - unitPrice) * quantityBags));

  // co2 savings: use the actual bag weight from technical_specs when available
  // (40 kg or 25 kg products were being treated as 50 kg, inflating numbers).
  const specs = (product.technical_specs ?? {}) as Record<string, unknown>;
  const bagWeightKg = Number(specs.presentation_kg) || 50;
  const totalCementKg = quantityBags * bagWeightKg;
  // Baseline: cemento Portland genérico según referencia sectorial NTC-6112
  const co2Reference = 0.950;
  const co2SavedKg = Math.round(Math.max(0, (co2Reference - Number(product.co2_per_kg)) * totalCementKg) * 10) / 10;

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

export function buildComparisonData(
  product: Product,
  materials: Materials,
  wasteFactor: number,
  comparablePrices: number[],
): ComparisonData {
  const sacos = materials.cement_bags_50kg;
  const specs = (product.technical_specs ?? {}) as Record<string, unknown>;
  const bagWeightKg = Number(specs.presentation_kg) || 50;
  const ultracemPrecioSaco = Math.round(Number(product.price_per_bag_cop) || 0);

  const validComparables = comparablePrices.filter(
    (price) => Number.isFinite(price) && price > ultracemPrecioSaco,
  );
  const genericoPrecioSaco =
    validComparables.length > 0
      ? Math.round(Math.max(...validComparables))
      : Math.round(ultracemPrecioSaco * 1.15);

  const ultracemCostoBase = Math.round(sacos * ultracemPrecioSaco);
  const genericoCostoBase = Math.round(sacos * genericoPrecioSaco);
  const ultracemWasteFactor = wasteFactor;
  const genericoWasteFactor = wasteFactor * 1.3;
  const ultracemCostoFinal = Math.round(ultracemCostoBase * ultracemWasteFactor);
  const genericoCostoFinal = Math.round(genericoCostoBase * genericoWasteFactor);
  const ultracemCo2Total =
    Math.round(sacos * bagWeightKg * Number(product.co2_per_kg) * 10) / 10;
  const genericoCo2Total = Math.round(sacos * bagWeightKg * 0.95 * 10) / 10;

  const ahorroPesos = Math.round(genericoCostoFinal - ultracemCostoFinal);
  const ahorroCO2Kg =
    Math.round((genericoCo2Total - ultracemCo2Total) * 10) / 10;
  const ahorroPorc =
    genericoCostoFinal > 0
      ? Math.round((ahorroPesos / genericoCostoFinal) * 1000) / 10
      : 0;

  return {
    ultracem: {
      productName: product.name,
      sacos,
      precioSaco: ultracemPrecioSaco,
      costoBase: ultracemCostoBase,
      wasteFactor: ultracemWasteFactor,
      costoFinal: ultracemCostoFinal,
      co2Total: ultracemCo2Total,
    },
    generico: {
      precioSaco: genericoPrecioSaco,
      costoBase: genericoCostoBase,
      wasteFactor: genericoWasteFactor,
      costoFinal: genericoCostoFinal,
      co2Total: genericoCo2Total,
    },
    ahorroPesos,
    ahorroCO2Kg,
    ahorroPorc,
    wasteFactorBase: wasteFactor,
  };
}

export function recommend(
  input: RecommendationInput,
  products: Product[],
  wasteFactor: number,
): RecommendationResult | null {
  const product = findBestProduct(products, input);
  if (!product) return null;

  // comparable = other active products in the same category, used as a price
  // reference to compute a real (non-fake) savings number.
  const comparablePrices = products
    .filter((p) => p.is_active && p.category === product.category && p.id !== product.id)
    .map((p) => Number(p.price_per_bag_cop) || 0);

  const costAnalysis = calculateCostAnalysis(product, input.materials, input.structureType, comparablePrices);
  const justification = generateJustification(product, input, costAnalysis);
  const comparison = buildComparisonData(
    product,
    input.materials,
    wasteFactor,
    comparablePrices,
  );

  return {
    product,
    quantity_bags: input.materials.cement_bags_50kg,
    estimated_cost_cop: costAnalysis.estimated_cost_cop,
    savings_cop: costAnalysis.savings_cop,
    co2_saved_kg: costAnalysis.co2_saved_kg,
    justification,
    comparison,
  };
}
