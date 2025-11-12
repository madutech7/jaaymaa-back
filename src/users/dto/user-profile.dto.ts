import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  first_name?: string;

  @ApiProperty({ required: false })
  last_name?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  avatar_url?: string;

  @ApiProperty()
  role: 'customer' | 'admin';

  @ApiProperty()
  loyalty_points: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

