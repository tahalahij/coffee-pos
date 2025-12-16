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
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => String(value))
  productId: string;

  @ApiProperty()
  @IsNumber()
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


}

export class CreateSaleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ? String(value) : undefined)
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ? String(value) : undefined)
  discountCodeId?: string;

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

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

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
