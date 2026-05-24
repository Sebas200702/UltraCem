import { NextResponse, type NextRequest } from 'next/server';
import { getAdminDashboardStats } from '@/domains/admin';
import { requireAdmin } from '@/lib/auth-guard';
import { errorMessages } from '@/lib/error-handler';
import { prisma } from '@/lib/prisma';
import { adminRateLimiter, enforceRateLimit } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if ('response' in adminCheck) return adminCheck.response;
  const rateLimitResponse = await enforceRateLimit(request, adminRateLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const stats = await getAdminDashboardStats(prisma);

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        staleProducts: stats.staleProducts.map((product) => ({
          ...product,
          updated_at: product.updated_at.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('Error GET /api/admin/dashboard:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: errorMessages.DATABASE_ERROR,
        },
      },
      { status: 500 },
    );
  }
}
