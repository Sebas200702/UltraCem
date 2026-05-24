import type { CalculationInput, CalculationResult, Dimensions, Materials, StructureType } from '@/types/database.types';
import type { ColombianRegion } from '../region/region.service';
import { getRegionInfo } from '../region/region.service';

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * MaterialCalculator — Cálculo de materiales de construcción basado en normas Colombianas.
 *
 * FUENTES DE LAS CONSTANTES:
 * - DOSAGE_TABLE: NSR-10 C.8.1 — Dosificación de mezclas de concreto.
 *   • 3000 PSI → 350 kg cemento/m³
 *   • 4000 PSI → 420 kg cemento/m³
 *   • Muros (mortero) → 300 kg cemento/m³ (NSR-10 D.3.1 / NTC-4027)
 *   • Revoques → 280 kg cemento/m³ (práctica de obra y NSR-10 E.2.1)
 * - WASTE_FACTORS: Estándares de obra colombianos para pérdidas en vaciado y manejo.
 *   • Losas (slab): 5% (menor manipulación, mayor control).
 *   • Muros (wall): 10% (más cortes, desperdicio en juntas).
 *   • Columnas (column): 8% (encofrado, altura de vaciado).
 *   • Revoques (plaster): 15% (acabados, retiros, altura).
 * - Densidad del cemento: 1500 kg/m³ (valor estándar de ingeniería civil).
 * - Relación agua/cemento: 0.55 para concreto, 0.50 para mortero (NSR-10 C.4.5).
 */
class MaterialCalculator {
  /**
   * Tabla de dosificación según NSR-10 C.8.1.
   * Unidades: kg de cemento por m³ de concreto.
   */
  private readonly DOSAGE_TABLE: Record<string, number> = {
    slab_3000psi: 350, // NSR-10 C.8.1 — 3000 PSI = 350 kg/m³
    slab_4000psi: 420, // NSR-10 C.8.1 — 4000 PSI = 420 kg/m³
    wall_3000psi: 300, // NSR-10 D.3.1 / NTC-4027 — Mortero Tipo M para mampostería
    column_3000psi: 380, // NSR-10 C.8.1 — Columnas 3000 PSI
    column_4000psi: 450, // NSR-10 C.8.1 — Columnas 4000 PSI (zona sísmica)
    plaster: 280, // Práctica de obra para revoques (NSR-10 E.2.1)
  };

  /**
   * Factores de desperdicio según tipo de estructura.
   * Fuente: Estándares de obra colombianos (Camacol / práctica maestros de obra).
   */
  private readonly WASTE_FACTORS: Record<StructureType, number> = {
    slab: 1.05,   // 5% — Controlado, menos manipulación
    wall: 1.10,   // 10% — Cortes de bloque, juntas
    column: 1.08, // 8% — Encofrado, altura de vaciado
    plaster: 1.15, // 15% — Acabados, retiros, desperdicio en altura
  };

  calculate(input: CalculationInput, region?: ColombianRegion | null): CalculationResult {
    this.validateInput(input, region);

    const volume = this.calculateVolume(input.structureType, input.dimensions);
    let wasteFactor = this.WASTE_FACTORS[input.structureType];

    if (region) {
      const info = getRegionInfo(region);
      wasteFactor += info.wasteFactorOffset;
    }

    const adjustedVolume = volume * wasteFactor;
    const materials = this.calculateMaterials(input.structureType, adjustedVolume, input.resistancePsi, region);
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

  /**
   * Calcula materiales a partir del volumen ajustado.
   *
   * Fórmulas:
   * - Arena y grava se derivan de la proporción 1:2:3 (concreto) o 1:3 (mortero)
   *   usando la densidad del cemento = 1500 kg/m³ (estándar ingeniería civil).
   * - Agua = cemento (kg/m³) × relación agua/cemento × volumen (m³).
   *   Relación base: 0.55 para concreto, 0.50 para mortero (NSR-10 C.4.5).
   */
  private calculateMaterials(type: StructureType, volume_m3: number, resistancePsi?: number, region?: ColombianRegion | null): Materials {
    const dosageKey = this.getDosageKey(type, resistancePsi);
    let cementKgPerM3 = this.DOSAGE_TABLE[dosageKey];

    if (cementKgPerM3 === undefined) {
      throw new ValidationError(`No se encontró dosificación para la clave: ${dosageKey}`);
    }

    if (region) {
      const info = getRegionInfo(region);
      cementKgPerM3 = Math.round(cementKgPerM3 * info.dosageAdjustments.cementMultiplier);
    }

    const totalCementKg = cementKgPerM3 * volume_m3;
    const cementBags50kg = Math.ceil(totalCementKg / 50);
    const isConcrete = type === 'slab' || type === 'column';

    let waterRatio = isConcrete ? 0.55 : 0.5;
    if (region) {
      const info = getRegionInfo(region);
      waterRatio += info.dosageAdjustments.waterRatioOffset;
    }

    if (isConcrete) {
      const sand_m3 = Math.round(((cementKgPerM3 / 1500) * 2 * volume_m3) * 100) / 100;
      const gravel_m3 = Math.round(((cementKgPerM3 / 1500) * 3 * volume_m3) * 100) / 100;
      const water_liters = Math.round(cementKgPerM3 * waterRatio * volume_m3);

      return { cement_bags_50kg: cementBags50kg, sand_m3, gravel_m3, water_liters };
    }

    const sand_m3 = Math.round(((cementKgPerM3 / 1500) * 3 * volume_m3) * 100) / 100;
    const water_liters = Math.round(cementKgPerM3 * waterRatio * volume_m3);

    return { cement_bags_50kg: cementBags50kg, sand_m3, water_liters };
  }

  private getDosageKey(type: StructureType, resistancePsi?: number): string {
    if (type === 'plaster') return 'plaster';
    if (type === 'wall') return 'wall_3000psi';

    const effectivePsi = resistancePsi ?? 3000;
    const resistance = effectivePsi >= 4000 ? '4000psi' : '3000psi';
    return `${type}_${resistance}`;
  }

  private validateInput(input: CalculationInput, region?: ColombianRegion | null): void {
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

    if (region && (region === 'caribe' || region === 'pacifica')) {
      const psi = input.resistancePsi ?? 3000;
      if (psi < 3000 && (input.structureType === 'slab' || input.structureType === 'column')) {
        throw new ValidationError(
          `NSR-10 H.4.2: En zona costera (${region}), la resistencia mínima es 3000 PSI para elementos estructurales.`
        );
      }
    }
  }

  private getFormulaName(type: StructureType, resistancePsi?: number): string {
    return `${type}_${resistancePsi || 3000}psi`;
  }
}

export { MaterialCalculator, ValidationError };
