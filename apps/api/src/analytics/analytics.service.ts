import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovementType } from '@repo/database';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const products = await this.prisma.product.findMany({
      include: {
        inventoryItems: true,
      },
    });

    let totalValue = 0;
    let lowStockCount = 0;
    let totalStock = 0;

    for (const p of products) {
      const totalQty = p.inventoryItems.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0,
      );
      totalValue += totalQty * p.price;
      totalStock += totalQty;

      if (totalQty <= p.minStock) {
        lowStockCount++;
      }
    }

    return {
      totalProducts: products.length,
      totalStock,
      lowStockCount,
      totalValue,
    };
  }

  async getMovementTrends() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Using raw query for date grouping (PostgreSQL specific)
    const result = await this.prisma.$queryRaw`
      SELECT DATE("createdAt") as date, "type", COUNT(*)::int as count
      FROM "StockMovement"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt"), "type"
      ORDER BY DATE("createdAt") ASC
    `;

    return result;
  }

  async getStockByWarehouse(): Promise<{ name: string; stockCount: number }[]> {
    // Group inventory items by location -> zone -> warehouse
    // This is complex with Prisma groupBy.
    // Let's fetch warehouses with their inventory count.

    const warehouses = await this.prisma.warehouse.findMany({
      include: {
        zones: {
          include: {
            locations: {
              include: {
                inventoryItems: true,
              },
            },
          },
        },
      },
    });

    return warehouses.map((w: any) => {
      let stockCount = 0;
      w.zones.forEach((z: any) => {
        z.locations.forEach((l: any) => {
          l.inventoryItems.forEach((i: any) => {
            stockCount += i.quantity;
          });
        });
      });
      return {
        name: w.name,
        stockCount,
      };
    });
  }
}
