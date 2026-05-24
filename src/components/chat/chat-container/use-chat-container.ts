'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store';
import { useGeminiLive, parseLiveResponse, type LiveState } from '@/hooks/use-gemini-live';
import { type CalculationData } from '@/components/chat/chat-container/chat-container-types';

function adaptRecommendation(
  calc: {
    volume_m3: number;
    materials: {
      cement_bags_50kg: number;
      sand_m3: number;
      gravel_m3?: number;
      water_liters: number;
    };
  } | null,
  rec: {
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
  } | null,
): CalculationData | null {
  if (!calc || !rec) return null;

  return {
    volume_m3: calc.volume_m3,
    materials: calc.materials,
    product: rec.product,
    quantity_bags: rec.quantity_bags,
    estimated_cost_cop: rec.estimated_cost_cop,
    savings_cop: rec.savings_cop,
    co2_saved_kg: rec.co2_saved_kg,
    justification: rec.justification,
  };
}

export function useChatContainer() {
  const {
    messages,
    isLoading,
    error,
    currentCalculation,
    currentRecommendation,
    sendMessage,
    startNewConversation,
  } = useChatStore();

  const [hasStarted, setHasStarted] = useState(messages.length > 0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleLiveTranscript = useCallback(
    (text: string) => {
      // transcript is displayed via interimText, no need to add to chat here
    },
    [],
  );

  const handleLiveResponse = useCallback(
    (text: string, parsed: Record<string, unknown> | null) => {
      const liveResponse = parseLiveResponse(text);
      if (liveResponse) {
        // Add the reply as an assistant message to the chat
        useChatStore.setState((state) => ({
          messages: [
            ...state.messages,
            {
              id: Math.random().toString(36).substring(2, 9),
              role: 'assistant' as const,
              content: liveResponse.reply,
              timestamp: new Date().toISOString(),
            },
          ],
        }));

        // Update extracted data if present
        if (liveResponse.extractedData) {
          useChatStore.setState((state) => ({
            extractedData: {
              ...state.extractedData,
              ...(liveResponse.extractedData as Record<string, unknown>),
            },
          }));
        }

        // Trigger calculation if ready
        if (liveResponse.isReadyForCalculation) {
          useChatStore.getState().performCalculation();
        }
      } else if (text) {
        // Fallback: just add the raw text as assistant message
        useChatStore.setState((state) => ({
          messages: [
            ...state.messages,
            {
              id: Math.random().toString(36).substring(2, 9),
              role: 'assistant' as const,
              content: text,
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      }
    },
    [],
  );

  const live = useGeminiLive({
    onTranscript: handleLiveTranscript,
    onResponse: handleLiveResponse,
    onError: (err) => console.error('[live]', err),
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, currentRecommendation]);

  const handleStart = () => {
    setHasStarted(true);
    setTimeout(() => {
      useChatStore.setState((state) => {
        if (state.messages.length > 0) return state;

        return {
          messages: [
            {
              id: Math.random().toString(36).substring(2, 9),
              role: 'assistant' as const,
              content:
                '¡Hola! Soy Vanesa de UltraCem. Puedes escribir o usar el micrófono 🎤 Cuéntame qué obra tienes en mente.',
              timestamp: new Date().toISOString(),
            },
          ],
        };
      });
    }, 600);
  };

  const handleSend = async (content: string) => {
    if (!content.trim()) return;
    await sendMessage(content);
  };

  const handleQuickAction = (prompt: string) => {
    handleSend(prompt);
  };

  const handleNewCalculation = () => {
    startNewConversation();
    live.disconnect();
    useChatStore.setState({
      messages: [
        {
          id: Math.random().toString(36).substring(2, 9),
          role: 'assistant' as const,
          content: 'Claro. ¿Qué otro proyecto vas a construir?',
          timestamp: new Date().toISOString(),
        },
      ],
    });
  };

  const handleVoiceToggle = useCallback(() => {
    live.toggleConnection();
  }, [live.toggleConnection]);

  const displayMessages = messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp,
  }));

  const calculationData = adaptRecommendation(
    currentCalculation,
    currentRecommendation,
  );

  return {
    calculationData,
    displayMessages,
    error,
    handleNewCalculation,
    handleQuickAction,
    handleSend,
    handleStart,
    handleVoiceToggle,
    hasStarted,
    isLoading,
    liveState: live.state,
    interimText: live.inputTranscript || live.outputTranscript,
    messages,
    scrollRef,
  };
}