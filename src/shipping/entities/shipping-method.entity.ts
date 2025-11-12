import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('shipping_methods')
export class ShippingMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', nullable: true })
  estimated_days_min: number;

  @Column({ type: 'int', nullable: true })
  estimated_days_max: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  free_shipping_threshold: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'text', array: true, default: ['FR', 'BE', 'CH', 'LU'] })
  countries: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}


