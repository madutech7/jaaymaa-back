import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { ProductView } from './entities/product-view.entity';
import { AbandonedCart } from './entities/abandoned-cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductView, AbandonedCart])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}


