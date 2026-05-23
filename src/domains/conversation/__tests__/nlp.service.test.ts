import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NLPService, ConversationContext } from '../nlp.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Calculation, RecommendationOutput } from '../../../types/database.types';

// Declare the mock with everything self-contained inside the hoisted factory
vi.mock('@google/generative-ai', () => {
  const getGenerativeModelMock = vi.fn().mockReturnValue({
    generateContent: vi.fn(),
  });

  // Use a classic function so that it's constructible with `new` AND is a Vitest spy
  const GoogleGenerativeAIConstructorMock = vi.fn().mockImplementation(function (this: any, apiKey: string) {
    this.apiKey = apiKey;
    this.getGenerativeModel = getGenerativeModelMock;
  });

  return {
    GoogleGenerativeAI: GoogleGenerativeAIConstructorMock,
  };
});

describe('NLPService', () => {
  let nlpService: NLPService;

  beforeEach(() => {
    vi.clearAllMocks();
    nlpService = new NLPService('dummy-api-key');
  });

  const dummyContext: ConversationContext = {
    conversationId: 'conv-123',
    messageHistory: [
      {
        id: 'msg-1',
        conversation_id: 'conv-123',
        role: 'user',
        content: 'Hola, quiero calcular materiales',
        extracted_data: {},
        created_at: new Date().toISOString(),
      },
      {
        id: 'msg-2',
        conversation_id: 'conv-123',
        role: 'assistant',
        content: '¡Hola! Claro, dime qué tipo de estructura vas a fundir.',
        extracted_data: {},
        created_at: new Date().toISOString(),
      }
    ],
    extractedData: {},
  };

  it('debe inicializarse correctamente con la API Key', () => {
    // Assert on the mocked module class itself as a constructible spy
    expect(GoogleGenerativeAI).toHaveBeenCalledWith('dummy-api-key');
    
    // Check that getGenerativeModel was called on the mock instance
    const mockModel = (nlpService as any).model;
    expect(mockModel).toBeDefined();
  });

  it('debe procesar un mensaje con respuesta JSON válida y retornar un NLPResponse mapeado', async () => {
    const mockGeminiResponseText = JSON.stringify({
      reply: 'Perfecto, una losa. ¿Me puedes decir el largo, ancho y espesor en metros?',
      intent: 'dimension_extraction',
      extractedData: {
        structureType: 'slab',
      },
      isReadyForCalculation: false,
    });

    const generateContentMock = vi.mocked((nlpService as any).model.generateContent);
    generateContentMock.mockResolvedValueOnce({
      response: {
        text: () => mockGeminiResponseText,
      },
    });

    const response = await nlpService.processMessage('Es una losa o placa', dummyContext);

    expect(response.intent).toBe('dimension_extraction');
    expect(response.isReadyForCalculation).toBe(false);
    expect(response.extractedData?.structureType).toBe('slab');
    expect(response.reply).toContain('¿Me puedes decir el largo, ancho y espesor');
  });

  it('debe limpiar y extraer JSON correctamente de bloques de código markdown de Gemini', async () => {
    const mockGeminiResponseWithMarkdown = `
      \`\`\`json
      {
        "reply": "Entendido. He extraído las dimensiones: 6m de largo, 5m de ancho y 10cm de espesor.",
        "intent": "confirmation",
        "extractedData": {
          "structureType": "slab",
          "dimensions": {
            "length_m": 6,
            "width_m": 5,
            "thickness_m": 0.1
          }
        },
        "isReadyForCalculation": true
      }
      \`\`\`
    `;

    const generateContentMock = vi.mocked((nlpService as any).model.generateContent);
    generateContentMock.mockResolvedValueOnce({
      response: {
        text: () => mockGeminiResponseWithMarkdown,
      },
    });

    const response = await nlpService.processMessage('Tiene 6x5 metros y 10 cm de espesor', dummyContext);

    expect(response.intent).toBe('confirmation');
    expect(response.isReadyForCalculation).toBe(true);
    expect(response.extractedData?.dimensions?.length_m).toBe(6);
    expect(response.extractedData?.dimensions?.width_m).toBe(5);
    expect(response.extractedData?.dimensions?.thickness_m).toBe(0.1);
  });

  it('debe reintentar con backoff exponencial cuando hay un error en la API de Gemini', async () => {
    const generateContentMock = vi.mocked((nlpService as any).model.generateContent);
    
    // Simulate failure on first two tries and success on third
    generateContentMock
      .mockRejectedValueOnce(new Error('API Overloaded'))
      .mockRejectedValueOnce(new Error('Quota Limit'))
      .mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            reply: 'Disculpa la demora. He registrado tus datos.',
            intent: 'dimension_extraction',
            isReadyForCalculation: false,
          }),
        },
      });

    const startTime = Date.now();
    const response = await nlpService.processMessage('Hola de nuevo', dummyContext);
    const duration = Date.now() - startTime;

    // Under our backoff, cumulative delay must be at least 1000ms + 2000ms = 3000ms
    expect(duration).toBeGreaterThanOrEqual(3000);
    expect(generateContentMock).toHaveBeenCalledTimes(3);
    expect(response.intent).toBe('dimension_extraction');
    expect(response.reply).toBe('Disculpa la demora. He registrado tus datos.');
  });

  it('debe retornar un mensaje amigable de error y marcar fallback si la llamada falla 3 veces', async () => {
    const generateContentMock = vi.mocked((nlpService as any).model.generateContent);
    
    generateContentMock
      .mockRejectedValueOnce(new Error('Fatal Error 1'))
      .mockRejectedValueOnce(new Error('Fatal Error 2'))
      .mockRejectedValueOnce(new Error('Fatal Error 3'));

    const response = await nlpService.processMessage('Fallará completamente', dummyContext);

    expect(generateContentMock).toHaveBeenCalledTimes(3);
    expect(response.intent).toBe('unknown');
    expect(response.isReadyForCalculation).toBe(false);
    expect(response.reply).toBe('Disculpa, tuve un problema procesando tu mensaje. ¿Podrías repetirlo?');
  });

  it('debe generar el mensaje de resumen de cálculo (summaryMessage) con formato correcto en español colombiano', () => {
    const mockCalculation: Calculation = {
      id: 'calc-456',
      conversation_id: 'conv-123',
      structure_type: 'slab',
      dimensions: { length_m: 6, width_m: 5, thickness_m: 0.1 },
      volume_m3: 3.15,
      materials: {
        cement_bags_50kg: 22,
        sand_m3: 1.45,
        gravel_m3: 2.18,
        water_liters: 420,
      },
      status: 'calculated',
      created_at: new Date().toISOString(),
    };

    const mockRecommendation: RecommendationOutput = {
      product: {
        id: 'prod-1',
        sku: 'UC-EST-GR-3000',
        name: 'UltraCem Estructural Gris 3000 PSI',
        category: 'structural',
        subcategory: 'gray_structural',
        technical_specs: {
          resistance_psi: 3000,
          setting_time_hours: 24,
        },
        price_per_bag_cop: 28500,
        co2_per_kg: 0.880,
        datasheet_url: 'https://ultracem.com/fichas/estructural-gris-3000',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      quantity_bags: 22,
      estimated_cost_cop: 627000,
      savings_cop: 125400,
      co2_saved_kg: 77.0,
      justification: {
        technical_reason: 'Resistencia certificada de 3000 PSI.',
        economic_reason: 'Ahorro al comprar cantidad exacta.',
        environmental_reason: 'Reduce 77 kg de CO2.',
      },
    };

    const summary = nlpService.generateSummaryMessage(mockCalculation, mockRecommendation);

    expect(summary).toContain('✅ **MATERIALES CALCULADOS**');
    expect(summary).toContain('Volumen total:** 3.15 m³');
    expect(summary).toContain('sacos de 50kg');
    expect(summary).toContain('Arena: **1.45 m³**');
    expect(summary).toContain('Grava: **2.18 m³**');
    expect(summary).toContain('Agua: **420 litros**');
    expect(summary).toContain('UltraCem Estructural Gris 3000 PSI');
    expect(summary).toContain('AHORRAS:');
    expect(summary).toContain('125.400');
  });
});
