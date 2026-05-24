import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  Calculation,
  CalculationInput,
  ConversationContext,
  NLPResponse,
  RecommendationOutput,
  SafetyWarning,
} from './conversation.types';
import type { StructureType } from '@/types/database.types';
import type { AppliedStandard } from '@/domains/standards/standards.service';

export function hasRequiredDimensions(
  extracted: Partial<CalculationInput> | undefined,
): boolean {
  if (!extracted) return false;
  const { structureType, dimensions } = extracted;
  if (!structureType || !dimensions) return false;

  const isPositive = (value: number | undefined): boolean =>
    typeof value === 'number' && Number.isFinite(value) && value > 0;

  switch (structureType as StructureType) {
    case 'slab':
      return (
        isPositive(dimensions.length_m) &&
        isPositive(dimensions.width_m) &&
        isPositive(dimensions.thickness_m)
      );
    case 'wall':
      return (
        isPositive(dimensions.length_m) &&
        isPositive(dimensions.height_m) &&
        isPositive(dimensions.thickness_m)
      );
    case 'column':
      return (
        isPositive(dimensions.height_m) &&
        (isPositive(dimensions.diameter_m) ||
          (isPositive(dimensions.length_m) && isPositive(dimensions.width_m)))
      );
    case 'plaster':
      return isPositive(dimensions.area_m2) && isPositive(dimensions.thickness_m);
    default:
      return false;
  }
}

type GeminiClient = InstanceType<typeof GoogleGenerativeAI>;
type GeminiModel = ReturnType<GeminiClient['getGenerativeModel']>;

const SUPPORTED_INTENTS = new Set([
  'greeting',
  'dimension_extraction',
  'confirmation',
  'calculation',
  'unknown',
]);

const FALLBACK_REPLY = 'Disculpa, tuve un problema procesando tu mensaje. ¿Podrías repetirlo?';

export class NLPService {
  readonly genAI: GeminiClient;
  readonly model: GeminiModel;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
      },
    });
  }

  /**
   * Legacy non-streaming entrypoint.
   * Extracts structured data AND generates a reply in one JSON call.
   */
  async processMessage(
    userMessage: string,
    context: ConversationContext
  ): Promise<NLPResponse> {
    const prompt = this.buildExtractionPrompt(userMessage, context);
    let attempts = 0;
    const maxAttempts = 3;
    let delay = 1000;

    while (attempts < maxAttempts) {
      try {
        attempts += 1;
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return this.parseGeminiResponse(response.text(), context);
      } catch (error) {
        console.error(`Gemini API error on attempt ${attempts}/${maxAttempts}:`, error);

        if (attempts >= maxAttempts) {
          return {
            reply: FALLBACK_REPLY,
            intent: 'unknown',
            isReadyForCalculation: false,
          };
        }

        await this.wait(delay);
        delay *= 2;
      }
    }

    return {
      reply: FALLBACK_REPLY,
      intent: 'unknown',
      isReadyForCalculation: false,
    };
  }

  /**
   * Extracts structured data (intent, dimensions, warnings, ready flag)
   * using a non-streaming JSON call. This is fast and cheap.
   */
  async extractData(
    userMessage: string,
    context: ConversationContext
  ): Promise<NLPResponse> {
    const prompt = this.buildExtractionPrompt(userMessage, context);
    let attempts = 0;
    const maxAttempts = 2;
    let delay = 1000;

    while (attempts < maxAttempts) {
      try {
        attempts += 1;
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return this.parseGeminiResponse(response.text(), context);
      } catch (error) {
        console.error(`Gemini extractData error ${attempts}/${maxAttempts}:`, error);
        if (attempts >= maxAttempts) break;
        await this.wait(delay);
        delay *= 2;
      }
    }

    return {
      reply: FALLBACK_REPLY,
      intent: 'unknown',
      isReadyForCalculation: false,
      warnings: [],
    };
  }

  /**
   * Streams a natural-language reply for the user.
   * Uses a plain-text prompt (NO JSON) so the user sees clean text.
   *
   * `extractedResult` is optional: when omitted the reply stream can start
   * BEFORE `extractData` finishes, so the user sees the first token in ~500ms
   * instead of waiting for the structured extraction (~1-3s). Gemini reads
   * the same user message and history, so the natural reply stays coherent
   * even without the pre-extracted dimensions.
   */
  async *generateReplyStream(
    userMessage: string,
    context: ConversationContext,
    extractedResult?: NLPResponse | null
  ): AsyncGenerator<string> {
    const prompt = this.buildReplyPrompt(userMessage, context, extractedResult ?? null);

    try {
      const result = await this.model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      console.error('Gemini reply stream error:', error);
      yield FALLBACK_REPLY;
    }
  }

  private async wait(milliseconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  private buildExtractionPrompt(
    userMessage: string,
    context: ConversationContext
  ): string {
    const regionBlock = context.region ? `
**REGIÓN DETECTADA:** ${context.region} (confianza: ${((context.regionConfidence ?? 0) * 100).toFixed(0)}%)
- Ajusta la dosificación según clima de esta región.
- En regiones costeras (caribe, pacifica), usa mínimo 3000 PSI por exposición marina.
- En clima cálido (>30°C), reduce ligeramente relación agua/cemento.` : '';

    const standardsBlock = context.standards && context.standards.length > 0 ? `
**NORMAS COLOMBIANAS RELEVANTES:**
${context.standards.map(s => `- ${s.code}: ${s.title} — ${s.content}`).join('\n')}

Usa estas normas para validar que las dimensiones/resistencia cumplen.` : '';

    const regionAdjustmentBlock = context.region === 'caribe' || context.region === 'pacifica' ? `
**AJUSTES POR REGIÓN COSTERA:**
- Mínimo 3000 PSI obligatorio (NSR-10 H.4.2 por exposición marina).
- Aumenta cemento 5% y reduce agua de mezcla para compensar alta temperatura.` : '';

    return `Eres Vanesa, la asistente virtual de UltraCem, una empresa colombiana de cemento. Tu trabajo es extraer datos estructurados de mensajes de maestros de obra.

**CONTEXTO:**
- Usuario típico: Maestro de obra colombiano con 20+ años de experiencia
- Lenguaje: Español colombiano coloquial (acepta "fundir", "bulto", "bloque de 15", "sacada", etc.)
- Objetivo: Extraer dimensiones de estructuras para calcular materiales
${regionBlock}
${standardsBlock}
${regionAdjustmentBlock}

**ESTRUCTURAS SOPORTADAS:**
1. PLACA/LOSA: largo × ancho × espesor (ej: "5x4 metros de 10cm")
2. MURO: largo × alto × espesor (ej: "muro de 3m de largo por 2.5 de alto, bloque de 15")
3. COLUMNA: base × base × altura O diámetro × altura (ej: "columna de 30x30 y 3m de altura")
4. REVOQUE: área × espesor (ej: "revocar 50 metros cuadrados con 2cm")

**REGLAS DE EXTRACCIÓN:**
- Convierte todas las unidades a metros (m)
- "bloque de 10" = 0.10m, "bloque de 15" = 0.15m
- Asume metros si no se especifica unidad
- Si falta alguna dimensión crítica, NO la inventes; deja el campo ausente
- Apenas tengas las dimensiones obligatorias, marca isReadyForCalculation: true
  - PLACA/LOSA: length_m, width_m, thickness_m
  - MURO: length_m, height_m, thickness_m
  - COLUMNA: height_m + (diameter_m O length_m+width_m)
  - REVOQUE: area_m2, thickness_m
- Si una dimensión ya está en DATOS EXTRAÍDOS, reutilízala
${context.region === 'caribe' || context.region === 'pacifica' ? '- Si el usuario pide <3000 PSI en zona costera, genera una advertencia severity:high.' : ''}

**FORMATO DE RESPUESTA — SOLO JSON, sin texto extra:**
{
  "reply": "mensaje amigable para el usuario (será regenerado luego, puedes dejarlo breve)",
  "intent": "greeting|dimension_extraction|confirmation|calculation|unknown",
  "extractedData": {
    "structureType": "slab|wall|column|plaster",
    "dimensions": {
      "length_m": number,
      "width_m": number,
      "height_m": number,
      "thickness_m": number,
      "diameter_m": number,
      "area_m2": number
    },
    "resistancePsi": 3000
  },
  "isReadyForCalculation": boolean,
  "warnings": [
    { "type": "resistance|coastal|seismic|curing|sustainability", "message": "advertencia", "severity": "low|medium|high" }
  ]
}

**DATOS EXTRAÍDOS HASTA AHORA:**
${JSON.stringify(context.extractedData, null, 2)}

**HISTORIAL DE CONVERSACIÓN:**
${context.messageHistory.slice(-5).map((message) => `${message.role}: ${message.content}`).join('\n')}

**MENSAJE DEL USUARIO:**
${userMessage}

Responde ÚNICAMENTE con el JSON válido.`;
  }

  private buildReplyPrompt(
    userMessage: string,
    context: ConversationContext,
    extractedResult: NLPResponse | null
  ): string {
    const regionBlock = context.region ? `
Región detectada: ${context.region}. Ajusta el tono y consejos al clima de esta zona.` : '';

    const standardsBlock = context.standards && context.standards.length > 0 ? `
Normas aplicables:
${context.standards.map(s => `- ${s.code}: ${s.title} — ${s.implication || s.content}`).join('\n')}` : '';

    // when we stream the reply in parallel with extractData, extractedResult is null.
    // fall back to whatever dimensions the conversation accumulated in prior turns.
    const accumulatedData =
      extractedResult?.extractedData ??
      (Object.keys(context.extractedData ?? {}).length > 0 ? context.extractedData : null);

    const dataBlock = accumulatedData
      ? `Datos acumulados hasta ahora: ${JSON.stringify(accumulatedData, null, 2)}
Lee también el mensaje del usuario y deduce cualquier dimensión nueva que mencione.`
      : 'Aún no hay dimensiones registradas. Lee el mensaje del usuario y deduce las que mencione.';

    let readyBlock: string;
    if (!extractedResult) {
      readyBlock =
        'Si el usuario ya dio todas las dimensiones necesarias, confírmaselas y avísale que vas a calcular. Si faltan, pregúntalas amablemente.';
    } else if (extractedResult.isReadyForCalculation) {
      readyBlock =
        'El usuario YA proporcionó todas las dimensiones necesarias. Confirma los datos y dile que vas a calcular.';
    } else {
      readyBlock = 'Faltan dimensiones. Pregunta amablemente lo que hace falta.';
    }

    const warningsBlock = extractedResult?.warnings && extractedResult.warnings.length > 0
      ? `Advertencias a comunicar: ${extractedResult.warnings.map(w => w.message).join('; ')}`
      : '';

    return `Eres Vanesa, la asistente virtual de UltraCem, una empresa colombiana de cemento. Estás conversando con maestros de obra colombianos.

**PERSONALIDAD:**
- Amigable, directa, coloquial. Usa expresiones como "listo maestro", "claro que sí", "dígame".
- Nunca uses formato JSON. Responde en texto natural, con markdown básico si quieres énfasis (**negrita**).
- Si citas una norma, menciónala con su código de forma natural.

**CONTEXTO DE LA CONVERSACIÓN:**
${regionBlock}
${standardsBlock}

${dataBlock}
${readyBlock}
${warningsBlock}

**HISTORIAL RECIENTE:**
${context.messageHistory.slice(-5).map((message) => `${message.role}: ${message.content}`).join('\n')}

**MENSAJE DEL USUARIO:**
${userMessage}

Responde de forma natural y amigable. SOLO texto, nunca JSON.`;
  }

  private parseGeminiResponse(
    text: string,
    context: ConversationContext
  ): NLPResponse {
    try {
      const jsonMatch = /\{[\s\S]*\}/.exec(text);

      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]) as Partial<NLPResponse> & {
        extractedData?: Partial<CalculationInput>;
        warnings?: SafetyWarning[];
      };

      // Merge dimensions properly - only overwrite with defined values from parsed response
      const prevDimensions = context.extractedData.dimensions ?? {};
      const newDimensions = parsed.extractedData?.dimensions ?? {};
      const mergedDimensions: Record<string, unknown> = { ...prevDimensions };
      for (const key of Object.keys(newDimensions)) {
        const value = newDimensions[key];
        if (value !== undefined) {
          mergedDimensions[key] = value;
        }
      }

      const mergedData = {
        ...context.extractedData,
        ...parsed.extractedData,
        ...(Object.keys(mergedDimensions).length > 0 ? { dimensions: mergedDimensions } : {}),
      };

      const intent = SUPPORTED_INTENTS.has(parsed.intent ?? '')
        ? (parsed.intent as NLPResponse['intent'])
        : 'unknown';

      const finalExtractedData =
        Object.keys(mergedData).length > 0 ? (mergedData as Partial<CalculationInput>) : undefined;

      const readyFlag =
        hasRequiredDimensions(finalExtractedData);

      return {
        reply: typeof parsed.reply === 'string' ? parsed.reply : text,
        intent,
        extractedData: finalExtractedData,
        isReadyForCalculation: readyFlag,
        warnings: parsed.warnings ?? [],
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);

      return {
        reply: text,
        intent: 'unknown',
        isReadyForCalculation: false,
        warnings: [],
      };
    }
  }

  generateSummaryMessage(
    calculation: Calculation,
    recommendation: RecommendationOutput
  ): string {
    return formatCalculationSummary(calculation, recommendation);
  }
}

export type { AppliedStandard } from '@/domains/standards/standards.service';

export function formatCalculationSummary(
  calculation: Calculation,
  recommendation: RecommendationOutput,
  region?: string | null,
  standards?: AppliedStandard[],
  formulaUsed?: string,
  wasteFactor?: number
): string {
  const { materials } = calculation;

  if (!materials) {
    throw new Error('La estimación no tiene materiales calculados.');
  }

  const { product, estimated_cost_cop, savings_cop, co2_saved_kg, justification } = recommendation;
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
  const volume = calculation.volume_m3 ?? 0;
  const datasheetUrl = product.datasheet_url ?? '#';

  const regionBadge = region ? `\n📍 **Región:** ${region === 'caribe' ? 'Caribe (cálido, salino)' : region === 'pacifica' ? 'Pacífica (húmedo, salino)' : 'Andina (templado)'}\n` : '';

  const standardsRef = standards && standards.length > 0
    ? `\n📋 **Referencias técnicas** _(resúmenes UltraCem, no citas literales)_:\n${standards.map((s) => {
        const ref = s.articleRef ? ` — _${s.articleRef}_` : '';
        const tag = s.verbatim ? '' : ' _(parafraseado)_';
        return `- [**${s.code}**](${s.sourceUrl}) — ${s.title}${tag}: ${s.implication}${ref}`;
      }).join('\n')}\n`
    : '';

  const methodology = `\n🔍 **Cómo se calculó:**
- **Volumen:** Dimensiones ingresadas × factor de desperdicio del ${wasteFactor ? ((wasteFactor - 1) * 100).toFixed(0) : '5-15'}% (estándar de obra según tipo de estructura).
- **Dosificación:** Tabla NSR-10 C.8.1 — ${formulaUsed ?? 'slab_3000psi'} = ${formulaUsed?.includes('4000') ? '420' : formulaUsed?.includes('plaster') ? '280' : formulaUsed?.includes('wall') ? '300' : '350'} kg cemento/m³.
- **Ajuste regional:** ${region ? (region === 'caribe' ? '+5% cemento y -0.05 agua/cemento por alta temperatura (Camacol/Caribe).' : region === 'pacifica' ? '+3% cemento y -0.03 agua/cemento por alta humedad.' : 'Sin ajuste — clima templado andino.') : 'Sin ajuste regional detectado.'}
- **Comparativa CO₂:** Baseline cemento genérico 0.95 kg CO₂/kg (referencia sectorial NTC-6112).
- **Ahorro:** Diferencia vs productos comparables activos del mismo tipo en catálogo UltraCem.\n`;

  return `✅ **MATERIALES CALCULADOS**

📐 **Volumen total:** ${volume.toFixed(2)} m³
${regionBadge}${standardsRef}
📊 **MATERIALES NECESARIOS:**
-  Cemento: **${materials.cement_bags_50kg} sacos de 50kg**
-  Arena: **${materials.sand_m3} m³**
${materials.gravel_m3 ? `• Grava: **${materials.gravel_m3} m³**\n` : ''}-  Agua: **${materials.water_liters} litros**

${methodology}
***

✅ **PRODUCTO RECOMENDADO:**
## ${product.name}

🔗 [Ver ficha técnica](${datasheetUrl})

💡 **POR QUÉ ESTE PRODUCTO:**
${justification.technical_reason}

💰 **AHORRO ESTIMADO:**
Costo optimizado: ${formatter.format(estimated_cost_cop)}
Vs. compra con margen de error: ${formatter.format(estimated_cost_cop + savings_cop)}
✅ **AHORRAS: ${formatter.format(savings_cop)}**

${co2_saved_kg > 0 ? `🌱 **BENEFICIO AMBIENTAL:**
CO₂ evitado: ${Math.round(co2_saved_kg)} kg
Equivalente a: ${Math.round(co2_saved_kg / 15)} árboles plantados\n` : ''}
📲 **¿Quieres hacer el pedido?**`;
}
