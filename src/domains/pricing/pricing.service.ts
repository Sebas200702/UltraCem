import type { Product } from '@/types/database.types';
import type { PriceChange, ProductInput } from '@/domains/pricing/pricing.types';

const VALID_CATEGORIES = ['structural', 'plaster', 'specialty'] as const;

export function validateProductInput(input: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
  data?: ProductInput;
} {
  const errors: string[] = [];

  const sku = input.sku;
  if (typeof sku !== 'string' || sku.length < 2 || sku.length > 50) {
    errors.push('SKU es requerido y debe tener entre 2 y 50 caracteres');
  }

  const name = input.name;
  if (typeof name !== 'string' || name.length < 3 || name.length > 255) {
    errors.push('El nombre es requerido y debe tener entre 3 y 255 caracteres');
  }

  const category = input.category;
  if (typeof category !== 'string' || !VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
    errors.push('La categoría debe ser: structural, plaster o specialty');
  }

  const price = input.price_per_bag_cop;
  if (typeof price !== 'number' || price <= 0 || price >= 500000) {
    errors.push('El precio por bulto debe ser un número mayor a 0 y menor a 500,000');
  }

  const co2 = input.co2_per_kg;
  if (co2 !== undefined && (typeof co2 !== 'number' || co2 < 0 || co2 > 2)) {
    errors.push('CO₂ por kg debe ser un número entre 0 y 2');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      sku: sku as string,
      name: name as string,
      category: category as 'structural' | 'plaster' | 'specialty',
      subcategory: input.subcategory as string | undefined,
      technical_specs: (input.technical_specs as Record<string, unknown>) ?? {},
      price_per_bag_cop: price as number,
      co2_per_kg: (co2 as number) ?? 0.900,
      datasheet_url: input.datasheet_url as string | undefined,
      is_active: (input.is_active as boolean) ?? true,
    },
  };
}

export function checkPriceStaleness(
  product: Product
): { stale: boolean; daysOld: number; disclaimer: string } {
  const updatedAt = new Date(product.updated_at);
  const now = new Date();
  const diffMs = now.getTime() - updatedAt.getTime();
  const daysOld = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const stale = daysOld > 30;
  const disclaimer = stale
    ? `El precio de ${product.name} tiene más de 30 días (${daysOld} días). Verifique el precio actual antes de cotizar.`
    : '';

  return { stale, daysOld, disclaimer };
}

export function preparePriceChange(
  product: Product,
  newPrice: number,
  changedBy: string | null
): PriceChange {
  return {
    productId: product.id,
    oldPrice: product.price_per_bag_cop,
    newPrice,
    changedBy,
  };
}

export function getDefaultProducts(): ProductInput[] {
  return [
    {
      sku: 'UC-GU-GRIS',
      name: 'Cemento Gris Uso General (Tipo GU)',
      category: 'structural',
      subcategory: 'general',
      technical_specs: { resistance_psi: 3000, setting_time_hours: 3 },
      price_per_bag_cop: 28500,
      co2_per_kg: 0.830,
    },
    {
      sku: 'UC-GU-BLANCO',
      name: 'Cemento Blanco Uso General',
      category: 'structural',
      subcategory: 'general',
      technical_specs: { resistance_psi: 3000, setting_time_hours: 3 },
      price_per_bag_cop: 38000,
      co2_per_kg: 0.780,
    },
    {
      sku: 'UC-HE-GRIS',
      name: 'Cemento Gris Uso Estructural (Tipo HE)',
      category: 'structural',
      subcategory: 'structural',
      technical_specs: { resistance_psi: 4000, setting_time_hours: 2.5 },
      price_per_bag_cop: 32000,
      co2_per_kg: 0.850,
    },
    {
      sku: 'UC-HE-BLANCO',
      name: 'Cemento Blanco Uso Estructural',
      category: 'structural',
      subcategory: 'structural',
      technical_specs: { resistance_psi: 4000, setting_time_hours: 2.5 },
      price_per_bag_cop: 42000,
      co2_per_kg: 0.800,
    },
    {
      sku: 'UC-PEG-GRIS',
      name: 'Pegante Cerámico Gris',
      category: 'specialty',
      subcategory: 'adhesives',
      technical_specs: { coverage_m2_per_bag: 12, setting_time_hours: 24 },
      price_per_bag_cop: 18500,
      co2_per_kg: 0.720,
    },
    {
      sku: 'UC-PEG-POR-GRIS',
      name: 'Pegante Porcelanato Gris',
      category: 'specialty',
      subcategory: 'adhesives',
      technical_specs: { coverage_m2_per_bag: 10, setting_time_hours: 24 },
      price_per_bag_cop: 22500,
      co2_per_kg: 0.740,
    },
    {
      sku: 'UC-PEG-POR-BLANCO',
      name: 'Pegante Porcelanato Blanco',
      category: 'specialty',
      subcategory: 'adhesives',
      technical_specs: { coverage_m2_per_bag: 10, setting_time_hours: 24 },
      price_per_bag_cop: 25000,
      co2_per_kg: 0.710,
    },
    {
      sku: 'UC-MEZCLA-N',
      name: 'Mezcla Lista No Estructural Tipo N',
      category: 'specialty',
      subcategory: 'mortars',
      technical_specs: { resistance_psi: 750, coverage_m2_per_bag: 8 },
      price_per_bag_cop: 15000,
      co2_per_kg: 0.680,
    },
    {
      sku: 'UC-MEZCLA-S',
      name: 'Mezcla Lista Uso General Tipo S',
      category: 'specialty',
      subcategory: 'mortars',
      technical_specs: { resistance_psi: 1500, coverage_m2_per_bag: 7 },
      price_per_bag_cop: 17000,
      co2_per_kg: 0.700,
    },
    {
      sku: 'UC-MEZCLA-M',
      name: 'Mezcla Lista Estructural Tipo M',
      category: 'specialty',
      subcategory: 'mortars',
      technical_specs: { resistance_psi: 2500, coverage_m2_per_bag: 6 },
      price_per_bag_cop: 19500,
      co2_per_kg: 0.720,
    },
    {
      sku: 'UC-MEZCLA-ZP',
      name: 'Mezcla Lista Zafarreo y Pañete',
      category: 'plaster',
      subcategory: 'plaster',
      technical_specs: { coverage_m2_per_bag: 10, setting_time_hours: 3 },
      price_per_bag_cop: 16000,
      co2_per_kg: 0.650,
    },
    {
      sku: 'UC-MASILLA-DW',
      name: 'Masilla para Drywall',
      category: 'specialty',
      subcategory: 'finishing',
      technical_specs: { coverage_m2_per_bag: 15, setting_time_hours: 2 },
      price_per_bag_cop: 21000,
      co2_per_kg: 0.600,
    },
    {
      sku: 'UC-CAL-HIDRA',
      name: 'Cal Hidratada',
      category: 'plaster',
      subcategory: 'plaster',
      technical_specs: { coverage_m2_per_bag: 20 },
      price_per_bag_cop: 15500,
      co2_per_kg: 0.550,
    },
  ];
}
