import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  CreateZoneDto,
  CreateLocationDto,
} from './dto/warehouse.dto';
import { AuthGuard } from '@nestjs/passport';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@repo/database';

@Controller('warehouses')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  // Warehouse endpoints
  @Post()
  @Roles(Role.ADMIN)
  createWarehouse(@Body() dto: CreateWarehouseDto) {
    return this.warehousesService.createWarehouse(dto);
  }

  @Get()
  findAllWarehouses() {
    return this.warehousesService.findAllWarehouses();
  }

  @Get(':id')
  findOneWarehouse(@Param('id') id: string) {
    return this.warehousesService.findOneWarehouse(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  updateWarehouse(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    return this.warehousesService.updateWarehouse(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  removeWarehouse(@Param('id') id: string) {
    return this.warehousesService.removeWarehouse(id);
  }

  // Zone endpoints
  @Post('zones')
  @Roles(Role.ADMIN)
  createZone(@Body() dto: CreateZoneDto) {
    return this.warehousesService.createZone(dto);
  }

  @Patch('zones/:id')
  @Roles(Role.ADMIN)
  updateZone(@Param('id') id: string, @Body() dto: { name: string }) {
    return this.warehousesService.updateZone(id, dto);
  }

  @Delete('zones/:id')
  @Roles(Role.ADMIN)
  removeZone(@Param('id') id: string) {
    return this.warehousesService.removeZone(id);
  }

  // Location endpoints
  @Post('locations')
  @Roles(Role.ADMIN)
  createLocation(@Body() dto: CreateLocationDto) {
    return this.warehousesService.createLocation(dto);
  }

  @Get('locations/all')
  findAllLocations(@Query('zoneId') zoneId?: string) {
    return this.warehousesService.findAllLocations(zoneId);
  }

  @Get('locations/:id')
  findOneLocation(@Param('id') id: string) {
    return this.warehousesService.findOneLocation(id);
  }

  @Patch('locations/:id')
  @Roles(Role.ADMIN)
  updateLocation(
    @Param('id') id: string,
    @Body()
    dto: { code: string; type: 'PICKING' | 'BULK' | 'RECEIVING' | 'DISPATCH' },
  ) {
    return this.warehousesService.updateLocation(id, dto);
  }

  @Delete('locations/:id')
  @Roles(Role.ADMIN)
  removeLocation(@Param('id') id: string) {
    return this.warehousesService.removeLocation(id);
  }
}
