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


