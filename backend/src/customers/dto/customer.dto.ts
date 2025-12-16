import { IsString, IsOptional, IsEmail, IsDateString, Matches, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export class CreateCustomerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'شماره تلفن باید بین ۱۰ تا ۱۵ رقم باشد و ممکن است با + شروع شود'
  })
  phone: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender, { message: 'جنسیت باید یکی از مقادیر MALE، FEMALE یا OTHER باشد' })
  sex?: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'شماره تلفن باید بین ۱۰ تا ۱۵ رقم باشد و ممکن است با + شروع شود'
  })
  phone?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender, { message: 'جنسیت باید یکی از مقادیر MALE، FEMALE یا OTHER باشد' })
  sex?: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}

export class SearchCustomerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  query: string;
}
