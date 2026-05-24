"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { Send, Mic } from "lucide-react";

interface InputBarProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function InputBar({ onSend, disabled }: InputBarProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <div className="relative z-20 border-t border-ultracem-gray-100 bg-ultracem-surface px-4 py-3 md:px-6">
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl items-end gap-2">
        <div className="relative flex-1">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            placeholder="Describe tu obra... (ej: placa 5x4m x 10cm)"
            className="input-uc min-h-[48px] resize-none py-3 pr-10 text-sm"
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
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-uc-button bg-ultracem-yellow text-ultracem-blue transition-all hover:bg-ultracem-yellow-hover hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-none"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
      <p className="mt-2 text-center text-[9px] uppercase tracking-widest text-ultracem-gray-600">
        UltraCem — Cemento de calidad para tus obras
      </p>
    </div>
  );
}
