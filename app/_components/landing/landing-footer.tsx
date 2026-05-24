const footerLinks = [
  { label: "ultracem.co", href: "https://ultracem.co/" },
  { label: "Productos", href: "https://ultracem.co/productos/" },
  { label: "B2B", href: "https://b2b.ultracem.co/landing" },
  { label: "Tienda hogar", href: "https://b2c.ultracem.co/" },
  {
    label: "WhatsApp",
    href: "https://api.whatsapp.com/send?phone=573164034858",
  },
] as const;

export function LandingFooter() {
  return (
    <footer className="bg-ultracem-blue-dark px-6 py-10">
      <div className="mx-auto flex max-w-uc-container flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-ultracem-yellow text-xs font-bold text-ultracem-blue">
            UC
          </div>
          <span className="text-sm font-semibold text-white/80">UltraCem</span>
        </div>
        <div className="flex flex-wrap justify-center gap-5">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/45 transition-colors hover:text-white/80"
            >
              {link.label}
            </a>
          ))}
        </div>
        <span className="text-xs text-white/30">
          © 2026 UltraCem · Todos los derechos reservados
        </span>
      </div>
    </footer>
  );
}
