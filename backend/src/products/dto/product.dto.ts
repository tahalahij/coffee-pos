import { IsString, IsOptional, IsBoolean, IsNumber, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: 'نام محصول' })
  @IsString({ message: 'نام محصول باید رشته باشد' })
  name: string;

  @ApiPropertyOptional({ description: 'توضیحات محصول' })
  @IsOptional()
  @IsString({ message: 'توضیحات محصول باید رشته باشد' })
  description?: string;

  @ApiProperty({ description: 'قیمت محصول' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'قیمت باید عدد معتبر باشد' })
  @Min(0, { message: 'قیمت نباید منفی باشد' })
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @ApiPropertyOptional({ description: 'هزینه محصول' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'هزینه باید عدد معتبر باشد' })
  @Min(0, { message: 'هزینه نباید منفی باشد' })
  @Transform(({ value }) => parseFloat(value))
  cost?: number;

  @ApiPropertyOptional({ description: 'کد SKU محصول' })
  @IsOptional()
  @IsString({ message: 'کد SKU باید رشته باشد' })
  sku?: string;

  @ApiPropertyOptional({ description: 'آدرس تصویر محصول' })
  @IsOptional()
  @IsString({ message: 'آدرس تصویر باید رشته باشد' })
  imageUrl?: string;

  @ApiProperty({ description: 'شناسه دسته‌بندی' })
  @IsInt({ message: 'شناسه دسته‌بندی باید عدد صحیح باشد' })
  @Type(() => Number)
  categoryId: number;

  @ApiPropertyOptional({ default: true, description: 'وضعیت در دسترس بودن' })
  @IsOptional()
  @IsBoolean({ message: 'وضعیت در دسترس بودن باید بولین باشد' })
  isAvailable?: boolean;

  @ApiPropertyOptional({ default: 0, description: 'تعداد موجودی' })
  @IsOptional()
  @IsInt({ message: 'موجودی باید عدد صحیح باشد' })
  @Min(0, { message: 'موجودی نباید منفی باشد' })
  @Type(() => Number)
  stock?: number;

  @ApiPropertyOptional({ default: 0, description: 'حداقل سطح موجودی' })
  @IsOptional()
  @IsInt({ message: 'حداقل سطح موجودی باید عدد صحیح باشد' })
  @Min(0, { message: 'حداقل سطح موجودی نباید منفی باشد' })
  @Type(() => Number)
  minStockLevel?: number;

  @ApiPropertyOptional({ description: 'آستانه هشدار موجودی کم' })
  @IsOptional()
  @IsInt({ message: 'آستانه هشدار باید عدد صحیح باشد' })
  @Min(0, { message: 'آستانه هشدار نباید منفی باشد' })
  @Type(() => Number)
  lowStockAlert?: number;
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  cost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minStockLevel?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  lowStockAlert?: number;
}
