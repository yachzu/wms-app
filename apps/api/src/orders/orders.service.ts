import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { MovementType } from '../inventory/dto/inventory.dto';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderStatus,
} from './dto/order.dto';

/**
 * ORDERS SERVICE
 * Service untuk mengelola orders (purchase/sales)
 *
 * Fitur utama:
 * - Membuat order dengan validasi products
 * - Update status order
 * - Auto stock deduction saat order COMPLETED
 * - Support FIFO strategy untuk stock picking
 */
@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  /**
   * Buat order baru
   *
   * Optimizations:
   * - Validasi semua products dalam 1 query (gunakan IN clause)
   * - Generate order number yang unik
   *
   * @param dto - Data order
   * @param userId - ID user yang membuat order
   * @returns Order yang telah dibuat
   * @throws NotFoundException - Jika product tidak ditemukan
   */
  async create(dto: CreateOrderDto, userId: string) {
    try {
      // OPTIMIZATION: Validasi semua products sekaligus (1 query instead of N)
      const productIds = dto.items.map((item) => item.productId);
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true },
      });

      // Check jika ada product yang tidak ditemukan
      if (products.length !== productIds.length) {
        const foundIds = products.map((p: any) => p.id);
        const missingIds = productIds.filter((id) => !foundIds.includes(id));
        throw new NotFoundException(
          `Products not found: ${missingIds.join(', ')}`,
        );
      }

      // Convert expectedDate string ke ISO DateTime jika ada
      const expectedDate = dto.expectedDate
        ? new Date(dto.expectedDate).toISOString()
        : undefined;

      return await this.prisma.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`, // Generate unique order number
          type: dto.type as any,
          partnerName: dto.partnerName,
          expectedDate: expectedDate,
          status: OrderStatus.PENDING as any,
          userId: userId,
          items: {
            create: dto.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Ambil semua orders
   *
   * TODO: Tambahkan pagination untuk production
   * Saat ini return all orders, bisa lambat jika data banyak
   *
   * @returns Array of orders sorted by newest
   */
  async findAll() {
    return this.prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      // TODO: Add pagination
      // take: 50,
      // skip: page * 50,
    });
  }

  /**
   * Ambil 1 order by ID
   *
   * @param id - Order ID
   * @returns Order detail
   * @throws NotFoundException - Jika order tidak ditemukan
   */
  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order dengan ID ${id} tidak ditemukan`);
    }

    return order;
  }

  /**
   * Update status order
   *
   * Proses:
   * 1. Validasi order exists
   * 2. Cek apakah order sudah COMPLETED/CANCELLED (tidak bisa diubah)
   * 3. Update status
   * 4. Jika status COMPLETED, trigger processOrderCompletion
   *
   * @param id - Order ID
   * @param dto - New status
   * @param userId - User ID yang melakukan update
   * @returns Updated order
   * @throws BadRequestException - Jika order sudah completed/cancelled
   */
  async updateStatus(id: string, dto: UpdateOrderStatusDto, userId: string) {
    const order = await this.findOne(id);

    // Prevent update jika order sudah completed/cancelled
    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      throw new BadRequestException(
        `Tidak bisa update status order yang sudah ${order.status}`,
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status as any },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Proses inventory saat order completed
    if (dto.status === 'COMPLETED') {
      await this.processOrderCompletion(updatedOrder, userId);
    }

    return updatedOrder;
  }

  /**
   * Proses order completion dengan create stock movements
   *
   * Logic:
   * - OUT order: Deduct stock dari inventory (FIFO)
   * - IN order: Tambah stock ke first available location
   *
   * @param order - Order yang completed
   * @param userId - User ID yang complete order
   */
  private async processOrderCompletion(order: any, userId: string) {
    try {
      console.log('Processing order completion:', {
        orderId: order.id,
        type: order.type,
        itemsCount: order.items?.length,
      });

      if (order.type === 'OUT') {
        // Deduct stock untuk outbound orders (FIFO)
        for (const item of order.items) {
          console.log('Deducting stock for item:', {
            productId: item.productId,
            quantity: item.quantity,
          });

          await this.deductStock(
            item.productId,
            item.quantity,
            userId,
            order.id,
          );
        }
      } else if (order.type === 'IN') {
        // Untuk inbound orders, tambah stock ke first available location
        const firstLocation = await this.prisma.location.findFirst();

        if (!firstLocation) {
          throw new BadRequestException(
            'Tidak ada lokasi tersedia untuk menerima stock',
          );
        }

        for (const item of order.items) {
          await this.inventoryService.createMovement({
            type: MovementType.IN,
            productId: item.productId,
            toLocationId: firstLocation.id,
            quantity: item.quantity,
            referenceId: `ORDER-${order.id}`,
            createdById: userId,
          });
        }
      } else {
        console.warn('Order type tidak dihandle:', order.type);
      }

      console.log('Order completion processed successfully');
    } catch (error) {
      console.error('Error processing order completion:', error);
      throw error;
    }
  }

  /**
   * Deduct stock dari inventory menggunakan FIFO strategy
   *
   * FIFO (First In First Out):
   * - Ambil stock dari inventory item yang paling lama dibuat
   * - Jika 1 inventory item tidak cukup, ambil dari beberapa locations
   *
   * @param productId - Product ID
   * @param quantity - Jumlah yang perlu di-deduct
   * @param userId - User ID
   * @param orderId - Order ID (untuk reference)
   * @throws BadRequestException - Jika stock tidak mencukupi
   */
  private async deductStock(
    productId: string,
    quantity: number,
    userId: string,
    orderId: string,
  ) {
    // Cari inventory items untuk product ini (FIFO - oldest first)
    const inventoryItems = await this.prisma.inventoryItem.findMany({
      where: { productId },
      orderBy: { id: 'asc' }, // FIFO berdasarkan creation order
    });

    let remaining = quantity;

    // Loop dan ambil stock dari setiap inventory item
    for (const inv of inventoryItems) {
      if (remaining <= 0) break;

      // Ambil minimum antara available stock dan remaining needed
      const take = Math.min(inv.quantity, remaining);

      // Create OUT movement
      await this.inventoryService.createMovement({
        type: MovementType.OUT,
        productId,
        fromLocationId: inv.locationId,
        quantity: take,
        referenceId: `ORDER-${orderId}`,
        createdById: userId,
      });

      remaining -= take;
    }

    // Jika masih ada sisa yang belum bisa di-deduct, throw error
    if (remaining > 0) {
      throw new BadRequestException(
        `Stok tidak mencukupi untuk product. Kurang ${remaining} unit.`,
      );
    }
  }
}
