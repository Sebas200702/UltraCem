import type { Dimensions, StructureType } from '@/types/database.types';

/**
 * NLP often leaves thickness in cm (4, 10, 15) or mm (150) instead of meters.
 */
export function normalizeThicknessM(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return value;

  if (value > 1 && value <= 100) {
    return value / 100;
  }
  if (value > 100 && value <= 1000) {
    return value / 1000;
  }
  return value;
}

const DIMENSION_KEYS_BY_TYPE: Record<StructureType, (keyof Dimensions)[]> = {
  slab: ['length_m', 'width_m', 'thickness_m'],
  wall: ['length_m', 'height_m', 'thickness_m'],
  column: ['length_m', 'width_m', 'height_m', 'diameter_m'],
  plaster: ['area_m2', 'thickness_m'],
};

export function normalizeDimensions(
  structureType: StructureType | undefined,
  dimensions: Partial<Dimensions> | undefined,
): Partial<Dimensions> {
  if (!dimensions) return {};

  const normalized: Partial<Dimensions> = { ...dimensions };

  if (normalized.thickness_m !== undefined) {
    normalized.thickness_m = normalizeThicknessM(normalized.thickness_m);
  }

  if (!structureType) return normalized;

  const allowed = DIMENSION_KEYS_BY_TYPE[structureType];
  const picked: Partial<Dimensions> = {};

  for (const key of allowed) {
    const value = normalized[key];
    if (value !== undefined) {
      picked[key] = value;
    }
  }

  return picked;
}
