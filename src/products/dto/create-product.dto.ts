import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsArray,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  short_description?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  compare_at_price?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ default: 0 })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  images?: any[];

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  category_id?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  variants?: any[];

  @ApiProperty({ required: false })
  @IsOptional()
  specifications?: any;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  is_featured?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  is_new_arrival?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  is_best_seller?: boolean;

  @ApiProperty({ enum: ['active', 'draft', 'archived'], default: 'active' })
  @IsEnum(['active', 'draft', 'archived'])
  @IsOptional()
  status?: 'active' | 'draft' | 'archived';
}

