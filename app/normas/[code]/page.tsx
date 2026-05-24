import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, FileText, ShieldCheck } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const CATEGORY_LABELS: Record<string, string> = {
  concrete: 'Concreto',
  structural: 'Estructural',
  sustainability: 'Sostenibilidad',
  fire: 'Seguridad contra incendio',
  masonry: 'Mampostería',
};

const STRUCTURE_LABELS: Record<string, string> = {
  slab: 'Losa',
  wall: 'Muro',
  column: 'Columna',
  plaster: 'Revoque',
  todos: 'Todas las estructuras',
};

const REGION_LABELS: Record<string, string> = {
  andina: 'Andina',
  caribe: 'Caribe',
  pacifica: 'Pacífica',
  todos: 'Todas las regiones',
};

function labelFromMap(labels: Record<string, string>, value: string | null) {
  if (!value) return 'General';
  return labels[value] ?? value;
}

export default async function StandardDetailPage({
  params,
}: {
  readonly params: { readonly code: string };
}) {
  const code = decodeURIComponent(params.code);
  const standard = await prisma.constructionStandard.findUnique({
    where: { code },
  });

  if (!standard) notFound();

  return (
    <main className="min-h-screen bg-ultracem-surface-off py-10">
      <div className="container-uc max-w-4xl">
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 text-body-sm font-semibold text-ultracem-blue transition-colors hover:text-ultracem-blue-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al chat
        </Link>

        <section className="mt-6 overflow-hidden rounded-uc-card border border-ultracem-blue/15 bg-ultracem-surface shadow-uc-card">
          <div className="border-b border-ultracem-gray-100 bg-ultracem-blue/5 px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-caption font-bold uppercase tracking-widest text-ultracem-gray-600">
                  Ficha normativa
                </p>
                <h1 className="mt-2 text-h1 text-ultracem-blue">{standard.code}</h1>
                <p className="mt-2 text-body font-semibold text-ultracem-gray-800">
                  {standard.title}
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ultracem-green/10 text-ultracem-green">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="grid gap-5 px-6 py-6">
            <div className="rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface p-4">
              <div className="mb-2 flex items-center gap-2 text-body-sm font-bold uppercase tracking-wider text-ultracem-gray-600">
                <FileText className="h-4 w-4 text-ultracem-blue" />
                Contenido usado en el cálculo
              </div>
              <p className="text-body leading-relaxed text-ultracem-gray-800">
                {standard.content}
              </p>
            </div>

            {standard.implication && (
              <div className="rounded-uc-card border border-ultracem-blue/10 bg-ultracem-blue/5 p-4">
                <p className="mb-2 text-body-sm font-bold uppercase tracking-wider text-ultracem-gray-600">
                  Implicación práctica
                </p>
                <p className="text-body leading-relaxed text-ultracem-gray-800">
                  {standard.implication}
                </p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface p-4">
                <p className="text-caption font-bold uppercase tracking-wider text-ultracem-gray-600">
                  Categoría
                </p>
                <p className="mt-1 text-body-sm font-semibold text-ultracem-gray-800">
                  {labelFromMap(CATEGORY_LABELS, standard.category)}
                </p>
              </div>
              <div className="rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface p-4">
                <p className="text-caption font-bold uppercase tracking-wider text-ultracem-gray-600">
                  Estructura
                </p>
                <p className="mt-1 text-body-sm font-semibold text-ultracem-gray-800">
                  {labelFromMap(STRUCTURE_LABELS, standard.structureType)}
                </p>
              </div>
              <div className="rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface p-4">
                <p className="text-caption font-bold uppercase tracking-wider text-ultracem-gray-600">
                  Región
                </p>
                <p className="mt-1 text-body-sm font-semibold text-ultracem-gray-800">
                  {labelFromMap(REGION_LABELS, standard.region)}
                </p>
              </div>
            </div>

            {standard.tags.length > 0 && (
              <div>
                <p className="mb-2 text-caption font-bold uppercase tracking-wider text-ultracem-gray-600">
                  Etiquetas
                </p>
                <div className="flex flex-wrap gap-2">
                  {standard.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full bg-ultracem-gray-100 px-3 py-1 text-caption font-semibold text-ultracem-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface p-4">
              <p className="mb-2 text-caption font-bold uppercase tracking-wider text-ultracem-gray-600">
                Fuente oficial
              </p>
              <a
                href={standard.source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-body-sm font-semibold text-ultracem-blue transition-colors hover:text-ultracem-blue-dark hover:underline"
              >
                Consultar entidad emisora
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
