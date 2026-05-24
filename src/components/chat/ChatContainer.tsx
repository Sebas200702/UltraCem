"use client";

import { useEffect, useRef, useState } from "react";
import { Hammer, Ruler, BrickWall, PaintBucket } from "lucide-react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { InputBar } from "@/components/chat/InputBar";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { CalculationResult } from "@/components/chat/CalculationResult";
import { useChatStore } from "@/store/chat.store";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface CalculationData {
  volume_m3: number;
  materials: {
    cement_bags_50kg: number;
    sand_m3: number;
    gravel_m3?: number;
    water_liters: number;
  };
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
}

function adaptRecommendation(
  calc: { volume_m3: number; materials: { cement_bags_50kg: number; sand_m3: number; gravel_m3?: number; water_liters: number } } | null,
  rec: {
    product: { id: string; name: string; sku: string; price_per_bag_cop: number; datasheet_url: string | null };
    quantity_bags: number;
    estimated_cost_cop: number;
    savings_cop: number;
    co2_saved_kg: number;
    justification: { technical_reason: string; economic_reason: string; environmental_reason?: string };
  } | null,
): CalculationData | null {
  if (!calc || !rec) return null;
  return {
    volume_m3: calc.volume_m3,
    materials: calc.materials,
    product: {
      id: rec.product.id,
      name: rec.product.name,
      sku: rec.product.sku,
      price_per_bag_cop: rec.product.price_per_bag_cop,
      datasheet_url: rec.product.datasheet_url,
    },
    quantity_bags: rec.quantity_bags,
    estimated_cost_cop: rec.estimated_cost_cop,
    savings_cop: rec.savings_cop,
    co2_saved_kg: rec.co2_saved_kg,
    justification: rec.justification,
  };
}

const QUICK_ACTIONS = [
  { label: "Placa", icon: Ruler, prompt: "Necesito calcular una placa de 5m x 4m x 10cm" },
  { label: "Muro", icon: BrickWall, prompt: "Muro de 3m de largo por 2.5m de alto, bloque de 15" },
  { label: "Columna", icon: Hammer, prompt: "Columna de 30x30 y 3m de altura" },
  { label: "Revoque", icon: PaintBucket, prompt: "Revocar 50 metros cuadrados con 2cm" },
];

export function ChatContainer() {
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
          messages: [{
            id: Math.random().toString(36).substring(2, 9),
            role: "assistant" as const,
            content: "¡Hola! Soy tu asistente UltraCem. Cuéntame qué obra tienes en mente. Puedes decirme algo como *'una placa de 5x4 metros de 10cm'* o *'muro de 3m largo por 2.5m alto'*.",
            timestamp: new Date().toISOString(),
          }],
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
    useChatStore.setState({
      messages: [{
        id: Math.random().toString(36).substring(2, 9),
        role: "assistant" as const,
        content: "Claro. ¿Qué otro proyecto vas a construir?",
        timestamp: new Date().toISOString(),
      }],
    });
  };

  const displayMessages = messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp,
  }));

  const calculationData = adaptRecommendation(currentCalculation, currentRecommendation);

  return (
    <div className="flex h-[100dvh] flex-col bg-ultracem-surface-muted">
      <header className="relative z-10 flex items-center justify-between border-b border-ultracem-gray-100 bg-ultracem-blue px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ultracem-yellow">
            <Hammer className="h-5 w-5 text-ultracem-blue" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-wide text-white">
              ULTRACEM
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-widest text-ultracem-yellow">
              Calculadora de materiales
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-white/70 sm:inline">
            Tiempo estimado: &lt;90s
          </span>
          <div className="h-2 w-2 rounded-full bg-ultracem-green animate-pulse" />
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden">
        {!hasStarted ? (
          <WelcomeScreen onStart={handleStart} />
        ) : (
          <div className="flex h-full flex-col">
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto bg-ultracem-surface-muted px-4 py-6 md:px-6"
            >
              <div className="mx-auto max-w-2xl space-y-5">
                {displayMessages.map((msg, index) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    index={index}
                  />
                ))}
                {isLoading && (
                  <div className="animate-slide-in-left">
                    <TypingIndicator />
                  </div>
                )}
                {error && (
                  <div className="flex justify-center">
                    <div className="max-w-[80%] rounded-full bg-red-50 px-4 py-2 text-center text-xs text-red-700 animate-fade-in-up">
                      {error}
                    </div>
                  </div>
                )}
                {calculationData && (
                  <CalculationResult
                    data={calculationData}
                    onNewCalculation={handleNewCalculation}
                  />
                )}
                <div className="h-4" />
              </div>
            </div>

            {!calculationData && messages.length > 0 && (
              <div className="border-t border-ultracem-gray-100 bg-ultracem-surface px-4 py-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-ultracem-gray-600">
                  Proyectos rápidos
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="flex shrink-0 items-center gap-1.5 rounded-full border border-ultracem-gray-100 bg-ultracem-surface-subtle px-3 py-1.5 text-xs font-medium text-ultracem-gray-900 transition-colors hover:border-ultracem-yellow hover:bg-ultracem-yellow/10"
                    >
                      <action.icon className="h-3.5 w-3.5 text-ultracem-blue" />
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <InputBar onSend={handleSend} disabled={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
}
