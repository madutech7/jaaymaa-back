import { IsNotEmpty, IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ enum: ['order', 'promotion', 'system', 'review'] })
  @IsEnum(['order', 'promotion', 'system', 'review'])
  @IsNotEmpty()
  type: 'order' | 'promotion' | 'system' | 'review';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  link?: string;
}


