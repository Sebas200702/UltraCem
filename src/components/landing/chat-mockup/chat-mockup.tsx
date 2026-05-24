import { Send } from "lucide-react";
import { chatMockupChips } from '@/components/landing/chat-mockup/chat-mockup-data';

export function ChatMockup() {
  return (
    <div className="overflow-hidden rounded-uc-card bg-ultracem-surface shadow-uc-card">
      <div className="flex items-center gap-3 bg-ultracem-blue px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ultracem-yellow text-sm font-bold text-ultracem-blue">
          V
        </div>
        <div className="flex-1">
          <p className="text-body-sm font-semibold text-white">
            Vanesa · UltraCem
          </p>
          <p className="flex items-center gap-2 text-caption text-white/70 before:h-1.5 before:w-1.5 before:rounded-full before:bg-ultracem-green before:content-['']">
            En linea ahora
          </p>
        </div>
      </div>

      <div className="flex min-h-[260px] flex-col gap-3 bg-ultracem-gray-100 p-4">
        <div className="bubble-assistant max-w-[82%] self-start shadow-sm">
          Hola, soy Vanesa. Cuentame que vas a construir y te calculo los
          materiales al instante.
        </div>
        <div className="flex flex-wrap gap-2 self-start">
          {chatMockupChips.map((chip) => (
            <span
              key={chip}
              className="cursor-default whitespace-nowrap rounded-full border border-ultracem-border bg-ultracem-surface px-3 py-1.5 text-caption font-medium text-ultracem-blue"
            >
              {chip}
            </span>
          ))}
        </div>
        <div className="bubble-user max-w-[82%] self-end">
          Voy a hacer una placa de 5x4 metros de 12 cm
        </div>
        <div className="max-w-[82%] self-start rounded-2xl rounded-bl-sm bg-ultracem-surface px-4 py-3 shadow-sm">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-ultracem-blue"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-ultracem-border bg-ultracem-surface px-4 py-3">
        <input
          type="text"
          readOnly
          placeholder="Describe tu obra..."
          aria-label="Describe tu obra"
          className="min-h-0 flex-1 rounded-uc-input border border-ultracem-border px-4 py-2 text-body-sm text-ultracem-gray-900 outline-none"
        />
        <button
          type="button"
          aria-label="Enviar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-uc-button bg-ultracem-blue text-white transition-colors hover:bg-ultracem-blue-dark"
        >
          <Send className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
