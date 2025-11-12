import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  alt_text: string;

  @Column({ type: 'boolean', default: false })
  is_primary: boolean;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => Product, (product) => product.product_images)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

