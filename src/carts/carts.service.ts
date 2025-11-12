import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartsRepository: Repository<Cart>,
  ) {}

  async findOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartsRepository.findOne({
      where: { user_id: userId },
    });

    if (!cart) {
      cart = this.cartsRepository.create({
        user_id: userId,
        items: [],
      });
      cart = await this.cartsRepository.save(cart);
    }

    return cart;
  }

  async getCart(userId: string): Promise<Cart> {
    return this.findOrCreateCart(userId);
  }

  async updateCart(userId: string, updateCartDto: UpdateCartDto): Promise<Cart> {
    const cart = await this.findOrCreateCart(userId);
    cart.items = updateCartDto.items;
    return await this.cartsRepository.save(cart);
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.findOrCreateCart(userId);
    cart.items = [];
    return await this.cartsRepository.save(cart);
  }

  async addItem(userId: string, item: any): Promise<Cart> {
    const cart = await this.findOrCreateCart(userId);
    const items = cart.items as any[];

    // Check if item already exists
    const existingIndex = items.findIndex(
      (i) => i.product_id === item.product_id && i.variant_id === item.variant_id,
    );

    if (existingIndex >= 0) {
      // Update quantity
      items[existingIndex].quantity += item.quantity || 1;
    } else {
      // Add new item
      items.push(item);
    }

    cart.items = items;
    return await this.cartsRepository.save(cart);
  }

  async removeItem(userId: string, productId: string, variantId?: string): Promise<Cart> {
    const cart = await this.findOrCreateCart(userId);
    let items = cart.items as any[];

    items = items.filter(
      (i) => !(i.product_id === productId && (!variantId || i.variant_id === variantId)),
    );

    cart.items = items;
    return await this.cartsRepository.save(cart);
  }

  async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
    variantId?: string,
  ): Promise<Cart> {
    const cart = await this.findOrCreateCart(userId);
    const items = cart.items as any[];

    const itemIndex = items.findIndex(
      (i) => i.product_id === productId && (!variantId || i.variant_id === variantId),
    );

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        items.splice(itemIndex, 1);
      } else {
        items[itemIndex].quantity = quantity;
      }
    }

    cart.items = items;
    return await this.cartsRepository.save(cart);
  }
}


