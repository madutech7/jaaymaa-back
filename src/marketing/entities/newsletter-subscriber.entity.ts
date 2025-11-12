import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('newsletter_subscribers')
export class NewsletterSubscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ type: 'boolean', default: true })
  is_subscribed: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  subscribed_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  unsubscribed_at: Date;
}


