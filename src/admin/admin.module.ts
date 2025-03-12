import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/api/user/entities/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AccessTokenModule } from 'src/api/access-token/access-token.module';
import { RefreshTokensModule } from 'src/api/refresh-token/refresh-token.module';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AccessTokenModule,
    RefreshTokensModule,
    UserModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
