import { describe, it, expect } from 'vitest';
import { tryFastExtract } from '../fast-extract';
import type { CalculationInput } from '@/types/database.types';

describe('tryFastExtract', () => {
  const wallDimensions: Partial<CalculationInput> = {
    structureType: 'wall',
    dimensions: {
      length_m: 3,
      height_m: 2.5,
      thickness_m: 0.15,
    },
  };

  it('marks ready when region is given and dimensions were collected earlier', () => {
    const result = tryFastExtract('barranquilla', wallDimensions, 'caribe');

    expect(result).not.toBeNull();
    expect(result?.isReadyForCalculation).toBe(true);
    expect(result?.extractedData?.structureType).toBe('wall');
  });

  it('returns null for long messages that need Gemini', () => {
    const longMessage = 'a'.repeat(100);
    const result = tryFastExtract(longMessage, wallDimensions, 'caribe');

    expect(result).toBeNull();
  });

  it('returns null when dimensions are still missing', () => {
    const result = tryFastExtract('barranquilla', {}, 'caribe');

    expect(result).toBeNull();
  });
});
