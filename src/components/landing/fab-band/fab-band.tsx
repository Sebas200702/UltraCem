import { cn } from "@/lib/utils";
import { FAB_ACTIONS } from "@/components/landing/fab-band/fab-band-data";
import { type FabAction } from "@/components/landing/fab-band/fab-band-types";

const TONE_CLASSES: Record<FabAction["tone"], string> = {
  primary:
    "bg-ultracem-blue text-white hover:bg-ultracem-blue-dark focus-visible:ring-ultracem-yellow",
  accent:
    "bg-ultracem-yellow text-ultracem-blue hover:bg-ultracem-yellow-hover focus-visible:ring-white",
  whatsapp:
    "bg-ultracem-green text-white hover:bg-ultracem-green-light focus-visible:ring-white",
};

export function FabBand() {
  return (
    <>
      <div
        aria-label="Acciones rapidas"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 md:hidden"
      >
        <div className="pointer-events-auto mx-auto flex max-w-uc-container items-center justify-between gap-2 rounded-uc-button border border-ultracem-blue/15 bg-ultracem-surface/95 p-1.5 shadow-uc-modal backdrop-blur">
          {FAB_ACTIONS.map((action) => (
            <a
              key={action.label}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={action.label}
              className={cn(
                "inline-flex h-11 flex-1 items-center justify-center rounded-uc-button text-button transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                TONE_CLASSES[action.tone],
              )}
            >
              <action.icon className="h-5 w-5" strokeWidth={2} />
              <span className="sr-only">{action.label}</span>
            </a>
          ))}
        </div>
      </div>

      <ul
        aria-label="Acciones rapidas"
        className="fixed bottom-6 right-6 z-40 hidden flex-col items-end gap-3 md:flex"
      >
        {FAB_ACTIONS.map((action) => (
          <li key={action.label}>
            <a
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={action.label}
              className={cn(
                "group inline-flex h-12 w-12 items-center justify-center rounded-full shadow-uc-card transition-all hover:w-auto hover:gap-2 hover:px-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                TONE_CLASSES[action.tone],
              )}
            >
              <action.icon className="h-5 w-5 shrink-0" strokeWidth={2} />
              <span className="hidden whitespace-nowrap text-button font-semibold group-hover:inline">
                {action.label}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
