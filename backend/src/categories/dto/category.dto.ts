import { IsString, IsOptional, IsBoolean, IsHexColor } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'نام دسته‌بندی' })
  @IsString({ message: 'نام دسته‌بندی باید رشته باشد' })
  name: string;

  @ApiPropertyOptional({ description: 'توضیحات دسته‌بندی' })
  @IsOptional()
  @IsString({ message: 'توضیحات باید رشته باشد' })
  description?: string;

  @ApiPropertyOptional({ default: '#6B7280', description: 'رنگ دسته‌بندی' })
  @IsOptional()
  @IsHexColor({ message: 'رنگ باید کد هگز معتبر باشد' })
  color?: string;

  @ApiPropertyOptional({ default: true, description: 'وضعیت فعال بودن' })
  @IsOptional()
  @IsBoolean({ message: 'وضعیت فعال بودن باید بولین باشد' })
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'نام دسته‌بندی' })
  @IsOptional()
  @IsString({ message: 'نام دسته‌بندی باید رشته باشد' })
  name?: string;

  @ApiPropertyOptional({ description: 'توضیحات دسته‌بندی' })
  @IsOptional()
  @IsString({ message: 'توضیحات باید رشته باشد' })
  description?: string;

  @ApiPropertyOptional({ description: 'رنگ دسته‌بندی' })
  @IsOptional()
  @IsHexColor({ message: 'رنگ باید کد هگز معتبر باشد' })
  color?: string;

  @ApiPropertyOptional({ description: 'وضعیت فعال بودن' })
  @IsOptional()
  @IsBoolean({ message: 'وضعیت فعال بودن باید بولین باشد' })
  isActive?: boolean;
}
