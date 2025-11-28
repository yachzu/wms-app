import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@repo/database';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('stats')
  getStats() {
    return this.analyticsService.getStats();
  }

  @Get('movements-trend')
  getMovementTrends() {
    return this.analyticsService.getMovementTrends();
  }

  @Get('stock-by-warehouse')
  getStockByWarehouse() {
    return this.analyticsService.getStockByWarehouse();
  }
}
