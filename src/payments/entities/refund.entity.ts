import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { PaymentTransaction } from './payment-transaction.entity';
import { User } from '../../users/entities/user.entity';

@Entity('refunds')
export class Refund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  order_id: string;

  @Column({ type: 'uuid', nullable: true })
  transaction_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text' })
  status: 'requested' | 'approved' | 'rejected' | 'processed';

  @Column({ type: 'uuid', nullable: true })
  processed_by: string;

  @CreateDateColumn({ type: 'timestamptz' })
  requested_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  processed_at: Date;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => PaymentTransaction)
  @JoinColumn({ name: 'transaction_id' })
  transaction: PaymentTransaction;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'processed_by' })
  processor: User;
}


