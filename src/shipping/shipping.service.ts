import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingMethod } from './entities/shipping-method.entity';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingMethod)
    private shippingRepository: Repository<ShippingMethod>,
  ) {}

  async findAll(): Promise<ShippingMethod[]> {
    return await this.shippingRepository.find({
      where: { is_active: true },
      order: { price: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ShippingMethod> {
    const method = await this.shippingRepository.findOne({ where: { id } });
    if (!method) {
      throw new NotFoundException(`Shipping method with ID ${id} not found`);
    }
    return method;
  }

  async calculateShipping(subtotal: number, country: string = 'FR'): Promise<ShippingMethod[]> {
    const methods = await this.shippingRepository.find({
      where: { is_active: true },
    });

    return methods
      .filter((method) => method.countries.includes(country))
      .map((method) => {
        if (method.free_shipping_threshold && subtotal >= method.free_shipping_threshold) {
          return { ...method, price: 0 };
        }
        return method;
      });
  }

  async findAllAdmin(): Promise<ShippingMethod[]> {
    return await this.shippingRepository.find({
      order: { price: 'ASC' },
    });
  }

  async create(createDto: CreateShippingMethodDto): Promise<ShippingMethod> {
    const method = this.shippingRepository.create(createDto);
    return await this.shippingRepository.save(method);
  }

  async update(id: string, updateDto: UpdateShippingMethodDto): Promise<ShippingMethod> {
    await this.shippingRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const method = await this.findOne(id);
    await this.shippingRepository.remove(method);
  }
}


