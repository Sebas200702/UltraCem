import { Send } from "lucide-react";

const chips = ["Placa de concreto", "Muro en bloque", "Revoque / pañete"];

export function ChatMockup() {
  return (
    <div className="animate-float overflow-hidden rounded-uc-card bg-ultracem-surface shadow-[0_24px_64px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-3 bg-ultracem-blue-dark px-[18px] py-3.5">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-ultracem-yellow text-[13px] font-bold text-ultracem-blue">
          V
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">
            Vanesa · UltraCem
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-white/50 before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-ultracem-green before:content-['']">
            En línea ahora
          </p>
        </div>
      </div>

      <div className="flex min-h-[260px] flex-col gap-2.5 bg-ultracem-gray-100 p-4">
        <div className="bubble-assistant max-w-[82%] self-start shadow-sm">
          ¡Hola🖐️! Soy Vanesa. Cuéntame qué vas a construir y te calculo los
          materiales al instante. 👷
        </div>
        <div className="flex flex-wrap gap-1.5 self-start">
          {chips.map((chip, idx) => (
            <span
              key={chip}
              className={
                idx === 0
                  ? "cursor-default whitespace-nowrap rounded-full border border-ultracem-border bg-ultracem-blue px-3 py-1.5 text-[11px] font-medium text-white"
                  : "cursor-default whitespace-nowrap rounded-full border border-ultracem-border bg-ultracem-surface px-3 py-1.5 text-[11px] font-medium text-ultracem-blue"
              }
            >
              {chip}
            </span>
          ))}
     
        </div>
        <div className="bubble-user max-w-[82%] self-end">
          Quiero hacer una placa de 5×4 metros de 12 cm
        </div>
        <div className="max-w-[82%] self-start rounded-2xl rounded-bl-sm bg-ultracem-surface px-4 py-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-ultracem-gray-600 animate-typing-dot"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-ultracem-border bg-ultracem-surface px-3.5 py-3">
        <input
          type="text"
          readOnly
          placeholder="Describe tu obra…"
          aria-label="Describe tu obra"
          className="min-h-0 flex-1 rounded-xl border border-ultracem-border px-3.5 py-2 text-[13px] text-ultracem-gray-900 outline-none"
        />
        <button
          type="button"
          aria-label="Enviar"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-ultracem-blue text-white transition-colors hover:bg-ultracem-blue-dark"
        >
          <Send className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
