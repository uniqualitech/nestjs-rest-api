import { Module } from '@nestjs/common';
import { AppVersionsService } from './app-versions.service';
import { AppVersionsController } from './app-versions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppVersions } from './entities/app-versions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppVersions])],
  controllers: [AppVersionsController],
  providers: [AppVersionsService],
})
export class AppVersionsModule {}
