import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DiscountsService, CreateDiscountCodeDto } from './discounts.service';
import { DiscountType } from '@prisma/client';

@ApiTags('discounts')
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new discount' })
  @ApiResponse({ status: 201, description: 'Discount created successfully' })
  create(@Body() createDiscountDto: CreateDiscountCodeDto) {
    return this.discountsService.create(createDiscountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all discounts' })
  @ApiResponse({ status: 200, description: 'Discounts retrieved successfully' })
  findAll() {
    return this.discountsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active discounts' })
  @ApiResponse({ status: 200, description: 'Active discounts retrieved successfully' })
  findActive() {
    return this.discountsService.findActive();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get discount statistics' })
  @ApiResponse({ status: 200, description: 'Discount statistics retrieved successfully' })
  async getDiscountStats() {
    return this.discountsService.getDiscountStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get discount by ID' })
  @ApiResponse({ status: 200, description: 'Discount retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Discount not found' })
  findOne(@Param('id') id: string) {
    return this.discountsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update discount' })
  @ApiResponse({ status: 200, description: 'Discount updated successfully' })
  @ApiResponse({ status: 404, description: 'Discount not found' })
  update(@Param('id') id: string, @Body() updateDiscountDto: CreateDiscountCodeDto) {
    return this.discountsService.update(id, updateDiscountDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete discount' })
  @ApiResponse({ status: 204, description: 'Discount deleted successfully' })
  @ApiResponse({ status: 404, description: 'Discount not found' })
  remove(@Param('id') id: string) {
    return this.discountsService.remove(id);
  }

  @Post(':id/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle discount active status' })
  @ApiResponse({ status: 200, description: 'Discount status toggled successfully' })
  toggleActive(@Param('id') id: string) {
    return this.discountsService.toggleActive(id);
  }

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate discount for given amount' })
  @ApiResponse({ status: 200, description: 'Discount calculated successfully' })
  calculateDiscount(
    @Body() body: { amount: number; discountId?: string },
  ) {
    return this.discountsService.calculateDiscount(body.amount, body.discountId);
  }

  @Post('codes')
  @ApiOperation({ summary: 'Create a new discount code' })
  async createDiscountCode(@Body() createDiscountCodeDto: CreateDiscountCodeDto) {
    return this.discountsService.createDiscountCode(createDiscountCodeDto);
  }

  @Get('codes/all')
  @ApiOperation({ summary: 'Get all discount codes' })
  async getDiscountCodes(@Query('customerId') customerId?: string) {
    return this.discountsService.getDiscountCodes(customerId);
  }

  @Get('codes/:code/validate')
  @ApiOperation({ summary: 'Validate a discount code' })
  async validateDiscountCode(
    @Param('code') code: string,
    @Query('customerId') customerId?: string,
    @Query('subtotal') subtotal?: string,
  ) {
    const subtotalNum = subtotal ? parseFloat(subtotal) : undefined;
    return this.discountsService.validateDiscountCode(code, customerId, subtotalNum);
  }

  @Post('codes/:code/apply')
  @ApiOperation({ summary: 'Apply a discount code' })
  async applyDiscountCode(
    @Param('code') code: string,
    @Body() body: { subtotal: number; customerId?: string },
  ) {
    return this.discountsService.applyDiscountCode(code, body.subtotal, body.customerId);
  }

  @Post('codes/:code/use')
  @ApiOperation({ summary: 'Use a discount code' })
  async useDiscountCode(@Param('code') code: string) {
    const discountCode = await this.discountsService.getDiscountCodeByCode(code);
    return this.discountsService.useDiscountCode(discountCode.id);
  }

  @Post('codes/personalized/:customerId')
  @ApiOperation({ summary: 'Generate personalized discount codes for a customer' })
  async generatePersonalizedCodes(
    @Param('customerId') customerId: string,
    @Body() body: { count?: number },
  ) {
    const result = await this.discountsService.generatePersonalizedCodes(customerId, body.count || 1);
    // Return the codes array directly since the service returns an array
    return result;
  }

  @Post('codes/bulk')
  @ApiOperation({ summary: 'Create bulk discount codes' })
  async createBulkDiscountCodes(
    @Body() body: {
      prefix: string;
      count: number;
      type: DiscountType;
      value: number;
      minPurchase?: number;
      maxDiscount?: number;
      usageLimit?: number;
      expiresAt?: string;
    },
  ) {
    const expiresAt = body.expiresAt ? body.expiresAt : undefined;
    const result = await this.discountsService.createBulkDiscountCodes({
      ...body,
      expiresAt,
    });
    // Return the codes array directly since the service returns an array
    return result;
  }

  @Get('codes/customer/:customerId/history')
  @ApiOperation({ summary: 'Get discount code usage history for a customer' })
  async getCustomerDiscountHistory(@Param('customerId') customerId: string) {
    return this.discountsService.getCustomerDiscountHistory(customerId);
  }

  @Post('codes/cleanup')
  @ApiOperation({ summary: 'Deactivate expired discount codes' })
  async deactivateExpiredCodes() {
    return this.discountsService.deactivateExpiredCodes();
  }
}
