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
    // Return all templates for admin (not just active)
    return await this.templatesRepository.find({ order: { created_at: 'DESC' } });
  }

  async findOneTemplate(id: string): Promise<EmailTemplate> {
    const template = await this.templatesRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Email template with ID ${id} not found`);
    }
    return template;
  }

  async findTemplateByName(name: string): Promise<EmailTemplate | null> {
    return await this.templatesRepository.findOne({ where: { name } });
  }

  async createTemplate(templateData: {
    name: string;
    subject: string;
    body_html: string;
    body_text?: string;
    variables?: string[];
    is_active?: boolean;
  }): Promise<EmailTemplate> {
    // Check if template name already exists
    const existing = await this.findTemplateByName(templateData.name);
    if (existing) {
      throw new BadRequestException(`Template with name "${templateData.name}" already exists`);
    }

    const template = this.templatesRepository.create({
      name: templateData.name,
      subject: templateData.subject,
      body_html: templateData.body_html,
      body_text: templateData.body_text || null,
      variables: templateData.variables || [],
      is_active: templateData.is_active !== false,
    });

    return await this.templatesRepository.save(template);
  }

  async updateTemplate(
    id: string,
    updates: {
      subject?: string;
      body_html?: string;
      body_text?: string;
      variables?: string[];
      is_active?: boolean;
    }
  ): Promise<EmailTemplate> {
    const template = await this.findOneTemplate(id);

    if (updates.subject !== undefined) template.subject = updates.subject;
    if (updates.body_html !== undefined) template.body_html = updates.body_html;
    if (updates.body_text !== undefined) template.body_text = updates.body_text;
    if (updates.variables !== undefined) template.variables = updates.variables;
    if (updates.is_active !== undefined) template.is_active = updates.is_active;

    return await this.templatesRepository.save(template);
  }

  async deleteTemplate(id: string): Promise<void> {
    const template = await this.findOneTemplate(id);
    await this.templatesRepository.remove(template);
  }

  async renderTemplate(
    id: string,
    variables: Record<string, string>
  ): Promise<{ subject: string; body_html: string; body_text?: string }> {
    const template = await this.findOneTemplate(id);

    let subject = template.subject;
    let bodyHtml = template.body_html;
    let bodyText = template.body_text;

    // Replace variables in template
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      subject = subject.replace(regex, value);
      bodyHtml = bodyHtml.replace(regex, value);
      if (bodyText) {
        bodyText = bodyText.replace(regex, value);
      }
    });

    return {
      subject,
      body_html: bodyHtml,
      body_text: bodyText || undefined,
    };
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


