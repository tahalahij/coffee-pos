import { IsString, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested, Min, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { SaleStatus } from '../models/sale.model';

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  DIGITAL = 'DIGITAL',
}

export class CreateSaleItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional()
  @Transform(({ value, obj }) => {
    // If productId is provided, use it
    if (value) {
      const numValue = parseInt(value);
      return isNaN(numValue) ? undefined : numValue;
    }

    // If no productId but id exists, try to extract from id
    if (obj.id && typeof obj.id === 'string') {
      const idParts = obj.id.split('-');
      if (idParts.length > 1) {
        const numValue = parseInt(idParts[0]);
        return isNaN(numValue) ? undefined : numValue;
      }
    }

    return undefined;
  })
  @IsOptional()
  @IsInt()
  productId?: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return Math.round(num * 100) / 100; // Ensure 2 decimal places
  })
  unitPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return undefined;
    const num = parseFloat(value);
    if (isNaN(num)) return undefined;
    return Math.round(num * 100) / 100; // Ensure 2 decimal places
  })
  totalAmount?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return 0;
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    return Math.round(num * 100) / 100; // Ensure 2 decimal places
  })
  discountAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  product?: {
    name?: string;
    price?: number;
    [key: string]: any;
  };
}

export class CreateSaleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  customerId?: number;

  @ApiProperty({ type: [CreateSaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return 0;
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    return Math.round(num * 100) / 100; // Ensure 2 decimal places
  })
  subtotal?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return 0;
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    return Math.round(num * 100) / 100; // Ensure 2 decimal places
  })
  taxAmount?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return 0;
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    return Math.round(num * 100) / 100; // Ensure 2 decimal places
  })
  discountAmount?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return 0;
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    return Math.round(num * 100) / 100; // Ensure 2 decimal places
  })
  totalAmount?: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ enum: SaleStatus })
  @IsOptional()
  @IsEnum(SaleStatus)
  status?: SaleStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return undefined;
    const num = parseFloat(value);
    if (isNaN(num)) return undefined;
    return Math.round(num * 100) / 100; // Ensure 2 decimal places
  })
  cashReceived?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return undefined;
    const num = parseFloat(value);
    if (isNaN(num)) return undefined;
    return Math.round(num * 100) / 100; // Ensure 2 decimal places
  })
  changeGiven?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSaleDto {
  @ApiPropertyOptional({ enum: SaleStatus })
  @IsOptional()
  @IsEnum(SaleStatus)
  status?: SaleStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SalesSummaryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ enum: SaleStatus })
  @IsOptional()
  @IsEnum(SaleStatus)
  status?: SaleStatus;
}
