import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { MaterialCalculator } from '@/domains/calculation/calculator.service';
import { recommend } from '@/domains/recommendation/product-matcher.service';
import { formatCalculationSummary } from '@/domains/conversation/nlp.service';
import { calcRateLimiter, enforceRateLimit } from '@/lib/rate-limiter';
import { getStandardDetailUrl, getStandardsService, type AppliedStandard } from '@/domains/standards/standards.service';
import { getRegionLabel, type ColombianRegion } from '@/domains/region/region.service';
import type { CalculateResponse, Calculation, RecommendationOutput } from '@/types';
import type { Product, ProductCategory, TechnicalSpecs } from '@/types/database.types';

const calculateSchema = z.object({
  conversationId: z.string().uuid('El ID de conversación debe ser un UUID válido.'),
  structureType: z.enum(['slab', 'wall', 'column', 'plaster']),
  dimensions: z.object({
    length_m: z.number().min(0.1).max(50).optional(),
    width_m: z.number().min(0.1).max(50).optional(),
    height_m: z.number().min(0.1).max(50).optional(),
    thickness_m: z.number().min(0.02).max(1).optional(),
    diameter_m: z.number().min(0.1).max(50).optional(),
    area_m2: z.number().min(0.1).max(2500).optional(),
  }),
  resistancePsi: z.number().min(2000).max(5000).optional(),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = await enforceRateLimit(request, calcRateLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  const parsedBody = calculateSchema.safeParse(await request.json().catch(() => null));

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Los datos ingresados no son válidos. Por favor verifica e intenta de nuevo.',
          details: parsedBody.error.issues,
        },
      },
      { status: 400 }
    );
  }

  const { conversationId, structureType, dimensions, resistancePsi } = parsedBody.data;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'La conversación no existe.' } },
        { status: 404 }
      );
    }

    const meta = (conversation.metadata as Record<string, unknown> | null) ?? {};
    const region = (typeof meta.detectedRegion === 'string' ? meta.detectedRegion : null) as ColombianRegion | null;

    // default PSI by structure type so we don't force structural concrete numbers
    // onto mortar / plaster products in the recommender.
    const defaultPsiByType: Record<typeof structureType, number> = {
      slab: 3000,
      column: 3000,
      wall: 2000,
      plaster: 1500,
    };
    const effectivePsi = resistancePsi ?? defaultPsiByType[structureType];

    const calculator = new MaterialCalculator();
    const result = calculator.calculate(
      {
        structureType,
        dimensions,
        resistancePsi: effectivePsi,
      },
      region
    );

    // Retrieve relevant standards for this structure type and region
    const standardsService = getStandardsService(prisma);
    const standards = await standardsService.retrieveStandards(
      structureType,
      region,
      ''
    );
    const standardsApplied: AppliedStandard[] = standards.map((s) => ({
      code: s.code,
      title: s.title,
      implication: s.implication || s.content,
      sourceUrl: getStandardDetailUrl(s.code),
    }));

    const products = await prisma.product.findMany({
      where: { is_active: true },
    });

    const mappedProducts: Product[] = products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category as ProductCategory,
      subcategory: p.subcategory,
      technical_specs: p.technical_specs as TechnicalSpecs,
      price_per_bag_cop: Number(p.price_per_bag_cop),
      co2_per_kg: Number(p.co2_per_kg),
      datasheet_url: p.datasheet_url,
      is_active: p.is_active,
      created_at: p.created_at.toISOString(),
      updated_at: p.updated_at.toISOString(),
    }));

    const recommendation = recommend(
      { structureType, materials: result.materials, resistancePsi: effectivePsi },
      mappedProducts
    );

    if (!recommendation) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CALCULATION_ERROR',
            message: 'No se encontró un producto compatible para esta estructura.',
          },
        },
        { status: 500 }
      );
    }

    const calculation = await prisma.calculation.create({
      data: {
        conversation_id: conversation.id,
        structure_type: structureType,
        dimensions: JSON.parse(JSON.stringify(dimensions)),
        volume_m3: result.volume_m3,
        materials: JSON.parse(JSON.stringify(result.materials)),
        status: 'calculated',
      },
    });

    await prisma.productRecommendation.create({
      data: {
        calculation_id: calculation.id,
        product_id: recommendation.product.id,
        quantity_bags: recommendation.quantity_bags,
        estimated_cost_cop: recommendation.estimated_cost_cop,
        savings_cop: recommendation.savings_cop,
        co2_saved_kg: recommendation.co2_saved_kg,
        justification: JSON.parse(JSON.stringify(recommendation.justification)),
      },
    });

    const calculationLike: Calculation = {
      id: calculation.id,
      conversation_id: conversation.id,
      structure_type: structureType,
      dimensions,
      volume_m3: Number(result.volume_m3.toFixed(3)),
      materials: result.materials,
      status: 'calculated',
      created_at: calculation.created_at.toISOString(),
    };

    const recommendationOutput: RecommendationOutput = {
      product: recommendation.product,
      quantity_bags: recommendation.quantity_bags,
      estimated_cost_cop: recommendation.estimated_cost_cop,
      savings_cop: recommendation.savings_cop,
      co2_saved_kg: recommendation.co2_saved_kg,
      justification: recommendation.justification,
    };

    const regionLabel = getRegionLabel(region);
    const summaryMessage = formatCalculationSummary(
      calculationLike,
      recommendationOutput,
      region,
      standardsApplied,
      result.metadata.formula_used,
      result.metadata.waste_factor
    );

    const data: CalculateResponse = {
      calculation: {
        id: calculation.id,
        volume_m3: Number(result.volume_m3.toFixed(3)),
        materials: result.materials,
      },
      recommendation: recommendationOutput,
      summaryMessage,
      region,
      regionLabel,
      standardsApplied,
      formulaUsed: result.metadata.formula_used,
      wasteFactor: result.metadata.waste_factor,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error en /api/calculate:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CALCULATION_ERROR',
          message: 'Hubo un error calculando los materiales. Verifica las dimensiones.',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
      },
      { status: 500 }
    );
  }
}