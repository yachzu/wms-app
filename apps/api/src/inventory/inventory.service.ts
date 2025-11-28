import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockMovementDto, MovementType } from './dto/inventory.dto';

/**
 * INVENTORY SERVICE
 * Service untuk mengelola pergerakan stok dan saldo inventory
 *
 * Fitur utama:
 * - Membuat pergerakan stok (IN/OUT/TRANSFER/ADJUSTMENT)
 * - Update saldo inventory secara otomatis
 * - Menggunakan transaction untuk memastikan atomicity
 * - Mencegah stok negatif dengan validation
 */
@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Membuat pergerakan stok dan update saldo inventory
   *
   * Proses:
   * 1. Validasi requirement berdasarkan jenis movement
   * 2. Gunakan database transaction untuk atomicity
   * 3. Update saldo inventory terlebih dahulu
   * 4. Jika update berhasil, baru create record movement
   * 5. Jika gagal (misal stok kurang), rollback otomatis
   *
   * @param dto - Data pergerakan stok
   * @returns Movement record yang telah dibuat
   * @throws BadRequestException - Jika validasi gagal atau stok tidak cukup
   */
  async createMovement(dto: CreateStockMovementDto) {
    // Validasi requirement movement berdasarkan type
    this.validateMovement(dto);

    // Gunakan transaction untuk memastikan atomicity
    // Jika salah satu operasi gagal, semua akan di-rollback
    return await this.prisma.$transaction(async (prisma: any) => {
      // Pertama, update inventory (akan throw error jika stok tidak cukup)
      await this.updateInventoryBalancesInTransaction(dto, prisma);

      // Hanya create movement record jika inventory update berhasil
      const movement = await prisma.stockMovement.create({
        data: {
          type: dto.type,
          productId: dto.productId,
          fromLocationId: dto.fromLocationId,
          toLocationId: dto.toLocationId,
          quantity: dto.quantity,
          referenceId: dto.referenceId,
          createdById: dto.createdById!,
        },
        include: {
          product: true,
          fromLocation: true,
          toLocation: true,
          createdBy: true,
        },
      });

      return movement;
    });
  }

  /**
   * Validasi movement berdasarkan type
   *
   * Rules:
   * - IN: Harus ada toLocationId (lokasi tujuan)
   * - OUT: Harus ada fromLocationId (lokasi asal)
   * - TRANSFER: Harus ada fromLocationId DAN toLocationId
   * - ADJUSTMENT: Harus ada toLocationId
   *
   * @param dto - Data movement yang akan divalidasi
   * @throws BadRequestException - Jika validasi gagal
   */
  private validateMovement(dto: CreateStockMovementDto) {
    switch (dto.type) {
      case MovementType.IN:
        if (!dto.toLocationId) {
          throw new BadRequestException(
            'Movement IN memerlukan lokasi tujuan (toLocationId)',
          );
        }
        break;
      case MovementType.OUT:
        if (!dto.fromLocationId) {
          throw new BadRequestException(
            'Movement OUT memerlukan lokasi asal (fromLocationId)',
          );
        }
        break;
      case MovementType.TRANSFER:
        if (!dto.fromLocationId || !dto.toLocationId) {
          throw new BadRequestException(
            'Movement TRANSFER memerlukan lokasi asal dan tujuan',
          );
        }
        break;
      case MovementType.ADJUSTMENT:
        if (!dto.toLocationId) {
          throw new BadRequestException(
            'Movement ADJUSTMENT memerlukan lokasi tujuan',
          );
        }
        break;
    }
  }

  /**
   * Update saldo inventory item (wrapper)
   */
  private async updateInventoryBalances(dto: CreateStockMovementDto) {
    return this.updateInventoryBalancesInTransaction(dto, this.prisma);
  }

  /**
   * Update saldo inventory dalam transaction
   *
   * Logic:
   * - OUT/TRANSFER: Kurangi stok dari lokasi asal
   * - IN/TRANSFER/ADJUSTMENT: Tambah stok ke lokasi tujuan
   *
   * @param dto - Data movement
   * @param prisma - Prisma client (bisa transaction client)
   */
  private async updateInventoryBalancesInTransaction(
    dto: CreateStockMovementDto,
    prisma: any,
  ) {
    const { type, productId, fromLocationId, toLocationId, quantity } = dto;

    // Handle OUT atau TRANSFER (kurangi stok dari lokasi asal)
    if (
      fromLocationId &&
      (type === MovementType.OUT || type === MovementType.TRANSFER)
    ) {
      await this.decreaseInventoryInTransaction(
        productId,
        fromLocationId,
        quantity,
        prisma,
      );
    }

    // Handle IN, TRANSFER, atau ADJUSTMENT (tambah stok ke lokasi tujuan)
    if (
      toLocationId &&
      (type === MovementType.IN ||
        type === MovementType.TRANSFER ||
        type === MovementType.ADJUSTMENT)
    ) {
      await this.increaseInventoryInTransaction(
        productId,
        toLocationId,
        quantity,
        prisma,
      );
    }
  }

  /**
   * Kurangi inventory di lokasi tertentu (wrapper)
   */
  private async decreaseInventory(
    productId: string,
    locationId: string,
    quantity: number,
  ) {
    return this.decreaseInventoryInTransaction(
      productId,
      locationId,
      quantity,
      this.prisma,
    );
  }

  /**
   * Kurangi inventory dalam transaction
   *
   * Proses:
   * 1. Cek apakah inventory item ada di lokasi tersebut
   * 2. Cek apakah stok mencukupi
   * 3. Kurangi quantity
   * 4. Jika quantity jadi 0, hapus inventory item
   * 5. Jika > 0, update quantity
   *
   * @throws NotFoundException - Jika inventory item tidak ditemukan
   * @throws BadRequestException - Jika stok tidak mencukupi
   */
  private async decreaseInventoryInTransaction(
    productId: string,
    locationId: string,
    quantity: number,
    prisma: any,
  ) {
    // Cari inventory item di lokasi tersebut
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        productId,
        locationId,
      },
    });

    // Validasi: inventory harus ada
    if (!inventoryItem) {
      throw new NotFoundException(
        'Inventory item tidak ditemukan di lokasi ini',
      );
    }

    // Validasi: stok harus mencukupi
    if (inventoryItem.quantity < quantity) {
      throw new BadRequestException(
        `Stok tidak mencukupi di lokasi ini. Tersedia: ${inventoryItem.quantity}, Dibutuhkan: ${quantity}`,
      );
    }

    const newQuantity = inventoryItem.quantity - quantity;

    if (newQuantity === 0) {
      // Hapus inventory item jika quantity menjadi 0
      await prisma.inventoryItem.delete({
        where: { id: inventoryItem.id },
      });
    } else {
      // Update quantity jika masih ada sisa
      await prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: { quantity: newQuantity },
      });
    }
  }

  /**
   * Tambah inventory di lokasi tertentu (wrapper)
   */
  private async increaseInventory(
    productId: string,
    locationId: string,
    quantity: number,
  ) {
    return this.increaseInventoryInTransaction(
      productId,
      locationId,
      quantity,
      this.prisma,
    );
  }

  /**
   * Tambah inventory dalam transaction
   *
   * Proses:
   * 1. Cek apakah inventory item sudah ada
   * 2. Jika ada, tambahkan quantity ke existing item
   * 3. Jika belum ada, buat inventory item baru
   *
   * Note: Saat ini belum handle batch number
   */
  private async increaseInventoryInTransaction(
    productId: string,
    locationId: string,
    quantity: number,
    prisma: any,
  ) {
    // Cari inventory item yang sudah ada (tanpa batch number)
    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        productId,
        locationId,
        batchNo: null, // Untuk saat ini, belum handle batches
      },
    });

    if (existingItem) {
      // Update inventory yang sudah ada
      await prisma.inventoryItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Buat inventory item baru
      await prisma.inventoryItem.create({
        data: {
          productId,
          locationId,
          quantity,
        },
      });
    }
  }

  /**
   * Ambil saldo inventory berdasarkan product dan/atau lokasi
   *
   * @param productId - Optional: Filter by product ID
   * @param locationId - Optional: Filter by location ID
   * @returns Array of inventory items dengan relasi lengkap
   */
  async getInventoryBalance(productId?: string, locationId?: string) {
    return this.prisma.inventoryItem.findMany({
      where: {
        productId,
        locationId,
      },
      include: {
        product: true,
        location: {
          include: {
            zone: {
              include: {
                warehouse: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Ambil daftar pergerakan stok (audit log)
   *
   * @param productId - Optional: Filter by product ID
   * @param locationId - Optional: Filter by location ID (from OR to)
   * @returns Array of stock movements dengan relasi lengkap, sorted by newest
   */
  async getMovements(productId?: string, locationId?: string) {
    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    // Jika ada locationId, cari movement yang FROM atau TO lokasi tersebut
    if (locationId) {
      where.OR = [{ fromLocationId: locationId }, { toLocationId: locationId }];
    }

    return this.prisma.stockMovement.findMany({
      where,
      include: {
        product: true,
        fromLocation: true,
        toLocation: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Urutkan dari yang terbaru
      },
    });
  }
}
