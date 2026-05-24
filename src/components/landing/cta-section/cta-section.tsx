import { Building2, MessageCircle, ShoppingCart } from "lucide-react";
import { Button, Section } from "@/components/ui";

const CONTACT_LINKS = [
  {
    label: "WhatsApp Vanesa",
    href: "https://api.whatsapp.com/send?phone=573164034858",
    icon: MessageCircle,
  },
  {
    label: "B2B UltraCem",
    href: "https://b2b.ultracem.co/landing",
    icon: Building2,
  },
  {
    label: "Tienda hogar",
    href: "https://b2c.ultracem.co/",
    icon: ShoppingCart,
  },
] as const;

export function CtaSection() {
  return (
    <Section tone="yellow" id="chat" className="text-center">
      <div className="mx-auto max-w-[640px]">
        <h2 className="mb-4 text-h1 text-ultracem-blue md:text-display">
          Listo para calcular tu obra
        </h2>
        <p className="mb-8 text-body text-ultracem-blue/75">
          Abre el chat con Vanesa ahora mismo. En menos de 90 segundos sabrás
          cuánto material necesitas y qué producto UltraCem se ajusta mejor.
        </p>
        <Button href="/chat" variant="primary" className="gap-2">
          <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
          Abrir chat con Vanesa
        </Button>

        <div className="mt-10 border-t border-ultracem-blue/15 pt-6">
          <p className="mb-4 text-caption font-semibold uppercase tracking-wider text-ultracem-blue/70">
            O contacta directamente
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-3">
            {CONTACT_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-uc-button border border-ultracem-blue/25 bg-white/40 px-4 py-2 text-body-sm font-semibold text-ultracem-blue transition-colors hover:border-ultracem-blue hover:bg-white"
                >
                  <link.icon className="h-4 w-4" strokeWidth={2} />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
