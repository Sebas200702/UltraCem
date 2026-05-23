import Link from "next/link";

const tools = [
  {
    tag: "Cálculo manual",
    title: "Calculadora de materiales",
    description:
      "Ajusta dimensiones con sliders y obtén dosificación detallada para cualquier tipo de estructura.",
    href: "#calculadora",
    cta: "Ir a la calculadora",
    external: false,
  },
  {
    tag: "Gestión de obras",
    title: "Seguimiento de proyectos",
    description:
      "Crea proyectos, registra avances con bitácora y genera tu certificado de sostenibilidad.",
    href: "#proyectos",
    cta: "Ver mis obras",
    external: false,
  },
  {
    tag: "Sostenibilidad",
    title: "Panel de impacto",
    description:
      "Métricas agregadas de todas tus obras: CO₂ evitado, material ahorrado y presupuesto optimizado.",
    href: "#impacto",
    cta: "Ver impacto",
    external: false,
  },
  {
    tag: "Comercial",
    title: "Cotiza con UltraCem",
    description:
      "¿Listo para comprar? Cotiza directamente con nuestros asesores comerciales por región.",
    href: "https://ultracem.co/cotizar-ultracem/",
    cta: "Cotizar ahora",
    external: true,
  },
] as const;

function ToolCard({
  tag,
  title,
  description,
  href,
  cta,
  external,
}: (typeof tools)[number]) {
  const className =
    "group flex flex-col gap-3 rounded-uc-card border-[1.5px] border-ultracem-border bg-ultracem-surface p-6 transition-all hover:-translate-y-0.5 hover:border-ultracem-blue hover:shadow-[0_8px_32px_rgba(0,62,120,0.1)]";

  const content = (
    <>
      <p className="text-[11px] font-bold uppercase tracking-widest text-ultracem-gray-600">
        {tag}
      </p>
      <h3 className="text-[17px] font-bold text-ultracem-gray-900">{title}</h3>
      <p className="flex-1 text-[13px] leading-relaxed text-ultracem-gray-600">
        {description}
      </p>
      <span className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-ultracem-blue">
        {cta}
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-ultracem-blue/[0.08] transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export function ToolsSection() {
  return (
    <section className="px-6 py-20" id="herramientas">
      <div className="mx-auto max-w-uc-container">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-ultracem-blue/[0.07] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-ultracem-blue">
          <span className="h-1.5 w-1.5 rounded-full bg-ultracem-blue" />
          Más herramientas
        </div>
        <h2 className="mb-3 text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-ultracem-gray-900">
          Explora el resto de{" "}
          <span className="text-ultracem-blue">la plataforma</span>
        </h2>
        <p className="mb-12 max-w-[560px] text-[15px] leading-relaxed text-ultracem-gray-600">
          Herramientas complementarias para planificar, ejecutar y medir el
          impacto de tus obras con UltraCem.
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => (
            <ToolCard key={tool.title} {...tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
