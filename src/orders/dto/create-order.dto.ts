import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  items: any;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  subtotal: number;

  @ApiProperty({ default: 0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiProperty({ default: 0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  tax?: number;

  @ApiProperty({ default: 0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  shipping?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  total: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  payment_method?: string;

  @ApiProperty()
  @IsNotEmpty()
  shipping_address: any;

  @ApiProperty()
  @IsNotEmpty()
  billing_address: any;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}


