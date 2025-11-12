import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductView } from './entities/product-view.entity';
import { AbandonedCart } from './entities/abandoned-cart.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ProductView)
    private viewsRepository: Repository<ProductView>,
    @InjectRepository(AbandonedCart)
    private abandonedCartsRepository: Repository<AbandonedCart>,
  ) {}

  async trackProductView(data: Partial<ProductView>): Promise<ProductView> {
    const view = this.viewsRepository.create(data);
    return await this.viewsRepository.save(view);
  }

  async getProductViews(productId: string): Promise<number> {
    return await this.viewsRepository.count({ where: { product_id: productId } });
  }

  async getMostViewedProducts(limit: number = 10): Promise<any[]> {
    return await this.viewsRepository
      .createQueryBuilder('view')
      .select('view.product_id', 'product_id')
      .addSelect('COUNT(*)', 'view_count')
      .groupBy('view.product_id')
      .orderBy('view_count', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async trackAbandonedCart(data: Partial<AbandonedCart>): Promise<AbandonedCart> {
    const cart = this.abandonedCartsRepository.create(data);
    return await this.abandonedCartsRepository.save(cart);
  }

  async getAbandonedCarts(): Promise<AbandonedCart[]> {
    return await this.abandonedCartsRepository.find({
      where: { converted_to_order_id: null },
      order: { created_at: 'DESC' },
    });
  }
}


