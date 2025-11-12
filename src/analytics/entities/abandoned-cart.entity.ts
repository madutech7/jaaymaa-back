import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('abandoned_carts')
export class AbandonedCart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'jsonb' })
  cart_data: any;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_amount: number;

  @Column({ type: 'boolean', default: false })
  reminder_sent: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  reminder_sent_at: Date;

  @Column({ type: 'uuid', nullable: true })
  converted_to_order_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'converted_to_order_id' })
  converted_order: Order;
}


