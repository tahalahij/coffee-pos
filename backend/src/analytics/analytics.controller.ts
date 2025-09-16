import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard overview with key metrics' })
  @ApiResponse({ status: 200, description: 'Dashboard overview retrieved successfully' })
  getDashboardOverview() {
    return this.analyticsService.getDashboardOverview();
  }

  @Get('sales')
  @ApiOperation({ summary: 'Get sales analytics for specified period' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to analyze (default: 30)' })
  @ApiResponse({ status: 200, description: 'Sales analytics retrieved successfully' })
  getSalesAnalytics(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getSalesAnalytics(daysNumber);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get product performance analytics' })
  @ApiResponse({ status: 200, description: 'Product performance retrieved successfully' })
  getProductPerformance() {
    return this.analyticsService.getProductPerformance();
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory report and analytics' })
  @ApiResponse({ status: 200, description: 'Inventory report retrieved successfully' })
  getInventoryReport() {
    return this.analyticsService.getInventoryReport();
  }
}
