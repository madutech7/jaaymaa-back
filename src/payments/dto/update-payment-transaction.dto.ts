import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePaymentTransactionDto {
  @ApiProperty({
    enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded'],
    required: false,
  })
  @IsEnum(['pending', 'processing', 'succeeded', 'failed', 'refunded'])
  @IsOptional()
  status?: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  error_message?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  payment_method_details?: any;
}

