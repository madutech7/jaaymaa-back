import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EmailTemplate } from './entities/email-template.entity';
import { PromotionalBanner } from './entities/promotional-banner.entity';
import { NewsletterSubscriber } from './entities/newsletter-subscriber.entity';

@Injectable()
export class MarketingService {
  constructor(
    @InjectRepository(EmailTemplate)
    private templatesRepository: Repository<EmailTemplate>,
    @InjectRepository(PromotionalBanner)
    private bannersRepository: Repository<PromotionalBanner>,
    @InjectRepository(NewsletterSubscriber)
    private subscribersRepository: Repository<NewsletterSubscriber>,
  ) {}

  // Email Templates
  async findAllTemplates(): Promise<EmailTemplate[]> {
    return await this.templatesRepository.find({ where: { is_active: true } });
  }

  // Promotional Banners
  async findActiveBanners(): Promise<PromotionalBanner[]> {
    const now = new Date();
    return await this.bannersRepository
      .createQueryBuilder('banner')
      .where('banner.is_active = :active', { active: true })
      .andWhere('banner.start_date <= :now', { now })
      .andWhere('banner.end_date >= :now', { now })
      .orderBy('banner.position', 'ASC')
      .getMany();
  }

  // Newsletter
  async subscribe(email: string, firstName?: string, lastName?: string): Promise<NewsletterSubscriber> {
    const existing = await this.subscribersRepository.findOne({ where: { email } });

    if (existing) {
      if (existing.is_subscribed) {
        throw new BadRequestException('Email already subscribed');
      }
      existing.is_subscribed = true;
      existing.unsubscribed_at = null;
      return await this.subscribersRepository.save(existing);
    }

    const subscriber = this.subscribersRepository.create({
      email,
      first_name: firstName,
      last_name: lastName,
    });
    return await this.subscribersRepository.save(subscriber);
  }

  async unsubscribe(email: string): Promise<void> {
    const subscriber = await this.subscribersRepository.findOne({ where: { email } });
    if (!subscriber) {
      throw new NotFoundException('Email not found');
    }

    subscriber.is_subscribed = false;
    subscriber.unsubscribed_at = new Date();
    await this.subscribersRepository.save(subscriber);
  }

  async getSubscriberCount(): Promise<number> {
    return await this.subscribersRepository.count({ where: { is_subscribed: true } });
  }
}


