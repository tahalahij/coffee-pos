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
import { DiscountType } from './models/discount-code.model';

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

  @Get('codes')
  @ApiOperation({ summary: 'Get all discount codes' })
  async getDiscountCodes(@Query('customerId') customerId?: string) {
    const customerIdNum = customerId ? parseInt(customerId, 10) : undefined;
    return this.discountsService.getDiscountCodes(customerIdNum);
  }

  @Get('codes/:code/validate')
  @ApiOperation({ summary: 'Validate a discount code' })
  async validateDiscountCode(
    @Param('code') code: string,
    @Query('customerId') customerId?: string,
    @Query('subtotal') subtotal?: string,
  ) {
    const subtotalNum = subtotal ? parseFloat(subtotal) : undefined;
    const customerIdNum = customerId ? parseInt(customerId, 10) : undefined;
    return this.discountsService.validateDiscountCode(code, customerIdNum, subtotalNum);
  }

  @Post('codes/:code/validate-for-products')
  @ApiOperation({ summary: 'Validate a discount code for specific products' })
  async validateDiscountForProducts(
    @Param('code') code: string,
    @Body() body: { productIds: string[]; subtotal: number; customerId?: string },
  ) {
    return this.discountsService.validateDiscountForProducts({
      code,
      productIds: body.productIds,
      subtotal: body.subtotal,
      customerId: body.customerId,
    });
  }

  @Post('codes/:code/apply')
  @ApiOperation({ summary: 'Apply a discount code' })
  async applyDiscountCode(
    @Param('code') code: string,
    @Body() body: { subtotal: number; customerId?: string; productIds?: number[] },
  ) {
    const customerIdNum = body.customerId ? parseInt(body.customerId, 10) : undefined;
    return this.discountsService.applyDiscountCode(code, body.subtotal, customerIdNum, body.productIds);
  }

  @Post('codes/:code/use')
  @ApiOperation({ summary: 'Use a discount code' })
  async useDiscountCode(@Param('code') code: string) {
    const discountCode = await this.discountsService.getDiscountCodeByCode(code);
    return this.discountsService.useDiscountCode(discountCode._id.toString());
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

  // Product restriction management endpoints
  @Get(':id/products')
  @ApiOperation({ summary: 'Get products associated with a discount code' })
  async getDiscountProducts(@Param('id') id: string) {
    return this.discountsService.getDiscountProducts(id);
  }

  @Post(':id/products')
  @ApiOperation({ summary: 'Set products for a discount code (replaces existing)' })
  async setDiscountProducts(
    @Param('id') id: string,
    @Body() body: { productIds: number[] },
  ) {
    await this.discountsService.setDiscountProducts(id, body.productIds);
    return this.discountsService.findOne(id);
  }

  @Post(':id/products/:productId')
  @ApiOperation({ summary: 'Add a product to a discount code' })
  async addProductToDiscount(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    await this.discountsService.addProductToDiscount(id, parseInt(productId, 10));
    return { message: 'Product added to discount successfully' };
  }

  @Delete(':id/products/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a product from a discount code' })
  async removeProductFromDiscount(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    await this.discountsService.removeProductFromDiscount(id, parseInt(productId, 10));
  }
}
