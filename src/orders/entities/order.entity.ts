import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  order_number: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'jsonb' })
  items: any;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shipping: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'text', default: 'pending' })
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

  @Column({ type: 'text', default: 'pending' })
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';

  @Column({ nullable: true })
  payment_method: string;

  @Column({ type: 'jsonb' })
  shipping_address: any;

  @Column({ type: 'jsonb' })
  billing_address: any;

  @Column({ nullable: true })
  tracking_number: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;
}



