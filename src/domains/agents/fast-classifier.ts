import type { StructureType } from '@/types/database.types';

export interface FastClassification {
  intent: 'calculation' | 'standards_query' | 'sustainability_query' | 'greeting' | 'needs_gemini';
  structureType?: StructureType;
  hasDimensions: boolean;
}

const PATTERNS: Array<{ pattern: RegExp; intent: FastClassification['intent']; structureType?: StructureType }> = [
  { pattern: /placa|losa|contrapiso|fundir\s*(placa|piso|losa)/i, intent: 'calculation', structureType: 'slab' },
  { pattern: /muro|pared|bloque\s*(10|12|15|20)|pegar\s*bloque|mamposter/i, intent: 'calculation', structureType: 'wall' },
  { pattern: /columna|viga|pilar/i, intent: 'calculation', structureType: 'column' },
  { pattern: /revoc|repel|pañet|estuc|repello|zafar/i, intent: 'calculation', structureType: 'plaster' },
  { pattern: /norma|nsr|ntc|reglamento|estándar|requisito\s*(técnico|estructural)/i, intent: 'standards_query' },
  { pattern: /sostenible|co2|ambiental|verde|ecológico|huella|carbono|resolución\s*0549/i, intent: 'sustainability_query' },
  { pattern: /hola|buenos?\s*(días|tardes|noches)|quiubo|qué\s+más|saludo/i, intent: 'greeting' },
];

export function fastClassify(message: string): FastClassification {
  for (const { pattern, intent, structureType } of PATTERNS) {
    if (pattern.test(message)) {
      return {
        intent,
        structureType,
        hasDimensions: /\d+\s*[xX\*]\s*\d+/.test(message),
      };
    }
  }

  const hasDimensions = /\d+\s*[xX\*]\s*\d+/.test(message) || /\d+\.?\d*\s*(m|mt|metro|cm|cent[íi]metro)/i.test(message);

  return { intent: 'needs_gemini', hasDimensions };
}
