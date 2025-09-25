import {
  Controller,
  Get,
  Query,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('sales/:period')
  async getSalesAnalytics(@Param('period') period: string) {
    if (!['today', 'week', 'month'].includes(period)) {
      throw new BadRequestException('Invalid period. Must be today, week, or month');
    }
    return this.analyticsService.getSalesAnalytics(period as 'today' | 'week' | 'month');
  }

  @Get('products/top')
  async getTopProducts(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.analyticsService.getTopProducts(limitNum);
  }

  @Get('customers/top')
  async getTopCustomers(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.analyticsService.getTopCustomers(limitNum);
  }

  @Get('revenue/trends')
  async getRevenueTrends() {
    return this.analyticsService.getRevenueTrends();
  }
}
