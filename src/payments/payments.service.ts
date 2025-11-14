import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { Refund } from './entities/refund.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentTransaction)
    private transactionsRepository: Repository<PaymentTransaction>,
    @InjectRepository(Refund)
    private refundsRepository: Repository<Refund>,
  ) {}

  async createTransaction(data: Partial<PaymentTransaction>): Promise<PaymentTransaction> {
    const transaction = this.transactionsRepository.create(data);
    return await this.transactionsRepository.save(transaction);
  }

  async findTransactionsByOrder(orderId: string): Promise<PaymentTransaction[]> {
    return await this.transactionsRepository.find({
      where: { order_id: orderId },
      order: { created_at: 'DESC' },
    });
  }

  async updateTransactionStatus(
    transactionId: string,
    status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded',
    errorMessage?: string,
  ): Promise<PaymentTransaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { transaction_id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
    }

    transaction.status = status;
    if (errorMessage) {
      transaction.error_message = errorMessage;
    }

    return await this.transactionsRepository.save(transaction);
  }

  async requestRefund(data: Partial<Refund>): Promise<Refund> {
    const refund = this.refundsRepository.create({
      ...data,
      status: 'requested',
    });
    return await this.refundsRepository.save(refund);
  }

  async processRefund(id: string, processedBy: string, approved: boolean): Promise<Refund> {
    const refund = await this.refundsRepository.findOne({ where: { id } });
    if (!refund) {
      throw new NotFoundException(`Refund with ID ${id} not found`);
    }

    refund.status = approved ? 'approved' : 'rejected';
    refund.processed_by = processedBy;
    refund.processed_at = new Date();

    return await this.refundsRepository.save(refund);
  }

  async findAllRefunds(): Promise<Refund[]> {
    return await this.refundsRepository.find({
      relations: ['order', 'transaction'],
      order: { requested_at: 'DESC' },
    });
  }
}


