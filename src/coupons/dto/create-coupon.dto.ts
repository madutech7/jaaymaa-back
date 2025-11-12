import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCouponDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: ['percentage', 'fixed'] })
  @IsEnum(['percentage', 'fixed'])
  @IsNotEmpty()
  type: 'percentage' | 'fixed';

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  min_purchase?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  max_discount?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  expires_at?: Date;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  usage_limit?: number;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}


