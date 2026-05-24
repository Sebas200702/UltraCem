import { UltraCemLogo } from "@/components/brand";
import {
  footerGroups,
  footerLegalLinks,
} from "@/components/landing/landing-footer/landing-footer-data";

export function LandingFooter() {
  return (
    <footer className="bg-ultracem-blue-dark text-white">
      <div className="mx-auto grid w-full max-w-uc-container gap-10 px-4 py-12 md:grid-cols-12 md:px-6 md:py-16">
        <div className="md:col-span-4">
          <UltraCemLogo variant="light" className="h-12 w-auto" />
          <p className="mt-5 max-w-[280px] text-body-sm leading-relaxed text-white/65">
            Fabricantes colombianos de cemento, concretos y soluciones para
            obras. Acompañamos tu proyecto desde el cálculo hasta la
            cotización.
          </p>
          <div className="mt-5 h-1 w-20 rounded-full bg-ultracem-yellow" />
        </div>

        <nav
          aria-label="Pie de página"
          className="grid gap-8 sm:grid-cols-3 md:col-span-8"
        >
          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-4 text-caption font-semibold uppercase tracking-wider text-white">
                {group.title}
              </p>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-body-sm text-white/65 transition-colors hover:text-ultracem-yellow"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-uc-container flex-col items-start justify-between gap-3 px-4 py-6 md:flex-row md:items-center md:px-6">
          <p className="text-caption text-white/50">
            © 2026 UltraCem · Todos los derechos reservados
          </p>
          <ul className="flex flex-wrap gap-4">
            {footerLegalLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="text-caption text-white/55 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
