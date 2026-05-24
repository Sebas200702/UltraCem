import { describe, expect, it } from 'vitest';
import { normalizeDimensions, normalizeThicknessM } from '../dimension-normalize';

describe('normalizeThicknessM', () => {
  it('converts cm values to meters', () => {
    expect(normalizeThicknessM(4)).toBe(0.04);
    expect(normalizeThicknessM(10)).toBe(0.1);
    expect(normalizeThicknessM(15)).toBe(0.15);
  });

  it('converts mm values to meters', () => {
    expect(normalizeThicknessM(150)).toBe(0.15);
    expect(normalizeThicknessM(200)).toBe(0.2);
  });

  it('leaves meter values unchanged', () => {
    expect(normalizeThicknessM(0.1)).toBe(0.1);
    expect(normalizeThicknessM(0.15)).toBe(0.15);
    expect(normalizeThicknessM(1)).toBe(1);
  });
});

describe('normalizeDimensions', () => {
  it('normalizes thickness and strips irrelevant fields for slabs', () => {
    expect(
      normalizeDimensions('slab', {
        length_m: 4,
        width_m: 3,
        height_m: 7,
        thickness_m: 4,
      }),
    ).toEqual({
      length_m: 4,
      width_m: 3,
      thickness_m: 0.04,
    });
  });

  it('keeps wall dimensions', () => {
    expect(
      normalizeDimensions('wall', {
        length_m: 4,
        height_m: 7,
        width_m: 3,
        thickness_m: 15,
      }),
    ).toEqual({
      length_m: 4,
      height_m: 7,
      thickness_m: 0.15,
    });
  });
});
