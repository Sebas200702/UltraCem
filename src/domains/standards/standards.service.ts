import { PrismaClient } from '@prisma/client';
import type { ColombianRegion } from '../region/region.service';

export interface RetrievedStandard {
  id: string;
  code: string;
  title: string;
  content: string;
  implication: string | null;
  articleRef: string | null;
  verbatim: boolean;
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
  /** Internal ficha at /normas/[code] */
  sourceUrl: string;
  /** Verified external URL to the issuing institution */
  officialSource: string;
  articleRef: string | null;
  verbatim: boolean;
}

export function getStandardDetailUrl(code: string): string {
  return `/normas/${encodeURIComponent(code)}`;
}

export function mapToApplied(standard: RetrievedStandard): AppliedStandard {
  return {
    code: standard.code,
    title: standard.title,
    implication: standard.implication || standard.content,
    sourceUrl: getStandardDetailUrl(standard.code),
    officialSource: standard.source,
    articleRef: standard.articleRef,
    verbatim: standard.verbatim,
  };
}

export class StandardsService {
  constructor(private prisma: PrismaClient) {}

  async retrieveStandards(
    structureType: string | undefined,
    region: ColombianRegion | null,
    userMessage: string
  ): Promise<RetrievedStandard[]> {
    const baseFilter: Record<string, unknown> = {};
    if (structureType) baseFilter.structureType = structureType;
    if (region) baseFilter.region = { in: [region, 'todos'] };

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

    const exactIds = exact.map((s: { id: string }) => s.id);
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
