import { describe, it, expect } from 'vitest';
import { recommend, scoreProduct, calculateCostAnalysis, generateJustification } from '../product-matcher.service';
import type { Product, RecommendationInput, StructureType, Materials } from '../../../types/database.types';

const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'UC-EST-GR-3000',
    name: 'UltraCem Estructural Gris 3000 PSI',
    category: 'structural',
    subcategory: null,
    technical_specs: { resistance_psi: 3000, setting_time_hours: 24, cement_content_kg_per_m3: 350 },
    price_per_bag_cop: 28500,
    co2_per_kg: 0.850,
    datasheet_url: null,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '2',
    sku: 'UC-EST-GR-4000',
    name: 'UltraCem Estructural Gris 4000 PSI',
    category: 'structural',
    subcategory: null,
    technical_specs: { resistance_psi: 4000, setting_time_hours: 18, cement_content_kg_per_m3: 420 },
    price_per_bag_cop: 32500,
    co2_per_kg: 0.820,
    datasheet_url: null,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '3',
    sku: 'UC-PLA-BL-001',
    name: 'UltraCem Plaster Blanco',
    category: 'plaster',
    subcategory: null,
    technical_specs: { resistance_psi: 1500, setting_time_hours: 4, coverage_m2_per_bag: 1.5 },
    price_per_bag_cop: 22000,
    co2_per_kg: 0.780,
    datasheet_url: null,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

const baseMaterials: Materials = {
  cement_bags_50kg: 22,
  sand_m3: 1.45,
  gravel_m3: 2.18,
  water_liters: 420,
};

describe('recommend()', () => {
  it('recommends best product for slab structure', () => {
    const result = recommend(
      { structureType: 'slab', materials: baseMaterials, resistancePsi: 3000 },
      mockProducts
    );

    expect(result).not.toBeNull();
    expect(result!.product.category).toBe('structural');
    expect(result!.product.name).toContain('Estructural');
  });

  it('prefers products matching the structure type category', () => {
    const result = recommend(
      { structureType: 'plaster', materials: baseMaterials, resistancePsi: 3000 },
      mockProducts
    );

    expect(result).not.toBeNull();
    expect(result!.product.category).toBe('plaster');
  });

  it('calculates cost analysis correctly', () => {
    const result = recommend(
      { structureType: 'slab', materials: baseMaterials, resistancePsi: 3000 },
      mockProducts
    );

    expect(result).not.toBeNull();
    expect(result!.estimated_cost_cop).toBe(22 * 28500);
    // savings vs. most expensive comparable in same category (UC-EST-GR-4000 at 32500)
    expect(result!.savings_cop).toBe((32500 - 28500) * 22);
    expect(result!.quantity_bags).toBe(22);
  });

  it('calculates co2 savings correctly', () => {
    const result = recommend(
      { structureType: 'slab', materials: baseMaterials, resistancePsi: 3000 },
      mockProducts
    );

    const expectedDiff = 0.950 - 0.850;
    const expectedCo2Saved = expectedDiff * 22 * 50;
    expect(result).not.toBeNull();
    expect(result!.co2_saved_kg).toBeCloseTo(expectedCo2Saved, 0);
  });

  it('generates technical justification for slab', () => {
    const result = recommend(
      { structureType: 'slab', materials: baseMaterials, resistancePsi: 3000 },
      mockProducts
    );

    expect(result).not.toBeNull();
    expect(result!.justification.technical_reason).toContain('3000 PSI');
    expect(result!.justification.technical_reason).toContain('concreto reforzado');
  });

  it('generates technical justification for plaster', () => {
    const result = recommend(
      { structureType: 'plaster', materials: baseMaterials, resistancePsi: 1500 },
      mockProducts
    );

    expect(result).not.toBeNull();
    expect(result!.justification.technical_reason).toContain('revoques');
    expect(result!.justification.technical_reason).toContain('acabado liso');
  });

  it('generates environmental justification when co2_saved > 0', () => {
    const result = recommend(
      { structureType: 'slab', materials: baseMaterials, resistancePsi: 3000 },
      mockProducts
    );

    expect(result).not.toBeNull();
    expect(result!.justification.environmental_reason).toBeDefined();
    expect(result!.justification.environmental_reason).toContain('CO\u2082');
    expect(result!.justification.environmental_reason).toContain('árboles');
  });

  it('returns null when no products found', () => {
    const result = recommend(
      { structureType: 'slab', materials: baseMaterials, resistancePsi: 3000 },
      []
    );

    expect(result).toBeNull();
  });
});

describe('scoreProduct()', () => {
  it('scores category match higher', () => {
    const slabInput: RecommendationInput = { structureType: 'slab', materials: baseMaterials, resistancePsi: 3000 };
    const structuralScore = scoreProduct(mockProducts[0], slabInput);
    const plasterScore = scoreProduct(mockProducts[2], slabInput);

    expect(structuralScore).toBeGreaterThan(plasterScore);
  });
});

describe('calculateCostAnalysis()', () => {
  it('calculates costs based on bag quantity and unit price', () => {
    const result = calculateCostAnalysis(mockProducts[0], baseMaterials, 'slab');

    expect(result.estimated_cost_cop).toBe(22 * 28500);
    // without comparable prices, fallback is unit price * 1.10 → savings = 10% of total
    expect(result.savings_cop).toBe((Math.round(28500 * 1.10) - 28500) * 22);
  });

  it('uses comparable prices when provided to compute real savings', () => {
    const comparables = [32500, 22000];
    const result = calculateCostAnalysis(mockProducts[0], baseMaterials, 'slab', comparables);

    // savings vs. the most expensive comparable that is above unit price
    expect(result.savings_cop).toBe((32500 - 28500) * 22);
  });
});

describe('generateJustification()', () => {
  it('generates technical reason for wall structure', () => {
    const input: RecommendationInput = { structureType: 'wall', materials: baseMaterials, resistancePsi: 3000 };
    const cost = calculateCostAnalysis(mockProducts[0], baseMaterials, 'wall');
    const justification = generateJustification(mockProducts[0], input, cost);

    expect(justification.technical_reason).toContain('mampostería');
  });
});