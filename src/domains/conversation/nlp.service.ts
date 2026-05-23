import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message, CalculationInput, Calculation, RecommendationOutput } from '../../types/database.types';

export interface ConversationContext {
  conversationId: string;
  messageHistory: Message[];
  extractedData: Partial<CalculationInput>;
}

export interface NLPResponse {
  reply: string;
  intent: 'greeting' | 'dimension_extraction' | 'confirmation' | 'calculation' | 'unknown';
  extractedData?: Partial<CalculationInput>;
  isReadyForCalculation: boolean;
}

export class NLPService {
  readonly genAI: GoogleGenerativeAI;
  readonly model: any;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-3.1-flash',
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent outputs
        maxOutputTokens: 500,
      }
    });
  }

  /**
   * Process user message and extract construction parameters
   */
  async processMessage(
    userMessage: string,
    context: ConversationContext
  ): Promise<NLPResponse> {
    const prompt = this.buildPrompt(userMessage, context);
    let attempts = 0;
    const maxAttempts = 3;
    let delay = 1000;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        // Log sanitized prompt details for debugging and performance tracking
        console.log(`[Gemini Request] Attempt ${attempts}/${maxAttempts} - prompt length: ${prompt.length}`);

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Log response length to ensure a valid payload is received
        console.log(`[Gemini Response] Attempt ${attempts}/${maxAttempts} - response length: ${text.length}`);

        return this.parseGeminiResponse(text, context);
      } catch (error) {
        console.error(`Gemini API error on attempt ${attempts}/${maxAttempts}:`, error);

        if (attempts >= maxAttempts) {
          return {
            reply: 'Disculpa, tuve un problema procesando tu mensaje. ¿Podrías repetirlo?',
            intent: 'unknown',
            isReadyForCalculation: false,
          };
        }

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    return {
      reply: 'Disculpa, tuve un problema procesando tu mensaje. ¿Podrías repetirlo?',
      intent: 'unknown',
      isReadyForCalculation: false,
    };
  }

  private buildPrompt(
    userMessage: string,
    context: ConversationContext
  ): string {
    const systemPrompt = `Eres el Asistente Virtual de UltraCem, una empresa colombiana de cemento. Tu objetivo es ayudar a maestros de obra a calcular materiales de construcción de forma rápida y precisa.

**CONTEXTO:**
- Usuario típico: Maestro de obra colombiano con 20+ años de experiencia
- Lenguaje: Español colombiano coloquial (acepta "fundir", "bulto", "bloque de 15", etc.)
- Objetivo: Extraer dimensiones de estructuras para calcular materiales

**ESTRUCTURAS SOPORTADAS:**
1. PLACA/LOSA: largo × ancho × espesor (ej: "5x4 metros de 10cm")
2. MURO: largo × alto × espesor (ej: "muro de 3m de largo por 2.5 de alto, bloque de 15")
3. COLUMNA: base × base × altura O diámetro × altura (ej: "columna de 30x30 y 3m de altura")
4. REVOQUE: área × espesor (ej: "revocar 50 metros cuadrados con 2cm")

**REGLAS DE EXTRACCIÓN:**
- Convierte todas las unidades a metros (m)
- "bloque de 10" = 0.10m, "bloque de 15" = 0.15m
- Asume metros si no se especifica unidad
- Si falta alguna dimensión crítica, pregunta específicamente
- No más de 3 preguntas antes de calcular

**FORMATO DE RESPUESTA:**
Responde SIEMPRE en este formato JSON:
{
  "reply": "mensaje amigable para el usuario",
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
  "isReadyForCalculation": boolean
}

**DATOS EXTRAÍDOS HASTA AHORA:**
${JSON.stringify(context.extractedData, null, 2)}

**HISTORIAL DE CONVERSACIÓN:**
${context.messageHistory.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

**MENSAJE DEL USUARIO:**
${userMessage}

**INSTRUCCIONES:**
1. Analiza el mensaje del usuario
2. Extrae o confirma dimensiones
3. Si falta información, pregunta de forma natural
4. Si tienes toda la info, marca isReadyForCalculation=true
5. Responde en JSON válido`;

    return systemPrompt;
  }

  private parseGeminiResponse(
    text: string,
    context: ConversationContext
  ): NLPResponse {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Merge extracted data with context
      const mergedData = {
        ...context.extractedData,
        ...parsed.extractedData,
      };

      return {
        reply: parsed.reply,
        intent: parsed.intent,
        extractedData: mergedData,
        isReadyForCalculation: parsed.isReadyForCalculation || false,
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return {
        reply: text,
        intent: 'unknown',
        isReadyForCalculation: false,
      };
    }
  }

  /**
   * Generate final calculation summary message
   */
  generateSummaryMessage(
    calculation: Calculation,
    recommendation: RecommendationOutput
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

    return `✅ **MATERIALES CALCULADOS**

📐 **Volumen total:** ${calculation.volume_m3 ? calculation.volume_m3.toFixed(2) : '0.00'} m³

📊 **MATERIALES NECESARIOS:**
-  Cemento: **${materials.cement_bags_50kg} sacos de 50kg**
-  Arena: **${materials.sand_m3} m³**
${materials.gravel_m3 ? `• Grava: **${materials.gravel_m3} m³**\n` : ''}-  Agua: **${materials.water_liters} litros**

***

✅ **PRODUCTO RECOMENDADO:**
## ${product.name}

🔗 [Ver ficha técnica](${product.datasheet_url})

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
}
