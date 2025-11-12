import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { EmailTemplate } from './entities/email-template.entity';
import { PromotionalBanner } from './entities/promotional-banner.entity';
import { NewsletterSubscriber } from './entities/newsletter-subscriber.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailTemplate, PromotionalBanner, NewsletterSubscriber])],
  controllers: [MarketingController],
  providers: [MarketingService],
  exports: [MarketingService],
})
export class MarketingModule {}


