import { Card, Eyebrow, Section } from "@/components/ui";
import { tools } from '@/components/landing/tools-section/tools-section-data';
import { type Tool } from '@/components/landing/tools-section/tools-section-types';

function ToolCard({ tag, title, description, href, cta, external }: Tool) {
  const content = (
    <Card className="group flex h-full flex-col gap-3 transition-colors hover:border-ultracem-blue">
      <p className="text-caption font-semibold uppercase tracking-wider text-ultracem-gray-600">
        {tag}
      </p>
      <h3 className="text-h3 text-ultracem-gray-900">{title}</h3>
      <p className="flex-1 text-body-sm text-ultracem-gray-600">
        {description}
      </p>
      <span className="mt-1 flex items-center gap-2 text-body-sm font-semibold text-ultracem-blue">
        {cta}
        <span aria-hidden>→</span>
      </span>
    </Card>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <a href={href}>{content}</a>;
}

export function ToolsSection() {
  return (
    <Section
      tone="light"
      id="herramientas"
      className="bg-ultracem-surface-muted"
    >
      <Eyebrow className="mb-4">Mas herramientas</Eyebrow>
      <h2 className="mb-3 max-w-[620px] text-h1 text-ultracem-gray-900 md:text-display">
        Explora el resto de la plataforma
      </h2>
      <p className="mb-12 max-w-[560px] text-body text-ultracem-gray-600">
        Herramientas complementarias para planificar, ejecutar y medir el
        impacto de tus obras con UltraCem.
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool) => (
          <ToolCard key={tool.title} {...tool} />
        ))}
      </div>
    </Section>
  );
}
