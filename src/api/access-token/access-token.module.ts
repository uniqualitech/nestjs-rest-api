import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { AccessToken } from './entities/access-token.entity';
import { AccessTokenService } from './access-token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccessToken]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('APP_KEY'),
        signOptions: { expiresIn: '28 days' },
      }),
      inject: [ConfigService],
    }),
    UserModule,
  ],
  providers: [AccessTokenService],
  exports: [AccessTokenService],
})
export class AccessTokenModule {}
