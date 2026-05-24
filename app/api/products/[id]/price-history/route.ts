import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    const history = await prisma.priceHistory.findMany({
      where: { product_id: params.id },
      orderBy: { created_at: 'desc' },
    });

    const mapped = history.map((h) => ({
      ...h,
      old_price: h.old_price ? Number(h.old_price) : null,
      new_price: Number(h.new_price),
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Error GET /api/products/[id]/price-history:', error);
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_ERROR', message: 'Error al obtener historial de precios.' } },
      { status: 500 }
    );
  }
}
