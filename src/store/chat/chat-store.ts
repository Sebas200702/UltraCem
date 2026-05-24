import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CalculateResponse, ChatSendResponse } from "@/types";
import { type ChatState, type Message, type CalculationMeta } from '@/store/chat/chat-store-types';

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
      calculationMeta: null,
      region: null,
      standardsApplied: [],
      warnings: [],

      sendMessage: async (content: string) => {
        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: "user",
          content,
          timestamp: new Date().toISOString(),
        };

        const assistantId = crypto.randomUUID();
        const assistantMessage: Message = {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, userMessage, assistantMessage],
          isLoading: true,
          error: null,
        }));

        try {
          const { conversationId } = get();
          const body: Record<string, unknown> = { message: content, stream: true };
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

          // Check if response is a stream (text/plain) or JSON fallback
          const contentType = response.headers.get('content-type') ?? '';
          if (!contentType.includes('text/plain')) {
            // Non-streaming fallback
            const parsed = (await response.json()) as {
              success: boolean;
              data?: ChatSendResponse;
              error?: { message: string };
            };

            if (!parsed.success || !parsed.data) {
              throw new Error(
                parsed.error?.message ?? "La respuesta del servidor no fue exitosa",
              );
            }

            if (!parsed.data) {
              throw new Error("La respuesta del servidor no fue exitosa");
            }

            const data = parsed.data;

            set((state) => ({
              messages: state.messages.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: data.reply }
                  : msg
              ),
              conversationId: data.conversationId ?? state.conversationId,
              extractedData:
                (data.extractedData as Record<string, unknown>) ?? {},
              region: data.detectedRegion ?? state.region,
              standardsApplied: data.standardsApplied ?? state.standardsApplied,
              warnings: data.warnings ?? state.warnings,
              isLoading: false,
            }));

            if (data.isReadyForCalculation) {
              await get().performCalculation();
            }
            return;
          }

          // Streaming path
          const reader = response.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          const METADATA_DELIMITER = '\n\n___METADATA___\n';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Only update UI with text before the metadata delimiter
            const delimiterIndex = buffer.indexOf(METADATA_DELIMITER);
            const textToRender = delimiterIndex >= 0
              ? buffer.slice(0, delimiterIndex)
              : buffer;

            set((state) => ({
              messages: state.messages.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: textToRender }
                  : msg
              ),
              ...(textToRender.trim() ? { isLoading: false } : {}),
            }));
          }

          // Flush remaining bytes
          buffer += decoder.decode();

          const delimiterIndex = buffer.indexOf(METADATA_DELIMITER);
          const finalText = delimiterIndex >= 0
            ? buffer.slice(0, delimiterIndex)
            : buffer;
          const metadataJson = delimiterIndex >= 0
            ? buffer.slice(delimiterIndex + METADATA_DELIMITER.length)
            : null;

          let metadata: ChatSendResponse | null = null;
          if (metadataJson) {
            try {
              metadata = JSON.parse(metadataJson) as ChatSendResponse;
            } catch {
              console.error('Failed to parse stream metadata');
            }
          }

          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: finalText || metadata?.reply || '...' }
                : msg
            ),
            conversationId: metadata?.conversationId ?? state.conversationId,
            extractedData:
              (metadata?.extractedData as Record<string, unknown>) ??
              state.extractedData,
            region: metadata?.detectedRegion ?? state.region,
            standardsApplied: metadata?.standardsApplied ?? state.standardsApplied,
            warnings: metadata?.warnings ?? state.warnings,
            isLoading: false,
          }));

          if (metadata?.isReadyForCalculation) {
            await get().performCalculation();
          }
        } catch (err) {
          set((state) => ({
            error:
              err instanceof Error ? err.message : "Ocurrió un error inesperado",
            isLoading: false,
            messages: state.messages.filter((msg) => msg.id !== assistantId),
          }));
        }
      },

      performCalculation: async () => {
        const { conversationId, extractedData, isLoading, currentCalculation } = get();
        if (!conversationId) {
          set({ error: "Aún no tengo el ID de la conversación. Por favor envía un mensaje primero." });
          return;
        }
        if (!extractedData.structureType) {
          set({ error: "Aún me falta saber qué vas a construir (placa, muro, columna o revoque)." });
          return;
        }
        // avoid duplicate calculations: voice + text paths can both call this concurrently
        if (isLoading || currentCalculation) return;

        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              conversationId,
              structureType: extractedData.structureType,
              dimensions: extractedData.dimensions ?? {},
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

          const result = parsed.data;
          const summaryMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: result.summaryMessage,
            timestamp: new Date().toISOString(),
            isCalculation: true,
          };

          const meta: CalculationMeta = {
            formulaUsed: result.formulaUsed,
            wasteFactor: result.wasteFactor,
            region: result.region,
            regionLabel: result.regionLabel,
            standardsApplied: result.standardsApplied,
            warnings: result.warnings,
          };

          set((state) => ({
            currentCalculation: result.calculation ?? null,
            currentRecommendation: {
              product: {
                id: result.recommendation.product.id,
                name: result.recommendation.product.name,
                sku: result.recommendation.product.sku,
                price_per_bag_cop:
                  result.recommendation.product.price_per_bag_cop,
                product_url:
                  result.recommendation.product.product_url ?? null,
                datasheet_url:
                  result.recommendation.product.datasheet_url ?? null,
              },
              quantity_bags: result.recommendation.quantity_bags,
              estimated_cost_cop:
                result.recommendation.estimated_cost_cop,
              savings_cop: result.recommendation.savings_cop,
              co2_saved_kg: result.recommendation.co2_saved_kg,
              justification: result.recommendation.justification,
              comparison: result.recommendation.comparison,
            },
            calculationMeta: meta,
            region: result.region ?? state.region,
            standardsApplied: result.standardsApplied ?? state.standardsApplied,
            warnings: result.warnings ?? state.warnings,
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

      extractFromVoice: async (content: string) => {
        // voice mode: gemini live already replied via audio. we only need the
        // text NLP to extract dimensions and decide if the calculation is ready.
        // we DO NOT add user/assistant messages here (the live hook already added
        // the user transcript, and there is no second assistant reply to show).
        const trimmed = content.trim();
        if (!trimmed) return;

        try {
          const { conversationId } = get();
          const body: Record<string, unknown> = { message: trimmed };
          if (conversationId) body.conversationId = conversationId;

          const response = await fetch("/api/chat/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!response.ok) return;

          const parsed = (await response.json()) as {
            success: boolean;
            data?: ChatSendResponse;
          };

          if (!parsed.success || !parsed.data) return;

          set((state) => ({
            conversationId: parsed.data?.conversationId ?? state.conversationId,
            extractedData:
              (parsed.data?.extractedData as Record<string, unknown>) ??
              state.extractedData,
            region: parsed.data?.detectedRegion ?? state.region,
            standardsApplied: parsed.data?.standardsApplied ?? state.standardsApplied,
            warnings: parsed.data?.warnings ?? state.warnings,
          }));

          if (parsed.data.isReadyForCalculation) {
            await get().performCalculation();
          }
        } catch (err) {
          console.error("[extractFromVoice]", err);
        }
      },

      startNewConversation: () => {
        set({
          conversationId: null,
          messages: [],
          extractedData: {},
          currentCalculation: null,
          currentRecommendation: null,
          calculationMeta: null,
          region: null,
          standardsApplied: [],
          warnings: [],
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
          calculationMeta: null,
          region: null,
          standardsApplied: [],
          warnings: [],
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
        region: state.region,
      }),
    },
  ),
);