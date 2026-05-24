import type { CalculationInput } from '@/types/database.types';
import type { ColombianRegion } from '@/domains/region/region.service';
import { hasRequiredDimensions } from './conversation.service';
import type { NLPResponse } from './conversation.types';

/**
 * Short follow-up replies (city, "muro de carga", "sí") often don't need a
 * second Gemini call — merge locally when prior turns already have dimensions.
 */
export function tryFastExtract(
  message: string,
  extractedData: Partial<CalculationInput>,
  region: ColombianRegion | null,
): NLPResponse | null {
  const trimmed = message.trim();
  if (trimmed.length > 80) return null;

  const merged: Partial<CalculationInput> = { ...extractedData };

  if (/muro\s*(de\s*)?carga|soporta(r)?\s*(peso|estructura)|estructural/i.test(message)) {
    merged.resistancePsi = merged.resistancePsi ?? 3000;
  } else if (/divisorio|tabique|solo\s*separar|no\s*(es|lleva)\s*carga/i.test(message)) {
    merged.resistancePsi = merged.resistancePsi ?? 1500;
  }

  if (region && hasRequiredDimensions(merged)) {
    return {
      reply: '',
      intent: 'confirmation',
      extractedData: merged,
      isReadyForCalculation: true,
      warnings: [],
    };
  }

  if (
    /^(s[ií]|ok|dale|listo|correcto|exacto|as[ií]\s*es|confirmo)\.?$/i.test(trimmed) &&
    hasRequiredDimensions(merged)
  ) {
    return {
      reply: '',
      intent: 'confirmation',
      extractedData: merged,
      isReadyForCalculation: true,
      warnings: [],
    };
  }

  return null;
}
