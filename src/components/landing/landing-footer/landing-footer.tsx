import { UltraCemLogo } from "@/components/brand";
import { footerLinks } from '@/components/landing/landing-footer/landing-footer-data';

export function LandingFooter() {
  return (
    <footer className="bg-ultracem-blue-dark px-6 py-10">
      <div className="mx-auto flex max-w-uc-container flex-wrap items-center justify-between gap-4">
        <UltraCemLogo variant="light" className="h-12 w-auto" />
        <div className="flex flex-wrap justify-center gap-5">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-caption text-white/50 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>
        <span className="text-caption text-white/40">
          © 2026 UltraCem · Todos los derechos reservados
        </span>
      </div>
    </footer>
  );
}
