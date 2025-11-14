import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentTransactionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  order_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  payment_provider: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ default: 'EUR', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded'],
    default: 'pending',
  })
  @IsEnum(['pending', 'processing', 'succeeded', 'failed', 'refunded'])
  @IsOptional()
  status?: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  payment_method_details?: any;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  error_message?: string;
}

