import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateStockMovementDto } from './dto/inventory.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'))
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('movements')
  createMovement(@Body() dto: CreateStockMovementDto, @Request() req: any) {
    // Inject the user ID from the JWT token
    dto.createdById = req.user.userId;
    return this.inventoryService.createMovement(dto);
  }

  @Get('movements')
  getMovements(
    @Query('productId') productId?: string,
    @Query('locationId') locationId?: string,
  ) {
    return this.inventoryService.getMovements(productId, locationId);
  }

  @Get('balance')
  getInventoryBalance(
    @Query('productId') productId?: string,
    @Query('locationId') locationId?: string,
  ) {
    return this.inventoryService.getInventoryBalance(productId, locationId);
  }
}
