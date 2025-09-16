import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto, UpdateSaleDto, SalesSummaryDto } from './dto/sale.dto';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sale (checkout)' })
  @ApiResponse({ status: 201, description: 'Sale created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid sale data or insufficient stock' })
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales with optional filters' })
  @ApiResponse({ status: 200, description: 'Sales retrieved successfully' })
  findAll(@Query() summaryDto: SalesSummaryDto) {
    return this.salesService.findAll(summaryDto);
  }

  @Get('daily-summary')
  @ApiOperation({ summary: 'Get daily sales summary' })
  @ApiQuery({ name: 'date', required: false, description: 'Date in YYYY-MM-DD format' })
  @ApiResponse({ status: 200, description: 'Daily summary retrieved successfully' })
  getDailySummary(@Query('date') date?: string) {
    return this.salesService.getDailySummary(date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by ID' })
  @ApiResponse({ status: 200, description: 'Sale retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update sale' })
  @ApiResponse({ status: 200, description: 'Sale updated successfully' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(id, updateSaleDto);
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund a sale' })
  @ApiResponse({ status: 200, description: 'Sale refunded successfully' })
  @ApiResponse({ status: 400, description: 'Cannot refund this sale' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  refund(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.salesService.refund(id, body.reason);
  }
}
