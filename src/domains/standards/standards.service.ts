import { PrismaClient } from '@prisma/client';
import type { ColombianRegion } from '../region/region.service';

export interface RetrievedStandard {
  id: string;
  code: string;
  title: string;
  content: string;
  implication: string | null;
  category: string;
  region: string | null;
  structureType: string | null;
  parameters: Record<string, unknown>;
  source: string;
}

export interface AppliedStandard {
  code: string;
  title: string;
  implication: string;
  sourceUrl: string;
}

export function getStandardDetailUrl(code: string): string {
  return `/normas/${encodeURIComponent(code)}`;
}

function mapToApplied(standard: RetrievedStandard): AppliedStandard {
  return {
    code: standard.code,
    title: standard.title,
    implication: standard.implication || standard.content,
    sourceUrl: getStandardDetailUrl(standard.code),
  };
}

export class StandardsService {
  constructor(private prisma: PrismaClient) {}

  async retrieveStandards(
    structureType: string | undefined,
    region: ColombianRegion | null,
    userMessage: string
  ): Promise<RetrievedStandard[]> {
    // base filter: AND structureType+region when both are known so we don't
    // pull random standards from other regions or other structures.
    const baseFilter: Record<string, unknown> = {};
    if (structureType) baseFilter.structureType = structureType;
    if (region) baseFilter.region = { in: [region, 'todos'] };

    // category bumps from the user message — these get OR'd with the base filter
    // so a sustainability question still returns sustainability standards.
    const categoryConditions: Array<Record<string, unknown>> = [];
    if (userMessage) {
      const lower = userMessage.toLowerCase();
      const sustainableTerms = ['sostenible', 'co2', 'ambiental', 'verde', 'ecológico', 'ahorro', 'agua', 'energía'];
      const safetyTerms = ['sismo', 'sísmico', 'resistencia', 'psi', 'seguridad'];

      if (sustainableTerms.some(t => lower.includes(t))) {
        categoryConditions.push({ category: 'sustainability' });
      }
      if (safetyTerms.some(t => lower.includes(t))) {
        categoryConditions.push({ category: { in: ['concrete', 'structural'] } });
      }
    }

    const where =
      Object.keys(baseFilter).length === 0 && categoryConditions.length === 0
        ? {}
        : categoryConditions.length > 0
          ? { OR: [baseFilter, ...categoryConditions] }
          : baseFilter;

    const exact = await this.prisma.constructionStandard.findMany({
      where,
      orderBy: { priority: 'desc' },
      take: 5,
    });

    if (exact.length >= 3) return exact as unknown as RetrievedStandard[];

    // top-up with generic "todos" standards to always have something useful in the prompt.
    const exactIds = exact.map((s) => s.id);
    const fallback = await this.prisma.constructionStandard.findMany({
      where: { region: 'todos', id: { notIn: exactIds } },
      orderBy: { priority: 'desc' },
      take: 5 - exact.length,
    });

    return [...exact, ...fallback] as unknown as RetrievedStandard[];
  }

  formatForPrompt(standards: RetrievedStandard[]): string {
    if (standards.length === 0) return '';
    return standards
      .map(s => `- **${s.code}** — ${s.title}: ${s.content}`)
      .join('\n');
  }
}

let instance: StandardsService | null = null;
export function getStandardsService(prisma: PrismaClient): StandardsService {
  if (!instance) instance = new StandardsService(prisma);
  return instance;
}
