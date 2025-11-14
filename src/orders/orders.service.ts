import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private emailService: EmailService,
    private usersService: UsersService,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: { id: string; email: string; first_name?: string; last_name?: string }): Promise<Order> {
    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const order = this.ordersRepository.create({
      ...createOrderDto,
      user_id: user.id,
      order_number: orderNumber,
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Envoyer l'email de confirmation de commande avec l'email du client connecté
    try {
      if (!user) {
        this.logger.warn(`⚠️ Impossible d'envoyer l'email: utilisateur non défini`);
        return savedOrder;
      }

      if (!user.email) {
        this.logger.warn(`⚠️ Impossible d'envoyer l'email: utilisateur ${user.id} n'a pas d'email`);
        return savedOrder;
      }

      const userName = user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.first_name || user.last_name || undefined;
      
      this.logger.log(`📧 Tentative d'envoi d'email de confirmation à ${user.email} pour la commande ${savedOrder.order_number}`);
      
      await this.emailService.sendOrderConfirmation(
        savedOrder,
        user.email,
        userName,
      );
      
      this.logger.log(`✅ Email de confirmation envoyé avec succès à ${user.email} pour la commande ${savedOrder.order_number}`);
    } catch (error) {
      // Ne pas faire échouer la création de commande si l'email échoue
      this.logger.error(`❌ Erreur lors de l'envoi de l'email de confirmation:`, error);
      if (error instanceof Error) {
        this.logger.error(`Type: ${error.constructor.name}`);
        this.logger.error(`Message: ${error.message}`);
        if (error.stack) {
          this.logger.error(`Stack: ${error.stack}`);
        }
      } else {
        this.logger.error(`Erreur inconnue:`, JSON.stringify(error));
      }
      // Ne pas propager l'erreur pour ne pas bloquer la création de commande
    }

    return savedOrder;
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
    const oldStatus = order.status;
    const oldPaymentStatus = order.payment_status;
    
    Object.assign(order, updateOrderDto);
    const savedOrder = await this.ordersRepository.save(order);

    // Envoyer des emails si le statut ou le statut de paiement a changé
    try {
      if (order.user_id && (oldStatus !== savedOrder.status || oldPaymentStatus !== savedOrder.payment_status)) {
        const user = await this.usersService.findOne(order.user_id);
        if (user && user.email) {
          const userName = user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : user.first_name || user.last_name || undefined;
          
          // Envoyer l'email de mise à jour de statut si le statut a changé
          if (oldStatus !== savedOrder.status) {
            await this.emailService.sendOrderStatusUpdate(
              savedOrder,
              user.email,
              userName,
              oldStatus,
            );
            this.logger.log(`Email de mise à jour de statut envoyé pour la commande ${savedOrder.order_number}`);
          }
          
          // Envoyer l'email de mise à jour de paiement si le statut de paiement a changé
          if (oldPaymentStatus !== savedOrder.payment_status) {
            await this.emailService.sendPaymentStatusUpdate(
              savedOrder,
              user.email,
              userName,
              oldPaymentStatus,
            );
            this.logger.log(`Email de mise à jour de paiement envoyé pour la commande ${savedOrder.order_number}`);
          }
        }
      }
    } catch (error) {
      // Ne pas faire échouer la mise à jour si l'email échoue
      this.logger.error(`Erreur lors de l'envoi des emails de mise à jour:`, error);
    }

    return savedOrder;
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded',
  ): Promise<Order> {
    const order = await this.findOne(id);
    const oldStatus = order.status;
    order.status = status;
    const savedOrder = await this.ordersRepository.save(order);

    // Envoyer l'email de notification de changement de statut
    try {
      if (order.user_id) {
        const user = await this.usersService.findOne(order.user_id);
        if (user && user.email) {
          const userName = user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : user.first_name || user.last_name || undefined;
          
          await this.emailService.sendOrderStatusUpdate(
            savedOrder,
            user.email,
            userName,
            oldStatus,
          );
          this.logger.log(`Email de mise à jour de statut envoyé pour la commande ${savedOrder.order_number}`);
        }
      }
    } catch (error) {
      // Ne pas faire échouer la mise à jour si l'email échoue
      this.logger.error(`Erreur lors de l'envoi de l'email de mise à jour de statut:`, error);
    }

    return savedOrder;
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  ): Promise<Order> {
    const order = await this.findOne(id);
    const oldPaymentStatus = order.payment_status;
    order.payment_status = paymentStatus;
    const savedOrder = await this.ordersRepository.save(order);

    // Envoyer l'email de notification de changement de statut de paiement
    try {
      if (order.user_id) {
        const user = await this.usersService.findOne(order.user_id);
        if (user && user.email) {
          const userName = user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : user.first_name || user.last_name || undefined;
          
          await this.emailService.sendPaymentStatusUpdate(
            savedOrder,
            user.email,
            userName,
            oldPaymentStatus,
          );
          this.logger.log(`Email de mise à jour de paiement envoyé pour la commande ${savedOrder.order_number}`);
        }
      }
    } catch (error) {
      // Ne pas faire échouer la mise à jour si l'email échoue
      this.logger.error(`Erreur lors de l'envoi de l'email de mise à jour de paiement:`, error);
    }

    return savedOrder;
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
    
    const oldPaymentStatus = order.payment_status;
    const oldStatus = order.status;
    
    // Valider le paiement
    order.payment_status = 'paid';
    
    // Si la commande est en attente, passer à "processing"
    if (order.status === 'pending') {
      order.status = 'processing';
    }
    
    const savedOrder = await this.ordersRepository.save(order);

    // Envoyer l'email de notification de validation de paiement
    try {
      if (order.user_id) {
        const user = await this.usersService.findOne(order.user_id);
        if (user && user.email) {
          const userName = user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : user.first_name || user.last_name || undefined;
          
          // Envoyer l'email de mise à jour de paiement
          await this.emailService.sendPaymentStatusUpdate(
            savedOrder,
            user.email,
            userName,
            oldPaymentStatus,
          );
          
          // Si le statut a aussi changé, envoyer aussi l'email de mise à jour de statut
          if (oldStatus !== savedOrder.status) {
            await this.emailService.sendOrderStatusUpdate(
              savedOrder,
              user.email,
              userName,
              oldStatus,
            );
          }
          
          this.logger.log(`Email de validation de paiement envoyé pour la commande ${savedOrder.order_number}`);
        }
      }
    } catch (error) {
      // Ne pas faire échouer la validation si l'email échoue
      this.logger.error(`Erreur lors de l'envoi de l'email de validation de paiement:`, error);
    }
    
    return savedOrder;
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.ordersRepository.remove(order);
  }
}


