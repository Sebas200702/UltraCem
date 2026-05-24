import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ChatSendResponse,
  CalculateResponse,
} from '@/types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isCalculation?: boolean;
}

interface ChatState {
  conversationId: string | null;
  messages: Message[];
  extractedData: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
  currentCalculation: {
    id: string;
    volume_m3: number;
    materials: {
      cement_bags_50kg: number;
      sand_m3: number;
      gravel_m3?: number;
      water_liters: number;
    };
  } | null;
  currentRecommendation: {
    product: {
      id: string;
      name: string;
      sku: string;
      price_per_bag_cop: number;
      datasheet_url: string | null;
    };
    quantity_bags: number;
    estimated_cost_cop: number;
    savings_cop: number;
    co2_saved_kg: number;
    justification: {
      technical_reason: string;
      economic_reason: string;
      environmental_reason?: string;
    };
  } | null;
  sendMessage: (content: string) => Promise<void>;
  performCalculation: () => Promise<void>;
  startNewConversation: () => void;
  loadConversation: (id: string) => Promise<void>;
  resetChat: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversationId: null,
      messages: [],
      extractedData: {},
      isLoading: false,
      error: null,
      currentCalculation: null,
      currentRecommendation: null,

      sendMessage: async (content: string) => {
        const userMessage: Message = {
          id: generateId(),
          role: 'user',
          content,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, userMessage],
          isLoading: true,
          error: null,
        }));

        try {
          const { conversationId } = get();
          const body: Record<string, unknown> = { message: content };
          if (conversationId) {
            body.conversationId = conversationId;
          }

          const response = await fetch('/api/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            throw new Error(
              errorBody?.error?.message ?? `Error ${response.status}: ${response.statusText}`,
            );
          }

          const json = await response.json();
          const parsed = json as {
            success: boolean;
            data?: ChatSendResponse;
            error?: { message: string };
          };

          if (!parsed.success || !parsed.data) {
            throw new Error(
              parsed.error?.message ?? 'La respuesta del servidor no fue exitosa',
            );
          }

          const { data: responseData } = parsed;

          const assistantMessage: Message = {
            id: generateId(),
            role: 'assistant',
            content: responseData.reply,
            timestamp: new Date().toISOString(),
          };

          set((state) => ({
            conversationId: responseData.conversationId,
            messages: [...state.messages, assistantMessage],
            extractedData:
              (responseData.extractedData as Record<string, unknown>) ?? {},
            isLoading: false,
          }));

          if (responseData.isReadyForCalculation) {
            await get().performCalculation();
          }
        } catch (err) {
          set({
            error:
              err instanceof Error
                ? err.message
                : 'Ocurrió un error inesperado',
            isLoading: false,
          });
        }
      },

      performCalculation: async () => {
        const { conversationId, extractedData } = get();

        if (!conversationId || !extractedData.structureType) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId,
              structureType: extractedData.structureType,
              dimensions: extractedData.dimensions,
              resistancePsi: extractedData.resistancePsi,
            }),
          });

          if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            throw new Error(
              errorBody?.error?.message ??
                `Error ${response.status}: ${response.statusText}`,
            );
          }

          const json = await response.json();
          const parsed = json as {
            success: boolean;
            data?: CalculateResponse;
            error?: { message: string };
          };

          if (!parsed.success || !parsed.data) {
            throw new Error(
              parsed.error?.message ?? 'El cálculo no pudo completarse',
            );
          }

          const { data: responseData } = parsed;

          const summaryMessage: Message = {
            id: generateId(),
            role: 'assistant',
            content: responseData.summaryMessage,
            timestamp: new Date().toISOString(),
            isCalculation: true,
          };

          set((state) => ({
            currentCalculation: responseData.calculation,
            currentRecommendation: {
              product: {
                id: responseData.recommendation.product.id,
                name: responseData.recommendation.product.name,
                sku: responseData.recommendation.product.sku,
                price_per_bag_cop:
                  responseData.recommendation.product.price_per_bag_cop,
                datasheet_url:
                  responseData.recommendation.product.datasheet_url ?? null,
              },
              quantity_bags: responseData.recommendation.quantity_bags,
              estimated_cost_cop:
                responseData.recommendation.estimated_cost_cop,
              savings_cop: responseData.recommendation.savings_cop,
              co2_saved_kg: responseData.recommendation.co2_saved_kg,
              justification: responseData.recommendation.justification,
            },
            messages: [...state.messages, summaryMessage],
            isLoading: false,
          }));
        } catch (err) {
          set({
            error:
              err instanceof Error
                ? err.message
                : 'Ocurrió un error al realizar el cálculo',
            isLoading: false,
          });
        }
      },

      startNewConversation: () => {
        set({
          conversationId: null,
          messages: [],
          extractedData: {},
          currentCalculation: null,
          currentRecommendation: null,
          error: null,
          isLoading: false,
        });
      },

      loadConversation: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/conversations/${id}`);

          if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            throw new Error(
              errorBody?.error?.message ??
                `Error ${response.status}: ${response.statusText}`,
            );
          }

          const json = await response.json();
          const parsed = json as {
            success: boolean;
            data?: {
              conversation: { id: string };
              messages: Array<{
                id: string;
                role: string;
                content: string;
                created_at: string;
              }>;
            };
            error?: { message: string };
          };

          if (!parsed.success || !parsed.data) {
            throw new Error(
              parsed.error?.message ?? 'No se pudo cargar la conversación',
            );
          }

          const { data: responseData } = parsed;

          const messages: Message[] = (responseData.messages ?? []).map(
            (msg) => ({
              id: msg.id,
              role: msg.role as 'user' | 'assistant' | 'system',
              content: msg.content,
              timestamp: msg.created_at,
            }),
          );

          set({
            conversationId: responseData.conversation.id,
            messages,
            isLoading: false,
          });
        } catch (err) {
          set({
            error:
              err instanceof Error
                ? err.message
                : 'Ocurrió un error al cargar la conversación',
            isLoading: false,
          });
        }
      },

      resetChat: () => {
        set({
          conversationId: null,
          messages: [],
          extractedData: {},
          currentCalculation: null,
          currentRecommendation: null,
          error: null,
          isLoading: false,
        });
      },
    }),
    {
      name: 'ultracem-chat-storage',
      partialize: (state) => ({
        conversationId: state.conversationId,
        messages: state.messages,
      }),
    },
  ),
);
