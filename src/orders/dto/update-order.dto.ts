import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiProperty({
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    required: false,
  })
  @IsEnum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
  @IsOptional()
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

  @ApiProperty({
    enum: ['pending', 'paid', 'failed', 'refunded'],
    required: false,
  })
  @IsEnum(['pending', 'paid', 'failed', 'refunded'])
  @IsOptional()
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tracking_number?: string;
}


