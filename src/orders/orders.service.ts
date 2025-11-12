import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const order = this.ordersRepository.create({
      ...createOrderDto,
      user_id: userId,
      order_number: orderNumber,
    });

    return await this.ordersRepository.save(order);
  }

  async findAll(userId?: string): Promise<Order[]> {
    const query = this.ordersRepository.createQueryBuilder('order');

    if (userId) {
      query.where('order.user_id = :userId', { userId });
    }

    query.leftJoinAndSelect('order.user', 'user');
    query.orderBy('order.created_at', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string, userId?: string): Promise<Order> {
    const query = this.ordersRepository.createQueryBuilder('order');

    query.where('order.id = :id', { id });

    if (userId) {
      query.andWhere('order.user_id = :userId', { userId });
    }

    query.leftJoinAndSelect('order.user', 'user');

    const order = await query.getOne();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { order_number: orderNumber },
      relations: ['user'],
    });

    if (!order) {
      throw new NotFoundException(`Order with number ${orderNumber} not found`);
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return await this.ordersRepository.save(order);
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded',
  ): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return await this.ordersRepository.save(order);
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  ): Promise<Order> {
    const order = await this.findOne(id);
    order.payment_status = paymentStatus;
    return await this.ordersRepository.save(order);
  }

  async validateCashPayment(id: string): Promise<Order> {
    const order = await this.findOne(id);
    
    // Vérifier que c'est bien un paiement en espèces
    if (order.payment_method !== 'cash_on_delivery' && order.payment_method !== 'Paiement à la livraison') {
      throw new Error('Cette commande n\'est pas un paiement en espèces');
    }
    
    // Vérifier que le paiement n'est pas déjà validé
    if (order.payment_status === 'paid') {
      throw new Error('Ce paiement a déjà été validé');
    }
    
    // Valider le paiement
    order.payment_status = 'paid';
    
    // Si la commande est en attente, passer à "processing"
    if (order.status === 'pending') {
      order.status = 'processing';
    }
    
    return await this.ordersRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.ordersRepository.remove(order);
  }
}


