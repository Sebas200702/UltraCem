import Link from "next/link";
import { UltraCemLogo } from "../ultracem-logo";

export function LandingNav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between bg-ultracem-blue px-6">
      <Link href="/" className="flex shrink-0 items-center">
        <UltraCemLogo variant="light" priority className="h-12 w-auto" />
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href="#ejemplos"
          className="hidden rounded-lg px-3 py-1.5 text-[13px] font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white sm:inline-block"
        >
          Cómo funciona
        </Link>
        <Link
          href="#herramientas"
          className="hidden rounded-lg px-3 py-1.5 text-[13px] font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white sm:inline-block"
        >
          Herramientas
        </Link>
        <a
          href="https://ultracem.co/productos/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-lg px-3 py-1.5 text-[13px] font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white md:inline-block"
        >
          Productos
        </a>
        <Link
          href="/chat"
          className="rounded-uc-button bg-ultracem-yellow px-[18px] py-2 text-[13px] font-semibold text-ultracem-blue transition-colors hover:bg-ultracem-yellow-hover"
        >
          Abrir chat →
        </Link>
      </div>
    </nav>
  );
}
