import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponsRepository: Repository<Coupon>,
  ) {}

  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    const coupon = this.couponsRepository.create(createCouponDto);
    return await this.couponsRepository.save(coupon);
  }

  async findAll(): Promise<Coupon[]> {
    return await this.couponsRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.couponsRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    return coupon;
  }

  async findByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponsRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with code ${code} not found`);
    }

    return coupon;
  }

  async validateCoupon(code: string, orderAmount: number): Promise<Coupon> {
    const coupon = await this.findByCode(code);

    if (!coupon.is_active) {
      throw new BadRequestException('Coupon is not active');
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (coupon.min_purchase && orderAmount < coupon.min_purchase) {
      throw new BadRequestException(
        `Minimum purchase of ${coupon.min_purchase} required`,
      );
    }

    return coupon;
  }

  async applyCoupon(code: string, orderAmount: number): Promise<{ coupon: Coupon; discount: number }> {
    const coupon = await this.validateCoupon(code, orderAmount);

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (orderAmount * coupon.value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.value;
    }

    // Increment usage count
    coupon.usage_count += 1;
    await this.couponsRepository.save(coupon);

    return { coupon, discount };
  }

  async update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findOne(id);
    Object.assign(coupon, updateCouponDto);
    return await this.couponsRepository.save(coupon);
  }

  async remove(id: string): Promise<void> {
    const coupon = await this.findOne(id);
    await this.couponsRepository.remove(coupon);
  }
}


