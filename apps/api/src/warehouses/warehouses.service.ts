import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  CreateZoneDto,
  CreateLocationDto,
} from './dto/warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(private prisma: PrismaService) {}

  // Warehouse CRUD
  async createWarehouse(dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({ data: dto });
  }

  async findAllWarehouses() {
    return this.prisma.warehouse.findMany({
      include: {
        zones: {
          include: {
            locations: true,
          },
        },
      },
    });
  }

  async findOneWarehouse(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        zones: {
          include: {
            locations: true,
          },
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    return warehouse;
  }

  async updateWarehouse(id: string, dto: UpdateWarehouseDto) {
    await this.findOneWarehouse(id);
    return this.prisma.warehouse.update({
      where: { id },
      data: dto,
    });
  }

  async removeWarehouse(id: string) {
    await this.findOneWarehouse(id);

    // Manual cascading delete in transaction
    return this.prisma.$transaction(async (tx: any) => {
      // 1. Find all zones in this warehouse
      const zones = await tx.zone.findMany({
        where: { warehouseId: id },
        select: { id: true },
      });
      const zoneIds = zones.map((z: any) => z.id);

      // 2. Delete all locations in these zones
      if (zoneIds.length > 0) {
        await tx.location.deleteMany({
          where: { zoneId: { in: zoneIds } },
        });
      }

      // 3. Delete all zones
      await tx.zone.deleteMany({
        where: { warehouseId: id },
      });

      // 4. Delete the warehouse
      return tx.warehouse.delete({ where: { id } });
    });
  }

  // Zone CRUD
  async createZone(dto: CreateZoneDto) {
    return this.prisma.zone.create({ data: dto });
  }

  async findAllZones(warehouseId?: string) {
    return this.prisma.zone.findMany({
      where: warehouseId ? { warehouseId } : undefined,
      include: {
        warehouse: true,
        locations: true,
      },
    });
  }

  async updateZone(id: string, dto: { name: string }) {
    return this.prisma.zone.update({
      where: { id },
      data: dto,
    });
  }

  async removeZone(id: string) {
    // Check if zone has locations
    const zone = await this.prisma.zone.findUnique({
      where: { id },
      include: { locations: true },
    });

    if (!zone) {
      throw new NotFoundException(`Zone with ID ${id} not found`);
    }

    // Manual cascade delete locations
    if (zone.locations.length > 0) {
      await this.prisma.location.deleteMany({
        where: { zoneId: id },
      });
    }

    return this.prisma.zone.delete({
      where: { id },
    });
  }

  // Location CRUD
  async createLocation(dto: CreateLocationDto) {
    // Check if location code already exists
    const existing = await this.prisma.location.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException('Location with this code already exists');
    }

    return this.prisma.location.create({ data: dto });
  }

  async updateLocation(
    id: string,
    dto: { code: string; type: 'PICKING' | 'BULK' | 'RECEIVING' | 'DISPATCH' },
  ) {
    // Check if new code exists (if code is being updated)
    const existing = await this.prisma.location.findFirst({
      where: {
        code: dto.code,
        NOT: { id },
      },
    });

    if (existing) {
      throw new ConflictException('Location with this code already exists');
    }

    return this.prisma.location.update({
      where: { id },
      data: dto,
    });
  }

  async removeLocation(id: string) {
    // Check if location has inventory
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: { inventoryItems: true },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    if (location.inventoryItems.length > 0) {
      throw new ConflictException(
        'Cannot delete location with active inventory',
      );
    }

    return this.prisma.location.delete({
      where: { id },
    });
  }

  async findAllLocations(zoneId?: string) {
    return this.prisma.location.findMany({
      where: zoneId ? { zoneId } : undefined,
      include: {
        zone: {
          include: {
            warehouse: true,
          },
        },
      },
    });
  }

  async findOneLocation(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: {
        zone: {
          include: {
            warehouse: true,
          },
        },
        inventoryItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location;
  }
}
