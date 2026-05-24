'use client';

import { Send } from 'lucide-react';
import { LiveButton } from '@/components/chat/live-button';
import { type InputBarProps } from '@/components/chat/input-bar/input-bar-types';
import { useInputBar } from '@/components/chat/input-bar/use-input-bar';

export function InputBar(props: InputBarProps) {
  const {
    disabled,
    liveState = 'disconnected',
    interimText,
    onVoiceToggle,
  } = props;
  const { handleKeyDown, handleSubmit, setValue, value } = useInputBar(props);

  const isLiveActive =
    liveState === 'listening' || liveState === 'thinking' || liveState === 'speaking' || liveState === 'connecting';

  return (
    <div className="relative z-20 border-t border-ultracem-gray-100 bg-ultracem-surface px-4 py-3 shadow-[0_-10px_30px_rgba(0,62,120,0.06)] md:px-6">
      {isLiveActive && interimText && (
        <div className="mx-auto mb-2 max-w-2xl">
          <div className="flex items-center gap-2 rounded-lg bg-ultracem-blue/5 border border-ultracem-blue/20 px-3 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-ultracem-blue" />
            <span className="text-body-sm text-ultracem-gray-700 truncate">
              {interimText}
            </span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-2xl items-end gap-2"
      >
        <div className="relative flex-1">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLiveActive}
            rows={1}
            placeholder={
              isLiveActive
                ? liveState === 'listening'
                  ? '🎤 Escuchando...'
                  : '🎤 Procesando voz...'
                : 'Describe tu obra... ej: placa 5x4m x 10cm'
            }
            className={`input-uc min-h-[48px] resize-none py-3 text-body-sm ${
              isLiveActive ? 'opacity-50 bg-ultracem-surface-subtle' : ''
            }`}
            style={{ maxHeight: '120px' }}
          />
        </div>

        <LiveButton
          state={liveState}
          interimText={interimText}
          onToggle={onVoiceToggle ?? (() => {})}
          disabled={disabled && liveState === 'disconnected'}
        />

        <button
          type="submit"
          disabled={disabled || !value.trim() || isLiveActive}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-uc-button bg-ultracem-yellow text-ultracem-blue transition-colors hover:bg-ultracem-yellow-hover disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
      <p className="mt-2 text-center text-caption uppercase tracking-widest text-ultracem-gray-600">
        UltraCem — Cemento de calidad para tus obras
      </p>
    </div>
  );
}