import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSubscription } from './entities/user-subscription.entity';
import { User } from '../user/entities/user.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { UserModule } from '../user/user.module';
import { SubscriptionReceiptVerificationService } from 'src/helpers/subscription-receipt-verify.helper';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, SubscriptionPlan, UserSubscription]),
    UserModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionReceiptVerificationService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
