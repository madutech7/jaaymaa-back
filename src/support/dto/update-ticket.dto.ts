import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTicketDto {
  @ApiProperty({ enum: ['open', 'in_progress', 'resolved', 'closed'], required: false })
  @IsEnum(['open', 'in_progress', 'resolved', 'closed'])
  @IsOptional()
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';

  @ApiProperty({ enum: ['low', 'medium', 'high', 'urgent'], required: false })
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  @IsOptional()
  priority?: 'low' | 'medium' | 'high' | 'urgent';

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  assigned_to?: string;
}


