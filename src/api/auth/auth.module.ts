import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokensModule } from '../refresh-token/refresh-token.module';
import { User } from '../user/entities/user.entity';
import { AccessTokenModule } from '../access-token/access-token.module';
import { JwtStrategy } from 'src/passport/jwt.strategy';
import { UserModule } from '../user/user.module';
import { DeviceToken } from '../device-token/entities/device-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, DeviceToken]),
    UserModule,
    AccessTokenModule,
    RefreshTokensModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
