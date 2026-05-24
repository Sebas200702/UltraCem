import type { StructureType, Dimensions, Materials } from '@/types/database.types';

export interface CalculationMetadata {
  formula_used: string;
  waste_factor: number;
  ratio: string;
}

export interface CalculationResult {
  volume_m3: number;
  materials: Materials;
  metadata: CalculationMetadata;
}

const MIX_RATIOS: Record<StructureType, { cement: number; sand: number; gravel: number; label: string }> = {
  slab: { cement: 1, sand: 2, gravel: 3, label: '1:2:3 (3000 PSI)' },
  column: { cement: 1, sand: 1.5, gravel: 2, label: '1:1.5:2 (4000 PSI)' },
  wall: { cement: 1, sand: 3, gravel: 0, label: '1:3 mortar' },
  plaster: { cement: 1, sand: 4, gravel: 0, label: '1:4 mortar' },
};

const CEMENT_BAG_WEIGHT_KG = 50;
const CEMENT_BAG_VOLUME_M3 = 0.035;
const WASTE_FACTOR = 1.10;

const WATER_CEMENT_RATIO: Record<StructureType, number> = {
  slab: 0.50,
  column: 0.45,
  wall: 0.60,
  plaster: 0.65,
};

const SAND_PER_BAG_M3: Record<StructureType, number> = {
  slab: 0.070,
  column: 0.052,
  wall: 0.105,
  plaster: 0.140,
};

const GRAVEL_PER_BAG_M3: Record<StructureType, number> = {
  slab: 0.105,
  column: 0.070,
  wall: 0,
  plaster: 0,
};

export function calculateVolume(dimensions: Dimensions, structureType: StructureType): number {
  let volume = 0;

  switch (structureType) {
    case 'slab': {
      volume = (dimensions.length_m ?? 0) * (dimensions.width_m ?? 0) * (dimensions.thickness_m ?? 0);
      break;
    }
    case 'wall': {
      volume = (dimensions.length_m ?? 0) * (dimensions.height_m ?? 0) * (dimensions.thickness_m ?? 0);
      break;
    }
    case 'column': {
      if (dimensions.diameter_m) {
        volume = Math.PI * (dimensions.diameter_m / 2) ** 2 * (dimensions.height_m ?? 0);
      } else {
        volume = (dimensions.length_m ?? 0) * (dimensions.width_m ?? 0) * (dimensions.height_m ?? 0);
      }
      break;
    }
    case 'plaster': {
      volume = (dimensions.area_m2 ?? 0) * (dimensions.thickness_m ?? 0);
      break;
    }
  }

  return Math.round(volume * 1000) / 1000;
}

export function calculateMaterials(
  structureType: StructureType,
  dimensions: Dimensions,
  _resistancePsi?: number
): CalculationResult {
  const volume = calculateVolume(dimensions, structureType);
  const cementBags = Math.max(3, Math.ceil((volume / CEMENT_BAG_VOLUME_M3) * WASTE_FACTOR));
  const sand = Math.round(cementBags * SAND_PER_BAG_M3[structureType] * 100) / 100;
  const gravelRaw = cementBags * GRAVEL_PER_BAG_M3[structureType];
  const gravel = gravelRaw > 0 ? Math.round(gravelRaw * 100) / 100 : undefined;
  const water = Math.round(cementBags * CEMENT_BAG_WEIGHT_KG * WATER_CEMENT_RATIO[structureType]);
  const ratio = MIX_RATIOS[structureType];

  return {
    volume_m3: volume,
    materials: {
      cement_bags_50kg: cementBags,
      sand_m3: sand,
      gravel_m3: gravel,
      water_liters: water,
    },
    metadata: {
      formula_used: _resistancePsi
        ? `${ratio.label} - ${_resistancePsi} PSI`
        : ratio.label,
      waste_factor: WASTE_FACTOR,
      ratio: ratio.label,
    },
  };
}

export function validateDimensions(
  dimensions: Dimensions,
  structureType: StructureType
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const length = dimensions.length_m;
  const width = dimensions.width_m;
  const height = dimensions.height_m;
  const thickness = dimensions.thickness_m;
  const diameter = dimensions.diameter_m;
  const area = dimensions.area_m2;

  switch (structureType) {
    case 'slab': {
      if (length === undefined) errors.push('La longitud es requerida para losas');
      if (width === undefined) errors.push('El ancho es requerido para losas');
      if (thickness === undefined) errors.push('El espesor es requerido para losas');
      break;
    }
    case 'wall': {
      if (length === undefined) errors.push('La longitud es requerida para muros');
      if (height === undefined) errors.push('La altura es requerida para muros');
      if (thickness === undefined) errors.push('El espesor es requerido para muros');
      break;
    }
    case 'column': {
      if (diameter === undefined && (length === undefined || width === undefined)) {
        errors.push('Se requiere diámetro o largo y ancho para columnas');
      }
      if (height === undefined) errors.push('La altura es requerida para columnas');
      break;
    }
    case 'plaster': {
      if (area === undefined) errors.push('El área es requerida para revoques');
      if (thickness === undefined) errors.push('El espesor es requerido para revoques');
      break;
    }
  }

  if (length !== undefined && length < 0.1) errors.push('La longitud mínima es 0.1m');
  if (width !== undefined && width < 0.1) errors.push('El ancho mínimo es 0.1m');
  if (height !== undefined && height < 0.1) errors.push('La altura mínima es 0.1m');
  if (thickness !== undefined && thickness < 0.02) errors.push('El espesor mínimo es 0.02m');
  if (diameter !== undefined && diameter < 0.1) errors.push('El diámetro mínimo es 0.1m');
  if (area !== undefined && area < 0.1) errors.push('El área mínima es 0.1m²');

  if (length !== undefined && length > 50) errors.push('La longitud máxima es 50m');
  if (width !== undefined && width > 50) errors.push('El ancho máximo es 50m');
  if (height !== undefined && height > 50) errors.push('La altura máxima es 50m');
  if (thickness !== undefined && thickness > 1) errors.push('El espesor máximo es 1m');
  if (diameter !== undefined && diameter > 50) errors.push('El diámetro máximo es 50m');
  if (area !== undefined && area > 2500) errors.push('El área máxima es 2500m²');

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getDosageInfo(
  structureType: StructureType
): { ratio: string; bagsPerM3: number; waterCementRatio: number } {
  const ratio = MIX_RATIOS[structureType].label;
  const bagsPerM3 = Math.round(1 / CEMENT_BAG_VOLUME_M3);
  const waterCementRatio = WATER_CEMENT_RATIO[structureType];

  return { ratio, bagsPerM3, waterCementRatio };
}
