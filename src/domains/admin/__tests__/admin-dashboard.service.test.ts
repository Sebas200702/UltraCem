import { describe, expect, it, vi } from 'vitest';
import {
  getActiveProductsCount,
  getAdminDashboardStats,
  getStalePriceThreshold,
  getStaleProducts,
  getStaleProductsCount,
  getTotalCalculationsCount,
} from '../admin-dashboard.service';

const referenceDate = new Date('2026-05-23T12:00:00.000Z');

function createDataSource() {
  return {
    product: {
      count: vi.fn(async (_args: { where?: Record<string, unknown> }) => 3),
      findMany: vi.fn(async (_args: Record<string, unknown>) => [
        {
          id: 'product-1',
          sku: 'UC-EST',
          name: 'UltraCem Estructural',
          updated_at: new Date('2026-04-01T12:00:00.000Z'),
          price_per_bag_cop: { toString: () => '28500' },
        },
      ]),
    },
    calculation: {
      count: vi.fn(async () => 12),
    },
  };
}

describe('admin dashboard service', () => {
  it('calculates the stale price threshold from the reference date', () => {
    expect(getStalePriceThreshold(referenceDate).toISOString()).toBe(
      '2026-04-23T12:00:00.000Z',
    );
  });

  it('delegates count queries with the expected filters', async () => {
    const dataSource = createDataSource();

    await expect(getActiveProductsCount(dataSource)).resolves.toBe(3);
    await expect(getTotalCalculationsCount(dataSource)).resolves.toBe(12);
    await expect(getStaleProductsCount(dataSource, referenceDate)).resolves.toBe(3);

    expect(dataSource.product.count).toHaveBeenCalledWith({
      where: { is_active: true },
    });
    expect(dataSource.product.count).toHaveBeenCalledWith({
      where: {
        is_active: true,
        updated_at: { lt: getStalePriceThreshold(referenceDate) },
      },
    });
  });

  it('normalizes stale product prices to numbers', async () => {
    const dataSource = createDataSource();

    await expect(getStaleProducts(dataSource, referenceDate)).resolves.toEqual([
      {
        id: 'product-1',
        sku: 'UC-EST',
        name: 'UltraCem Estructural',
        updated_at: new Date('2026-04-01T12:00:00.000Z'),
        price_per_bag_cop: 28500,
      },
    ]);
  });

  it('returns a complete dashboard summary', async () => {
    const dataSource = createDataSource();
    const stats = await getAdminDashboardStats(dataSource, referenceDate);

    expect(stats.activeProductsCount).toBe(3);
    expect(stats.totalCalculationsCount).toBe(12);
    expect(stats.staleProductsCount).toBe(3);
    expect(stats.staleProducts).toHaveLength(1);
  });
});
