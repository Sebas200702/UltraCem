"use client";

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ultracem-blue">
        <span className="text-body-sm font-bold text-ultracem-yellow">UC</span>
      </div>

      {/* Bubble */}
      <div className="relative max-w-[80%] rounded-2xl rounded-bl-sm border border-ultracem-gray-100 bg-ultracem-surface px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          {/* Mechanical pistons */}
          <div className="flex h-5 items-end gap-1">
            <div
              className="h-2 w-2 rounded-full bg-ultracem-blue"
              style={{
                animation: "pulse-mechanical 1.4s ease-in-out infinite",
              }}
            />
            <div
              className="h-2 w-2 rounded-full bg-ultracem-blue"
              style={{
                animation: "pulse-mechanical 1.4s ease-in-out 0.2s infinite",
              }}
            />
            <div
              className="h-2 w-2 rounded-full bg-ultracem-blue"
              style={{
                animation: "pulse-mechanical 1.4s ease-in-out 0.4s infinite",
              }}
            />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-ultracem-gray-600">
            Calculando...
          </span>
        </div>
      </div>
    </div>
  );
}
