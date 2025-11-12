import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { Refund } from './entities/refund.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentTransaction, Refund])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}


