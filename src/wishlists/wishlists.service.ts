import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistsRepository: Repository<Wishlist>,
  ) {}

  async findAll(userId: string): Promise<Wishlist[]> {
    return await this.wishlistsRepository.find({
      where: { user_id: userId },
      relations: ['product'],
      order: { created_at: 'DESC' },
    });
  }

  async addToWishlist(userId: string, productId: string): Promise<Wishlist> {
    // Check if already in wishlist
    const existing = await this.wishlistsRepository.findOne({
      where: { user_id: userId, product_id: productId },
    });

    if (existing) {
      throw new BadRequestException('Product already in wishlist');
    }

    const wishlist = this.wishlistsRepository.create({
      user_id: userId,
      product_id: productId,
    });

    return await this.wishlistsRepository.save(wishlist);
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const wishlist = await this.wishlistsRepository.findOne({
      where: { user_id: userId, product_id: productId },
    });

    if (!wishlist) {
      throw new BadRequestException('Product not in wishlist');
    }

    await this.wishlistsRepository.remove(wishlist);
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const count = await this.wishlistsRepository.count({
      where: { user_id: userId, product_id: productId },
    });

    return count > 0;
  }
}


