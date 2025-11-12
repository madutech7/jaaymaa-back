import { IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartDto {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  @IsArray()
  @IsNotEmpty()
  items: any[];
}


