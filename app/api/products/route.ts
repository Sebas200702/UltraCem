import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { productCreateSchema } from '@/domains/pricing';
import { requireAdmin } from '@/lib/auth-guard';
import { errorMessages } from '@/lib/error-handler';
import { adminRateLimiter, enforceRateLimit } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const is_active = searchParams.get('is_active');
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 200);

    const where: Record<string, unknown> = {};
    if (category && ['structural', 'plaster', 'specialty'].includes(category)) {
      where.category = category;
    }
    if (is_active === 'true') where.is_active = true;
    if (is_active === 'false') where.is_active = false;

    const products = await prisma.product.findMany({
      where,
      take: limit,
      orderBy: { name: 'asc' },
    });

    const mapped = products.map((p) => ({
      ...p,
      price_per_bag_cop: Number(p.price_per_bag_cop),
      co2_per_kg: Number(p.co2_per_kg),
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Error GET /api/products:', error);
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_ERROR', message: 'Error al obtener productos.' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if ('response' in adminCheck) return adminCheck.response;
  const rateLimitResponse = await enforceRateLimit(request, adminRateLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json().catch(() => null);
    const validation = productCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.issues.map((issue) => issue.message).join(' '),
            details: validation.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const input = validation.data;

    const product = await prisma.product.create({
      data: {
        sku: input.sku,
        name: input.name,
        category: input.category,
        subcategory: input.subcategory ?? null,
        technical_specs: JSON.parse(JSON.stringify(input.technical_specs)),
        price_per_bag_cop: input.price_per_bag_cop,
        co2_per_kg: input.co2_per_kg,
        datasheet_url: input.datasheet_url ?? null,
        is_active: input.is_active,
      },
    });

    const mapped = {
      ...product,
      price_per_bag_cop: Number(product.price_per_bag_cop),
      co2_per_kg: Number(product.co2_per_kg),
    };

    return NextResponse.json({ success: true, data: mapped }, { status: 201 });
  } catch (error) {
    console.error('Error POST /api/products:', error);
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_ERROR', message: errorMessages.DATABASE_ERROR } },
      { status: 500 }
    );
  }
}
