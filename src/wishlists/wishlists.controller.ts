import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistsService } from './wishlists.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('wishlists')
@Controller('wishlists')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  findAll(@CurrentUser() user: User) {
    return this.wishlistsService.findAll(user.id);
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Add product to wishlist' })
  addToWishlist(@Param('productId') productId: string, @CurrentUser() user: User) {
    return this.wishlistsService.addToWishlist(user.id, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  removeFromWishlist(@Param('productId') productId: string, @CurrentUser() user: User) {
    return this.wishlistsService.removeFromWishlist(user.id, productId);
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'Check if product is in wishlist' })
  async isInWishlist(@Param('productId') productId: string, @CurrentUser() user: User) {
    const inWishlist = await this.wishlistsService.isInWishlist(user.id, productId);
    return { inWishlist };
  }
}


