import type { AdminDashboardStats, StaleProductSummary } from '@/domains/admin/admin.types';

export const STALE_PRICE_DAYS = 30;

interface AdminDashboardDataSource {
  product: {
    count: (args: { where?: Record<string, unknown> }) => Promise<number>;
    findMany: (args: {
      where?: Record<string, unknown>;
      orderBy?: Record<string, 'asc' | 'desc'>;
      take?: number;
      select: {
        id: true;
        sku: true;
        name: true;
        updated_at: true;
        price_per_bag_cop: true;
      };
    }) => Promise<Array<Omit<StaleProductSummary, 'price_per_bag_cop'> & { price_per_bag_cop: unknown }>>;
  };
  calculation: {
    count: () => Promise<number>;
  };
}

export function getStalePriceThreshold(referenceDate = new Date()): Date {
  return new Date(referenceDate.getTime() - STALE_PRICE_DAYS * 24 * 60 * 60 * 1000);
}

export async function getActiveProductsCount(
  dataSource: AdminDashboardDataSource,
): Promise<number> {
  return dataSource.product.count({ where: { is_active: true } });
}

export async function getTotalCalculationsCount(
  dataSource: AdminDashboardDataSource,
): Promise<number> {
  return dataSource.calculation.count();
}

export async function getStaleProductsCount(
  dataSource: AdminDashboardDataSource,
  referenceDate = new Date(),
): Promise<number> {
  return dataSource.product.count({
    where: {
      is_active: true,
      updated_at: { lt: getStalePriceThreshold(referenceDate) },
    },
  });
}

export async function getStaleProducts(
  dataSource: AdminDashboardDataSource,
  referenceDate = new Date(),
): Promise<StaleProductSummary[]> {
  const products = await dataSource.product.findMany({
    where: {
      is_active: true,
      updated_at: { lt: getStalePriceThreshold(referenceDate) },
    },
    orderBy: { updated_at: 'asc' },
    take: 5,
    select: {
      id: true,
      sku: true,
      name: true,
      updated_at: true,
      price_per_bag_cop: true,
    },
  });

  return products.map((product) => ({
    ...product,
    price_per_bag_cop: Number(product.price_per_bag_cop),
  }));
}

export async function getAdminDashboardStats(
  dataSource: AdminDashboardDataSource,
  referenceDate = new Date(),
): Promise<AdminDashboardStats> {
  const [
    activeProductsCount,
    totalCalculationsCount,
    staleProductsCount,
    staleProducts,
  ] = await Promise.all([
    getActiveProductsCount(dataSource),
    getTotalCalculationsCount(dataSource),
    getStaleProductsCount(dataSource, referenceDate),
    getStaleProducts(dataSource, referenceDate),
  ]);

  return {
    activeProductsCount,
    totalCalculationsCount,
    staleProductsCount,
    staleProducts,
  };
}
