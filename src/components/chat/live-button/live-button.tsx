'use client';

import { Fragment } from 'react';
import { Mic, MicOff, Loader2, Volume2, AlertCircle, Phone } from 'lucide-react';
import { type LiveButtonProps } from './live-button-types';

const stateConfig: Record<
  string,
  { icon: typeof Mic; label: string; ariaLabel: string }
> = {
  disconnected: { icon: Mic, label: 'Voz', ariaLabel: 'Activar voz' },
  connecting: { icon: Loader2, label: 'Conectando...', ariaLabel: 'Conectando' },
  connected: { icon: Mic, label: 'Conectado', ariaLabel: 'Hablar' },
  listening: { icon: Mic, label: 'Escuchando...', ariaLabel: 'Detener' },
  thinking: { icon: Loader2, label: 'Pensando...', ariaLabel: 'Pensando' },
  speaking: { icon: Volume2, label: 'Respondiendo...', ariaLabel: 'Escuchar' },
  error: { icon: AlertCircle, label: 'Error', ariaLabel: 'Reintentar' },
};

export function LiveButton({
  state,
  interimText,
  onToggle,
  disabled = false,
}: LiveButtonProps) {
  const config = stateConfig[state] ?? stateConfig.disconnected;
  const Icon = config.icon;
  const isActive =
    state === 'listening' || state === 'thinking' || state === 'speaking' || state === 'connecting';
  const isLive = state !== 'disconnected' && state !== 'error';

  return (
    <div className="relative flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled || state === 'connecting'}
        aria-label={config.ariaLabel}
        className={`
          relative flex h-11 w-11 shrink-0 items-center justify-center
          rounded-full transition-all duration-300
          ${
            isActive
              ? 'bg-ultracem-blue text-white shadow-lg scale-110'
              : isLive
                ? 'bg-ultracem-green/10 text-ultracem-green hover:bg-ultracem-green/20'
                : 'text-ultracem-gray-600 hover:text-ultracem-blue hover:bg-ultracem-blue/10'
          }
          disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100
        `}
      >
        {state === 'listening' && (
          <Fragment>
            <span className="absolute inset-0 animate-voice-ring-1 rounded-full border-2 border-ultracem-blue/40" />
            <span className="absolute inset-0 animate-voice-ring-2 rounded-full border-2 border-ultracem-yellow/40" />
          </Fragment>
        )}
        {state === 'speaking' && (
          <span className="absolute inset-0 animate-voice-ring-1 rounded-full border-2 border-ultracem-green/40" />
        )}
        {state === 'connecting' && (
          <span className="absolute inset-0 animate-pulse rounded-full border-2 border-ultracem-blue/30" />
        )}
        <Icon
          className={`h-5 w-5 ${
            state === 'connecting' || state === 'thinking' ? 'animate-spin' : ''
          }`}
        />
      </button>

      {interimText && state === 'listening' && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-ultracem-blue px-3 py-2 text-caption text-white shadow-lg animate-fade-in-up z-50">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-ultracem-yellow" />
            <span className="truncate">{interimText}</span>
          </div>
        </div>
      )}

      <span className={`text-[10px] uppercase tracking-widest ${
        isLive ? 'text-ultracem-green font-semibold' : 'text-ultracem-gray-500'
      }`}>
        {config.label}
      </span>
    </div>
  );
}