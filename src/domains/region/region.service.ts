export type ColombianRegion = 'caribe' | 'andina' | 'pacifica';

export interface RegionInfo {
  region: ColombianRegion;
  climate: {
    avgTemp: number;
    avgHumidity: number;
    marineExposure: boolean;
  };
  dosageAdjustments: {
    cementMultiplier: number;
    waterRatioOffset: number;
  };
  wasteFactorOffset: number;
  minCuringDays: number;
  coastalPsiMin: number;
  sustainableTips: string[];
}

/**
 * Ajustes regionales basados en clima, normas Colombianas y buenas prácticas de obra.
 *
 * FUENTES:
 * - Caribe: Camacol BP-01 (concreto en clima cálido) + NSR-10 H.5.2 (curado en calor).
 *   • +5% cemento para compensar evaporación rápida por temperatura >30°C.
 *   • -0.05 en relación agua/cemento para evitar fisuración por secado.
 *   • +2% desperdicio por condiciones de obra en calor.
 *   • Mínimo 3000 PSI en costa (NSR-10 H.4.2).
 * - Andina: Clima templado, sin ajustes estructurales. Mínimo 2500 PSI base.
 * - Pacífica: NSR-10 H.5.2 + condiciones de alta humedad.
 *   • +3% cemento por humedad constante y lluvia frecuente.
 *   • -0.03 en relación agua/cemento para reducir segregación.
 *   • +3% desperdicio por manejo de materiales en lodo/humedad.
 */
const REGIONS: Record<ColombianRegion, RegionInfo> = {
  caribe: {
    region: 'caribe',
    climate: { avgTemp: 32, avgHumidity: 85, marineExposure: true },
    // Fuente: Camacol BP-01 — compensación por temperatura >30°C
    dosageAdjustments: { cementMultiplier: 1.05, waterRatioOffset: -0.05 },
    // Fuente: Práctica de obra en clima cálido (mayor evaporación = más desperdicio)
    wasteFactorOffset: 0.02,
    minCuringDays: 7,
    coastalPsiMin: 3000, // NSR-10 H.4.2
    sustainableTips: [
      'Usa curado húmedo continuo por al menos 7 días para evitar fisuración por calor.',
      'Prefiere agregados de origen local (radio < 100 km) para reducir CO₂ de transporte.',
      'Protege las mezclas frescas del sol directo con lonas o plástico.',
      'Captura agua lluvia para el curado — en el Caribe es abundante y gratuita.',
    ],
  },
  andina: {
    region: 'andina',
    climate: { avgTemp: 18, avgHumidity: 70, marineExposure: false },
    // Sin ajustes: clima templado ideal para dosificación estándar
    dosageAdjustments: { cementMultiplier: 1.0, waterRatioOffset: 0 },
    wasteFactorOffset: 0,
    minCuringDays: 5,
    coastalPsiMin: 2500,
    sustainableTips: [
      'El clima frío retarda el fraguado — considera aditivos acelerantes si es urgente.',
      'Usa ceniza volante o escoria como reemplazo parcial de cemento para bajar CO₂.',
      'En alturas >2000 msnm, aumenta el tiempo de mezclado para homogeneidad.',
    ],
  },
  pacifica: {
    region: 'pacifica',
    climate: { avgTemp: 28, avgHumidity: 90, marineExposure: true },
    // Fuente: NSR-10 H.5.2 — alta humedad requiere menos agua de mezcla
    dosageAdjustments: { cementMultiplier: 1.03, waterRatioOffset: -0.03 },
    // Fuente: Práctica de obra — mayor dificultad de manejo en humedad
    wasteFactorOffset: 0.03,
    minCuringDays: 7,
    coastalPsiMin: 3000, // NSR-10 H.4.2 (exposición marina)
    sustainableTips: [
      'Alta humedad — reduce el agua de mezcla y evita segregación.',
      'Utiliza impermeabilizantes en cimentaciones por lluvia frecuente.',
      'Prefiere materiales que requieran menos agua de curado.',
    ],
  },
};

const REGION_PATTERNS: Record<ColombianRegion, { cities: string[]; departments: string[]; keywords: string[]; antiKeywords: string[] }> = {
  caribe: {
    cities: ['barranquilla', 'cartagena', 'santa marta', 'valledupar', 'sincelejo', 'montería', 'riohacha', 'soledad', 'malambo', 'ciénaga', 'magangué', 'maicao', 'turbo', 'apartadó'],
    departments: ['atlántico', 'bolívar', 'cesar', 'córdoba', 'guajira', 'magdalena', 'sucre', 'san andrés'],
    keywords: ['costa', 'mar', 'playa', 'salitre', 'calor', 'costeño', 'caribe', 'corroncho'],
    antiKeywords: ['bogotá', 'medellín', 'cali', 'frío', 'altiplano'],
  },
  andina: {
    cities: ['bogotá', 'medellín', 'bucaramanga', 'manizales', 'pereira', 'armenia', 'ibagué', 'tunja', 'cúcuta', 'neiva', 'popayán', 'pasto'],
    departments: ['cundinamarca', 'antioquia', 'santander', 'caldas', 'risaralda', 'quindío', 'tolima', 'boyacá', 'norte de santander', 'huila'],
    keywords: ['altiplano', 'frío', 'montaña', 'santandereano', 'paisa', 'rolo', 'cachaco'],
    antiKeywords: ['costa', 'mar', 'playa', 'calor'],
  },
  pacifica: {
    cities: ['cali', 'buenaventura', 'tumaco', 'quibdó', 'guapi'],
    departments: ['valle del cauca', 'cauca', 'nariño', 'chocó'],
    keywords: ['pacífico', 'lluvia', 'selva', 'chocoano', 'valluno'],
    antiKeywords: ['bogotá', 'medellín', 'caribe'],
  },
};

const REGION_QUESTION = 'Para darte un cálculo más preciso, ¿en qué ciudad estás construyendo? Así ajusto la mezcla al clima y las normas de tu región.';

export function detectRegion(message: string): { region: ColombianRegion | null; confidence: number; detectedBy: string } {
  const text = message.toLowerCase();

  for (const [region, patterns] of Object.entries(REGION_PATTERNS)) {
    for (const city of patterns.cities) {
      if (text.includes(city)) return { region: region as ColombianRegion, confidence: 0.95, detectedBy: 'city' };
    }
  }

  for (const [region, patterns] of Object.entries(REGION_PATTERNS)) {
    for (const dept of patterns.departments) {
      if (text.includes(dept)) return { region: region as ColombianRegion, confidence: 0.80, detectedBy: 'department' };
    }
  }

  let bestRegion: ColombianRegion | null = null;
  let bestScore = 0;
  for (const [region, patterns] of Object.entries(REGION_PATTERNS)) {
    let score = 0;
    for (const kw of patterns.keywords) {
      if (text.includes(kw)) score += 2;
    }
    for (const akw of patterns.antiKeywords) {
      if (text.includes(akw)) score -= 5;
    }
    if (score > bestScore) { bestScore = score; bestRegion = region as ColombianRegion; }
  }

  if (bestScore >= 2) return { region: bestRegion, confidence: 0.50, detectedBy: 'keyword' };
  return { region: null, confidence: 0, detectedBy: 'none' };
}

export function getRegionInfo(region: ColombianRegion): RegionInfo {
  return REGIONS[region];
}

const REGION_LABELS: Record<ColombianRegion, string> = {
  caribe: 'Caribe (cálido, salino)',
  andina: 'Andina (templado)',
  pacifica: 'Pacífica (húmedo, salino)',
};

export function getRegionLabel(region: ColombianRegion | null | undefined): string {
  if (!region) return 'Andina (templado)';
  return REGION_LABELS[region];
}

export function getRegionQuestion(): string {
  return REGION_QUESTION;
}

export function getCoastalPsiMin(region: ColombianRegion | null): number {
  return region ? REGIONS[region].coastalPsiMin : 2500;
}
