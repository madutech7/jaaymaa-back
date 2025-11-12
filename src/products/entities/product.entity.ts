import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Wishlist } from '../../wishlists/entities/wishlist.entity';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  short_description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  compare_at_price: number;

  @Column({ unique: true })
  sku: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'jsonb', default: [] })
  images: any[];

  @Column({ type: 'uuid', nullable: true })
  category_id: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', default: [] })
  variants: any[];

  @Column({ type: 'jsonb', default: {} })
  specifications: any;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  review_count: number;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'boolean', default: false })
  is_new_arrival: boolean;

  @Column({ type: 'boolean', default: false })
  is_best_seller: boolean;

  @Column({ type: 'text', default: 'active' })
  status: 'active' | 'draft' | 'archived';

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
  wishlists: Wishlist[];

  @OneToMany(() => ProductImage, (image) => image.product)
  product_images: ProductImage[];

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  product_variants: ProductVariant[];
}
