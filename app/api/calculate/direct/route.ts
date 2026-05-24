import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { MaterialCalculator } from '@/domains/calculation/calculator.service';
import { recommend } from '@/domains/recommendation/product-matcher.service';
import type { Product, ProductCategory, TechnicalSpecs } from '@/types/database.types';

const directCalculateSchema = z.object({
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
  const parsedBody = directCalculateSchema.safeParse(
    await request.json().catch(() => null)
  );

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

  const { structureType, dimensions, resistancePsi } = parsedBody.data;

  try {
    const calculator = new MaterialCalculator();
    const result = calculator.calculate({
      structureType,
      dimensions,
      resistancePsi: resistancePsi ?? 3000,
    });

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
      { structureType, materials: result.materials, resistancePsi: resistancePsi ?? 3000 },
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
        { status: 404 }
      );
    }

    const data = {
      volume_m3: Number(result.volume_m3),
      materials: result.materials,
      product: {
        id: recommendation.product.id,
        name: recommendation.product.name,
        sku: recommendation.product.sku,
        price_per_bag_cop: recommendation.product.price_per_bag_cop,
        datasheet_url: recommendation.product.datasheet_url,
      },
      quantity_bags: recommendation.quantity_bags,
      estimated_cost_cop: recommendation.estimated_cost_cop,
      savings_cop: recommendation.savings_cop,
      co2_saved_kg: recommendation.co2_saved_kg,
      justification: recommendation.justification,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error en /api/calculate/direct:', error);

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
