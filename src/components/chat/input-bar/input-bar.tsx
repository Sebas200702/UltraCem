"use client";

import { Mic, Send } from "lucide-react";
import { type InputBarProps } from '@/components/chat/input-bar/input-bar-types';
import { useInputBar } from '@/components/chat/input-bar/use-input-bar';

export function InputBar(props: InputBarProps) {
  const { disabled } = props;
  const { handleKeyDown, handleSubmit, setValue, value } = useInputBar(props);

  return (
    <div className="relative z-20 border-t border-ultracem-gray-100 bg-ultracem-surface px-4 py-3 shadow-[0_-10px_30px_rgba(0,62,120,0.06)] md:px-6">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-2xl items-end gap-2"
      >
        <div className="relative flex-1">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            placeholder="Describe tu obra... ej: placa 5x4m x 10cm"
            className="input-uc min-h-[48px] resize-none py-3 pr-10 text-body-sm"
            style={{ maxHeight: "120px" }}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ultracem-gray-600 transition-colors hover:text-ultracem-blue"
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-uc-button bg-ultracem-yellow text-ultracem-blue transition-colors hover:bg-ultracem-yellow-hover disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
      <p className="mt-2 text-center text-caption uppercase tracking-widest text-ultracem-gray-600">
        UltraCem - Cemento de calidad para tus obras
      </p>
    </div>
  );
}
