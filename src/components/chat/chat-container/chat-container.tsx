'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { UltraCemLogo } from '@/components/brand';
import { CalculationResult } from '@/components/chat/calculation-result';
import { InputBar } from '@/components/chat/input-bar';
import { MessageBubble } from '@/components/chat/message-bubble';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { WelcomeScreen } from '@/components/chat/welcome-screen';
import { QUICK_ACTIONS } from '@/components/chat/chat-container/chat-container-data';
import { useChatContainer } from '@/components/chat/chat-container/use-chat-container';

type StatusToken = {
  readonly label: string;
  readonly dotClass: string;
  readonly badgeClass: string;
};

function getStatusToken(state: string): StatusToken | null {
  switch (state) {
    case 'listening':
      return {
        label: 'LIVE',
        dotClass: 'bg-red-400 animate-pulse',
        badgeClass: 'bg-red-500/20 text-white',
      };
    case 'connecting':
      return {
        label: 'Conectando',
        dotClass: 'bg-ultracem-yellow animate-spin',
        badgeClass: 'bg-ultracem-yellow/20 text-white',
      };
    case 'thinking':
    case 'speaking':
      return {
        label: 'Voz activa',
        dotClass: 'bg-ultracem-green animate-pulse',
        badgeClass: 'bg-ultracem-green/20 text-white',
      };
    case 'disconnected':
    default:
      return {
        label: 'En línea',
        dotClass: 'bg-ultracem-green',
        badgeClass: 'bg-white/10 text-white/85',
      };
  }
}

function QuickActionsBar({ onAction }: { onAction: (prompt: string) => void }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const firstMobile = QUICK_ACTIONS.slice(0, 1);
  const restMobile = QUICK_ACTIONS.slice(1);

  const firstDesktop = QUICK_ACTIONS.slice(0, 3);
  const restDesktop = QUICK_ACTIONS.slice(3);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelect = (prompt: string) => {
    onAction(prompt);
    setOpen(false);
  };

  return (
    <div className="border-t border-ultracem-gray-100 bg-ultracem-surface px-4 py-3">
      <p className="mb-2 text-caption font-semibold uppercase tracking-widest text-ultracem-gray-600">
        Proyectos rápidos
      </p>
      <div className="flex items-center gap-2">
        {/* Mobile: solo la primera */}
        {firstMobile.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => onAction(action.prompt)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-ultracem-gray-100 bg-ultracem-surface-subtle px-3 py-1.5 text-caption font-medium text-ultracem-gray-900 transition-colors hover:border-ultracem-yellow hover:bg-ultracem-yellow/10 sm:hidden"
          >
            <action.icon className="h-3.5 w-3.5 text-ultracem-blue" />
            {action.label}
          </button>
        ))}

        {/* Desktop: las primeras 3 */}
        {firstDesktop.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => onAction(action.prompt)}
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-ultracem-gray-100 bg-ultracem-surface-subtle px-3 py-1.5 text-caption font-medium text-ultracem-gray-900 transition-colors hover:border-ultracem-yellow hover:bg-ultracem-yellow/10 sm:flex"
          >
            <action.icon className="h-3.5 w-3.5 text-ultracem-blue" />
            {action.label}
          </button>
        ))}

        {/* Mobile dropdown: restMobile */}
        {restMobile.length > 0 && (
          <div className="relative sm:hidden" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-caption font-medium transition-colors ${
                open
                  ? 'border-ultracem-yellow bg-ultracem-yellow/10 text-ultracem-blue'
                  : 'border-ultracem-gray-100 bg-ultracem-surface-subtle text-ultracem-gray-900 hover:border-ultracem-yellow hover:bg-ultracem-yellow/10'
              }`}
            >
              <span>Más</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {open && (
              <div className="absolute bottom-full left-0 mb-2 w-56 rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface py-2 shadow-uc-card">
                {restMobile.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => handleSelect(action.prompt)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-caption font-medium text-ultracem-gray-900 transition-colors hover:bg-ultracem-yellow/10"
                  >
                    <action.icon className="h-4 w-4 shrink-0 text-ultracem-blue" />
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Desktop dropdown: restDesktop */}
        {restDesktop.length > 0 && (
          <div className="relative hidden sm:block" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-caption font-medium transition-colors ${
                open
                  ? 'border-ultracem-yellow bg-ultracem-yellow/10 text-ultracem-blue'
                  : 'border-ultracem-gray-100 bg-ultracem-surface-subtle text-ultracem-gray-900 hover:border-ultracem-yellow hover:bg-ultracem-yellow/10'
              }`}
            >
              <span>Más</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {open && (
              <div className="absolute bottom-full left-0 mb-2 w-56 rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface py-2 shadow-uc-card">
                {restDesktop.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => handleSelect(action.prompt)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-caption font-medium text-ultracem-gray-900 transition-colors hover:bg-ultracem-yellow/10"
                  >
                    <action.icon className="h-4 w-4 shrink-0 text-ultracem-blue" />
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatContainer() {
  const {
    calculationData,
    displayMessages,
    error,
    handleNewCalculation,
    handleQuickAction,
    handleQuickStart,
    handleSend,
    handleStart,
    handleVoiceToggle,
    hasStarted,
    isLoading,
    interimText,
    liveState,
    messages,
    scrollRef,
  } = useChatContainer();

  const status = getStatusToken(liveState);

  const lastMessage = displayMessages[displayMessages.length - 1];
  const awaitingFirstToken =
    isLoading &&
    (!lastMessage ||
      lastMessage.role !== 'assistant' ||
      !lastMessage.content.trim());
  const isCalculatingMaterials =
    isLoading &&
    !awaitingFirstToken &&
    Boolean(lastMessage?.role === 'assistant' && lastMessage.content.trim());

  return (
    <div className="flex h-[100dvh] flex-col bg-ultracem-surface-muted">
      <header className="relative z-10 flex items-center justify-between border-b border-white/10 bg-ultracem-blue px-4 py-3 shadow-uc-card md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Volver al inicio" className="shrink-0">
            <UltraCemLogo variant="light" priority className="h-10 w-auto md:h-12" />
          </Link>
          <div className="hidden flex-col sm:flex">
            <p className="text-caption font-medium uppercase tracking-widest text-ultracem-yellow">
              Calculadora de materiales
            </p>
            <p className="text-caption text-white/65">Asistente Vanesa</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-semibold ${status.badgeClass}`}
            >
              <span className={`h-2 w-2 rounded-full ${status.dotClass}`} />
              {status.label}
            </span>
          )}
          <span className="hidden text-caption text-white/65 md:inline">
            &lt; 90s
          </span>
          <Link
            href="/"
            className="ml-1 inline-flex h-9 items-center gap-2 rounded-uc-button border border-white/15 bg-white/10 px-3 text-caption font-semibold text-white transition-colors hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden">
        {!hasStarted ? (
          <WelcomeScreen onStart={handleStart} onQuickStart={handleQuickStart} />
        ) : (
          <div className="flex h-full flex-col">
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto bg-ultracem-surface-muted px-4 py-6 md:px-6"
            >
              <div className="mx-auto max-w-2xl space-y-5 pb-24 sm:pb-6">
                {displayMessages.map((msg, index) => (
                  <MessageBubble key={msg.id} message={msg} index={index} />
                ))}
                {awaitingFirstToken && (
                  <div className="animate-slide-in-left">
                    <TypingIndicator label="Escribiendo..." />
                  </div>
                )}
                {isCalculatingMaterials && (
                  <div className="animate-slide-in-left">
                    <TypingIndicator label="Calculando materiales..." />
                  </div>
                )}
                {calculationData && (
                  <CalculationResult
                    data={calculationData}
                    onNewCalculation={handleNewCalculation}
                  />
                )}
                {error && (
                  <div className="flex justify-center">
                    <div className="max-w-[80%] rounded-full bg-red-50 px-4 py-2 text-center text-caption text-red-700 animate-fade-in-up">
                      {error}
                    </div>
                  </div>
                )}
                <div className="h-4" />
              </div>
            </div>

            {!calculationData && messages.length > 0 && (
              <QuickActionsBar onAction={handleQuickAction} />
            )}

            <InputBar
              onSend={handleSend}
              disabled={isLoading}
              liveState={liveState}
              interimText={interimText}
              onVoiceToggle={handleVoiceToggle}
            />
          </div>
        )}
      </div>
    </div>
  );
}
