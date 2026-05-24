import { NextRequest, NextResponse } from 'next/server';
import { productUpdateSchema } from '@/domains/pricing';
import { requireAdmin } from '@/lib/auth-guard';
import { errorMessages } from '@/lib/error-handler';
import { prisma } from '@/lib/prisma';
import { adminRateLimiter, enforceRateLimit } from '@/lib/rate-limiter';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } });

    if (!product) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Producto no encontrado.' } },
        { status: 404 }
      );
    }

    const mapped = {
      ...product,
      price_per_bag_cop: Number(product.price_per_bag_cop),
      co2_per_kg: Number(product.co2_per_kg),
    };

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Error GET /api/products/[id]:', error);
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_ERROR', message: 'Error al obtener producto.' } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin();
  if ('response' in adminCheck) return adminCheck.response;
  const rateLimitResponse = await enforceRateLimit(request, adminRateLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Producto no encontrado.' } },
        { status: 404 }
      );
    }

    const validation = productUpdateSchema.safeParse(await request.json().catch(() => null));
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

    const body = validation.data;
    const updateData: Record<string, unknown> = {};
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.subcategory !== undefined) updateData.subcategory = body.subcategory ?? null;
    if (body.technical_specs !== undefined) updateData.technical_specs = body.technical_specs;
    if (body.price_per_bag_cop !== undefined) updateData.price_per_bag_cop = body.price_per_bag_cop;
    if (body.co2_per_kg !== undefined) updateData.co2_per_kg = body.co2_per_kg;
    if (body.datasheet_url !== undefined) updateData.datasheet_url = body.datasheet_url ?? null;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const priceChanged =
      body.price_per_bag_cop !== undefined &&
      Number(body.price_per_bag_cop) !== Number(existing.price_per_bag_cop);

    if (priceChanged) {
      const [product] = await prisma.$transaction([
        prisma.product.update({
          where: { id: params.id },
          data: updateData,
        }),
        prisma.priceHistory.create({
          data: {
            product_id: params.id,
            old_price: Number(existing.price_per_bag_cop),
            new_price: Number(body.price_per_bag_cop),
            changed_by: body.changed_by ?? null,
          },
        }),
      ]);

      const mapped = {
        ...product,
        price_per_bag_cop: Number(product.price_per_bag_cop),
        co2_per_kg: Number(product.co2_per_kg),
      };

      return NextResponse.json({ success: true, data: mapped });
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
    });

    const mapped = {
      ...product,
      price_per_bag_cop: Number(product.price_per_bag_cop),
      co2_per_kg: Number(product.co2_per_kg),
    };

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Error PUT /api/products/[id]:', error);
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_ERROR', message: errorMessages.DATABASE_ERROR } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin();
  if ('response' in adminCheck) return adminCheck.response;
  const rateLimitResponse = await enforceRateLimit(request, adminRateLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Producto no encontrado.' } },
        { status: 404 }
      );
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: { is_active: false },
    });

    const mapped = {
      ...product,
      price_per_bag_cop: Number(product.price_per_bag_cop),
      co2_per_kg: Number(product.co2_per_kg),
    };

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Error DELETE /api/products/[id]:', error);
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_ERROR', message: errorMessages.DATABASE_ERROR } },
      { status: 500 }
    );
  }
}
