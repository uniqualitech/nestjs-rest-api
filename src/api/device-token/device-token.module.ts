import { Module } from '@nestjs/common';
import { DeviceTokenService } from './device-token.service';
import { DeviceTokenController } from './device-token.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceToken } from './entities/device-token.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceToken]), UserModule],
  controllers: [DeviceTokenController],
  providers: [DeviceTokenService],
  exports: [DeviceTokenService],
})
export class DeviceTokenModule {}
