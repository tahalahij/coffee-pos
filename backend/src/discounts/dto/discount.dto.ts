import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export class CreateDiscountDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: DiscountType })
  @IsEnum(DiscountType)
  type: DiscountType;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  value: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  minAmount?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateDiscountDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: DiscountType })
  @IsOptional()
  @IsEnum(DiscountType)
  type?: DiscountType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  minAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CreateDiscountCodeDto {
  @ApiPropertyOptional({ description: 'Unique discount code. Auto-generated if not provided.' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: DiscountType })
  @IsEnum(DiscountType)
  type: DiscountType;

  @ApiProperty({ description: 'Discount value (percentage or fixed amount)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  value: number;

  @ApiPropertyOptional({ description: 'Minimum purchase amount required to use this code' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  minPurchase?: number;

  @ApiPropertyOptional({ description: 'Maximum discount amount (caps the discount)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  maxDiscount?: number;

  @ApiPropertyOptional({ description: 'Maximum number of times this code can be used' })
  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'Restrict to a specific customer' })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiPropertyOptional({ description: 'Start date when the code becomes valid' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ description: 'Expiration date of the discount code' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Restrict discount to specific product IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  productIds?: number[];
}

export class ValidateDiscountForProductsDto {
  @ApiProperty({ description: 'Discount code to validate' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Product IDs in the cart', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  productIds: number[];

  @ApiProperty({ description: 'Cart subtotal amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  subtotal: number;

  @ApiPropertyOptional({ description: 'Customer ID if applicable' })
  @IsOptional()
  @IsNumber()
  customerId?: number;
}
