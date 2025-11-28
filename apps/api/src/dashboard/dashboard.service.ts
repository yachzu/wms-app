import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * DASHBOARD SERVICE
 * Service untuk mengelola data dashboard dan statistics
 *
 * Optimized untuk performa dengan:
 * - Gunakan aggregation queries
 * - Minimalkan N+1 query problem
 * - Cache-friendly responses
 */
@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Ambil statistik dashboard
   *
   * Optimizations:
   * - Gunakan Promise.all untuk parallel queries
   * - Gunakan raw query untuk low stock count (lebih efficient)
   * - Avoid loading semua products ke memory
   *
   * @returns Dashboard statistics
   */
  async getStats() {
    const [totalProducts, totalWarehouses, totalMovements, lowStockResult] =
      await Promise.all([
        // Count total products
        this.prisma.product.count(),

        // Count total warehouses
        this.prisma.warehouse.count(),

        // Count movements hari ini
        this.prisma.stockMovement.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)), // Hari ini
            },
          },
        }),

        // Hitung low stock menggunakan raw query (LEBIH EFISIEN)
        // Ini jauh lebih cepat daripada load semua products ke memory
        this.prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(DISTINCT p.id)::int as count
          FROM "Product" p
          LEFT JOIN "InventoryItem" ii ON p.id = ii."productId"
          WHERE p."minStock" > 0
          GROUP BY p.id, p."minStock"
          HAVING COALESCE(SUM(ii.quantity), 0) <= p."minStock"
        `,
      ]);

    // Extract count dari raw query result
    const lowStockCount =
      lowStockResult.length > 0 ? Number(lowStockResult[0].count) : 0;

    return {
      totalProducts,
      totalWarehouses,
      totalMovements,
      lowStockItems: lowStockCount,
    };
  }
}
