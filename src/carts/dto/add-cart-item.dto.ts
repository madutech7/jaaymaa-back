import { IsNotEmpty, IsUUID, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCartItemDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  variant_id?: string;

  @ApiProperty({ default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  price?: number;
}


