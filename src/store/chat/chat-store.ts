import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CalculateResponse, ChatSendResponse } from "@/types";
import { type ChatState, type Message } from '@/store/chat/chat-store-types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
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
          role: "user",
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
          if (conversationId) body.conversationId = conversationId;

          const response = await fetch("/api/chat/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            throw new Error(
              errorBody?.error?.message ??
                `Error ${response.status}: ${response.statusText}`,
            );
          }

          const parsed = (await response.json()) as {
            success: boolean;
            data?: ChatSendResponse;
            error?: { message: string };
          };

          if (!parsed.success || !parsed.data) {
            throw new Error(
              parsed.error?.message ??
                "La respuesta del servidor no fue exitosa",
            );
          }

          const assistantMessage: Message = {
            id: generateId(),
            role: "assistant",
            content: parsed.data.reply,
            timestamp: new Date().toISOString(),
          };

          set((state) => ({
            conversationId: parsed.data?.conversationId ?? state.conversationId,
            messages: [...state.messages, assistantMessage],
            extractedData:
              (parsed.data?.extractedData as Record<string, unknown>) ?? {},
            isLoading: false,
          }));

          if (parsed.data.isReadyForCalculation) {
            await get().performCalculation();
          }
        } catch (err) {
          set({
            error:
              err instanceof Error ? err.message : "Ocurrió un error inesperado",
            isLoading: false,
          });
        }
      },

      performCalculation: async () => {
        const { conversationId, extractedData } = get();
        if (!conversationId || !extractedData.structureType) return;

        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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

          const parsed = (await response.json()) as {
            success: boolean;
            data?: CalculateResponse;
            error?: { message: string };
          };

          if (!parsed.success || !parsed.data) {
            throw new Error(
              parsed.error?.message ?? "El cálculo no pudo completarse",
            );
          }

          const summaryMessage: Message = {
            id: generateId(),
            role: "assistant",
            content: parsed.data.summaryMessage,
            timestamp: new Date().toISOString(),
            isCalculation: true,
          };

          set((state) => ({
            currentCalculation: parsed.data?.calculation ?? null,
            currentRecommendation: parsed.data
              ? {
                  product: {
                    id: parsed.data.recommendation.product.id,
                    name: parsed.data.recommendation.product.name,
                    sku: parsed.data.recommendation.product.sku,
                    price_per_bag_cop:
                      parsed.data.recommendation.product.price_per_bag_cop,
                    datasheet_url:
                      parsed.data.recommendation.product.datasheet_url ?? null,
                  },
                  quantity_bags: parsed.data.recommendation.quantity_bags,
                  estimated_cost_cop:
                    parsed.data.recommendation.estimated_cost_cop,
                  savings_cop: parsed.data.recommendation.savings_cop,
                  co2_saved_kg: parsed.data.recommendation.co2_saved_kg,
                  justification: parsed.data.recommendation.justification,
                }
              : null,
            messages: [...state.messages, summaryMessage],
            isLoading: false,
          }));
        } catch (err) {
          set({
            error:
              err instanceof Error
                ? err.message
                : "Ocurrió un error al realizar el cálculo",
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

          const parsed = (await response.json()) as {
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
              parsed.error?.message ?? "No se pudo cargar la conversación",
            );
          }

          const messages: Message[] = (parsed.data.messages ?? []).map(
            (msg) => ({
              id: msg.id,
              role: msg.role as "user" | "assistant" | "system",
              content: msg.content,
              timestamp: msg.created_at,
            }),
          );

          set({
            conversationId: parsed.data.conversation.id,
            messages,
            isLoading: false,
          });
        } catch (err) {
          set({
            error:
              err instanceof Error
                ? err.message
                : "Ocurrió un error al cargar la conversación",
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
      name: "ultracem-chat-storage",
      partialize: (state) => ({
        conversationId: state.conversationId,
        messages: state.messages,
      }),
    },
  ),
);
