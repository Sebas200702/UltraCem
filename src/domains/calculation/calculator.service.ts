import type { CalculationInput, CalculationResult, Dimensions, Materials, StructureType } from '@/types/database.types';

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class MaterialCalculator {
  private readonly DOSAGE_TABLE: Record<string, number> = {
    slab_3000psi: 350,
    slab_4000psi: 420,
    wall_3000psi: 300,
    column_3000psi: 380,
    column_4000psi: 450,
    plaster: 280,
  };

  private readonly MATERIAL_RATIOS = {
    cement_sand_gravel: { cement: 1, sand: 2, gravel: 3 },
    cement_sand: { cement: 1, sand: 3 },
  } as const;

  private readonly WASTE_FACTORS: Record<StructureType, number> = {
    slab: 1.05,
    wall: 1.10,
    column: 1.08,
    plaster: 1.15,
  };

  calculate(input: CalculationInput): CalculationResult {
    this.validateInput(input);

    const volume = this.calculateVolume(input.structureType, input.dimensions);
    const wasteFactor = this.WASTE_FACTORS[input.structureType];
    const adjustedVolume = volume * wasteFactor;
    const materials = this.calculateMaterials(input.structureType, adjustedVolume, input.resistancePsi);
    const formulaUsed = this.getFormulaName(input.structureType, input.resistancePsi);

    return {
      volume_m3: adjustedVolume,
      materials,
      metadata: {
        formula_used: formulaUsed,
        waste_factor: wasteFactor,
      },
    };
  }

  private calculateVolume(type: StructureType, dims: Dimensions): number {
    switch (type) {
      case 'slab': {
        if (dims.length_m === undefined || dims.width_m === undefined || dims.thickness_m === undefined) {
          throw new ValidationError('Slab requires length_m, width_m, and thickness_m');
        }
        return dims.length_m * dims.width_m * dims.thickness_m;
      }
      case 'wall': {
        if (dims.length_m === undefined || dims.height_m === undefined || dims.thickness_m === undefined) {
          throw new ValidationError('Wall requires length_m, height_m, and thickness_m');
        }
        return dims.length_m * dims.height_m * dims.thickness_m;
      }
      case 'column': {
        if (dims.diameter_m !== undefined) {
          if (dims.height_m === undefined) {
            throw new ValidationError('Column with diameter requires height_m');
          }
          const radius = dims.diameter_m / 2;
          return Math.PI * radius * radius * dims.height_m;
        }
        if (dims.length_m !== undefined && dims.width_m !== undefined) {
          if (dims.height_m === undefined) {
            throw new ValidationError('Column requires height_m');
          }
          return dims.length_m * dims.width_m * dims.height_m;
        }
        throw new ValidationError('Column requires either diameter_m or length_m and width_m');
      }
      case 'plaster': {
        if (dims.area_m2 === undefined || dims.thickness_m === undefined) {
          throw new ValidationError('Plaster requires area_m2 and thickness_m');
        }
        return dims.area_m2 * dims.thickness_m;
      }
    }
  }

  private calculateMaterials(type: StructureType, volume_m3: number, resistancePsi?: number): Materials {
    const dosageKey = this.getDosageKey(type, resistancePsi);
    const cementKgPerM3 = this.DOSAGE_TABLE[dosageKey];
    const totalCementKg = cementKgPerM3 * volume_m3;
    const cementBags50kg = Math.ceil(totalCementKg / 50);
    const isConcrete = type === 'slab' || type === 'column';

    if (isConcrete) {
      const sand_m3 = Math.round(((cementKgPerM3 / 1500) * 2 * volume_m3) * 100) / 100;
      const gravel_m3 = Math.round(((cementKgPerM3 / 1500) * 3 * volume_m3) * 100) / 100;
      const water_liters = Math.round(cementKgPerM3 * 0.55 * volume_m3);

      return { cement_bags_50kg: cementBags50kg, sand_m3, gravel_m3, water_liters };
    }

    const sand_m3 = Math.round(((cementKgPerM3 / 1500) * 3 * volume_m3) * 100) / 100;
    const water_liters = Math.round(cementKgPerM3 * 0.5 * volume_m3);

    return { cement_bags_50kg: cementBags50kg, sand_m3, water_liters };
  }

  private getDosageKey(type: StructureType, resistancePsi?: number): string {
    if (type === 'plaster') return 'plaster';
    if (type === 'wall') return 'wall_3000psi';

    const effectivePsi = resistancePsi ?? 3000;
    const resistance = effectivePsi >= 4000 ? '4000psi' : '3000psi';
    return `${type}_${resistance}`;
  }

  private validateInput(input: CalculationInput): void {
    const validTypes: StructureType[] = ['slab', 'wall', 'column', 'plaster'];
    if (!validTypes.includes(input.structureType)) {
      throw new ValidationError(`Invalid structure type: ${input.structureType}`);
    }

    const dims = input.dimensions;
    const dimValues = Object.values(dims).filter((v): v is number => v !== undefined);

    for (const val of dimValues) {
      if (val <= 0) {
        throw new ValidationError('All dimensions must be positive numbers');
      }
    }

    if (dims.length_m !== undefined && (dims.length_m < 0.1 || dims.length_m > 50)) {
      throw new ValidationError('Length must be between 0.1m and 50m');
    }

    if (dims.thickness_m !== undefined && (dims.thickness_m < 0.02 || dims.thickness_m > 1)) {
      throw new ValidationError('Thickness must be between 0.02m and 1m');
    }
  }

  private getFormulaName(type: StructureType, resistancePsi?: number): string {
    return `${type}_${resistancePsi || 3000}psi`;
  }
}

export { MaterialCalculator, ValidationError };
