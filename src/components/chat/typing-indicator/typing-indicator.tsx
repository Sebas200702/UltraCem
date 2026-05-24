"use client";

import { UltraCemLogo } from "@/components/brand";

export function TypingIndicator({ label = 'Escribiendo...' }: { label?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ultracem-blue shadow-sm">
        <UltraCemLogo variant="light" className="h-7 w-auto" />
      </div>

      <div className="relative max-w-[80%] rounded-2xl rounded-bl-sm border border-ultracem-gray-100 bg-ultracem-surface px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 items-end gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-ultracem-blue"
                style={{
                  animation: `pulse-mechanical 1.4s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
          <span className="text-caption uppercase tracking-wider text-ultracem-gray-600">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
