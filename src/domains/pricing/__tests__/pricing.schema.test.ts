import { describe, expect, it } from 'vitest';
import { productCreateSchema, productUpdateSchema } from '../pricing.schema';

describe('productCreateSchema', () => {
  it('normalizes form payloads with JSON technical specs', () => {
    const result = productCreateSchema.parse({
      sku: ' UC-EST-GR-3000 ',
      name: ' UltraCem Estructural Gris 3000 PSI ',
      category: 'structural',
      subcategory: '',
      technical_specs: '{"resistance_psi":3000}',
      price_per_bag_cop: '28500',
      co2_per_kg: '0.88',
      datasheet_url: '',
      is_active: true,
    });

    expect(result.sku).toBe('UC-EST-GR-3000');
    expect(result.name).toBe('UltraCem Estructural Gris 3000 PSI');
    expect(result.subcategory).toBeUndefined();
    expect(result.technical_specs).toEqual({ resistance_psi: 3000 });
    expect(result.price_per_bag_cop).toBe(28500);
    expect(result.datasheet_url).toBeUndefined();
  });

  it('rejects invalid technical specs JSON', () => {
    const result = productCreateSchema.safeParse({
      sku: 'UC-EST',
      name: 'UltraCem Estructural',
      category: 'structural',
      technical_specs: '{bad json}',
      price_per_bag_cop: 28500,
      co2_per_kg: 0.88,
      is_active: true,
    });

    expect(result.success).toBe(false);
  });
});

describe('productUpdateSchema', () => {
  it('does not apply create defaults to partial updates', () => {
    const result = productUpdateSchema.parse({ price_per_bag_cop: 32000 });

    expect(result).toEqual({ price_per_bag_cop: 32000 });
  });
});
