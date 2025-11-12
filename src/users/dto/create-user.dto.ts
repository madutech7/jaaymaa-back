import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 'John', required: false })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty({ example: '+33612345678', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatar_url?: string;

  @ApiProperty({ enum: ['customer', 'admin'], default: 'customer', required: false })
  @IsEnum(['customer', 'admin'])
  @IsOptional()
  role?: 'customer' | 'admin';

  @ApiProperty({ example: 0, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  loyalty_points?: number;
}


