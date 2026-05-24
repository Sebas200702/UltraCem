import { describe, it, expect } from 'vitest';
import { MaterialCalculator, ValidationError } from '@/domains/calculation';

describe('MaterialCalculator', () => {
  const calculator = new MaterialCalculator();

  it('calculates slab volume correctly', () => {
    const result = calculator.calculate({
      structureType: 'slab',
      dimensions: { length_m: 5, width_m: 4, thickness_m: 0.1 },
    });

    expect(result.volume_m3).toBeCloseTo(2.1, 4);
    expect(result.metadata.formula_used).toBe('slab_3000psi');
    expect(result.metadata.waste_factor).toBe(1.05);
  });

  it('calculates wall volume correctly', () => {
    const result = calculator.calculate({
      structureType: 'wall',
      dimensions: { length_m: 3, height_m: 2.5, thickness_m: 0.15 },
    });

    expect(result.volume_m3).toBeCloseTo(1.2375, 4);
    expect(result.metadata.formula_used).toBe('wall_3000psi');
    expect(result.metadata.waste_factor).toBe(1.10);
  });

  it('calculates circular column volume correctly', () => {
    const result = calculator.calculate({
      structureType: 'column',
      dimensions: { diameter_m: 0.3, height_m: 3 },
    });

    const expectedVolume = Math.PI * 0.15 * 0.15 * 3 * 1.08;
    expect(result.volume_m3).toBeCloseTo(expectedVolume, 4);
    expect(result.metadata.formula_used).toBe('column_3000psi');
    expect(result.metadata.waste_factor).toBe(1.08);
  });

  it('calculates square column volume correctly', () => {
    const result = calculator.calculate({
      structureType: 'column',
      dimensions: { length_m: 0.3, width_m: 0.3, height_m: 3 },
    });

    expect(result.volume_m3).toBeCloseTo(0.2916, 4);
    expect(result.metadata.formula_used).toBe('column_3000psi');
    expect(result.metadata.waste_factor).toBe(1.08);
  });

  it('calculates plaster volume correctly', () => {
    const result = calculator.calculate({
      structureType: 'plaster',
      dimensions: { area_m2: 50, thickness_m: 0.02 },
    });

    expect(result.volume_m3).toBeCloseTo(1.15, 4);
    expect(result.metadata.formula_used).toBe('plaster_3000psi');
    expect(result.metadata.waste_factor).toBe(1.15);
  });

  it('throws ValidationError for invalid structure type', () => {
    expect(() =>
      calculator.calculate({
        structureType: 'roof' as any,
        dimensions: { length_m: 5, width_m: 4, thickness_m: 0.1 },
      })
    ).toThrow(ValidationError);
  });

  it('throws ValidationError for negative dimensions', () => {
    expect(() =>
      calculator.calculate({
        structureType: 'slab',
        dimensions: { length_m: -5, width_m: 4, thickness_m: 0.1 },
      })
    ).toThrow(ValidationError);
  });

  it('throws ValidationError for dimensions exceeding max', () => {
    expect(() =>
      calculator.calculate({
        structureType: 'slab',
        dimensions: { length_m: 100, width_m: 4, thickness_m: 0.1 },
      })
    ).toThrow(ValidationError);
  });

  it('calculates materials for slab with 3000psi', () => {
    const result = calculator.calculate({
      structureType: 'slab',
      dimensions: { length_m: 5, width_m: 4, thickness_m: 0.1 },
    });

    expect(result.materials.cement_bags_50kg).toBe(15);
    expect(result.materials.sand_m3).toBeCloseTo(0.98, 2);
    expect(result.materials.gravel_m3).toBeDefined();
    expect(result.materials.gravel_m3).toBeCloseTo(1.47, 2);
    expect(result.materials.water_liters).toBe(404);
  });

  it('calculates materials for plaster (no gravel)', () => {
    const result = calculator.calculate({
      structureType: 'plaster',
      dimensions: { area_m2: 50, thickness_m: 0.02 },
    });

    expect(result.materials.cement_bags_50kg).toBeGreaterThan(0);
    expect(result.materials.sand_m3).toBeGreaterThan(0);
    expect(result.materials.gravel_m3).toBeUndefined();
    expect(result.materials.water_liters).toBeGreaterThan(0);
  });

  it('uses 4000psi dosage when specified', () => {
    const dims = { length_m: 0.5, width_m: 0.5, height_m: 3 };

    const column3000 = calculator.calculate({
      structureType: 'column',
      dimensions: dims,
    });

    const column4000 = calculator.calculate({
      structureType: 'column',
      dimensions: dims,
      resistancePsi: 4000,
    });

    expect(column4000.materials.cement_bags_50kg).toBeGreaterThan(column3000.materials.cement_bags_50kg);
    expect(column4000.metadata.formula_used).toBe('column_4000psi');
  });
});
