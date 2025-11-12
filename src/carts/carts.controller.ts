import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('carts')
@Controller('carts')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  getCart(@CurrentUser() user: User) {
    return this.cartsService.getCart(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Update cart' })
  updateCart(@Body() updateCartDto: UpdateCartDto, @CurrentUser() user: User) {
    return this.cartsService.updateCart(user.id, updateCartDto);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  addItem(@Body() addCartItemDto: AddCartItemDto, @CurrentUser() user: User) {
    return this.cartsService.addItem(user.id, addCartItemDto);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(@Param('productId') productId: string, @CurrentUser() user: User) {
    return this.cartsService.removeItem(user.id, productId);
  }

  @Patch('items/:productId')
  @ApiOperation({ summary: 'Update item quantity' })
  updateItemQuantity(
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
    @CurrentUser() user: User,
  ) {
    return this.cartsService.updateItemQuantity(user.id, productId, quantity);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  clearCart(@CurrentUser() user: User) {
    return this.cartsService.clearCart(user.id);
  }
}


