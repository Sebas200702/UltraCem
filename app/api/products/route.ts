import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateProductInput } from '@/domains/pricing';

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
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_BODY', message: 'Cuerpo de solicitud inválido.' } },
        { status: 400 }
      );
    }

    const validation = validateProductInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: validation.errors.join('. ') } },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        sku: validation.data!.sku,
        name: validation.data!.name,
        category: validation.data!.category,
        subcategory: validation.data!.subcategory ?? null,
        technical_specs: JSON.parse(JSON.stringify(validation.data!.technical_specs)),
        price_per_bag_cop: validation.data!.price_per_bag_cop,
        co2_per_kg: validation.data!.co2_per_kg,
        datasheet_url: validation.data!.datasheet_url ?? null,
        is_active: validation.data!.is_active ?? true,
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
      { success: false, error: { code: 'DATABASE_ERROR', message: 'Error al crear producto.' } },
      { status: 500 }
    );
  }
}
