import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DeviceTokenModule } from './device-token/device-token.module';
import { AppVersionsModule } from './app-versions/app-versions.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    DeviceTokenModule,
    AppVersionsModule,
    SubscriptionModule,
  ],
  controllers: [ApiController],
  providers: [ApiService],
  exports: [ApiService],
})
export class ApiModule {}
