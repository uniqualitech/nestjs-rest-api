import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiModule } from './api/api.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
} from 'nestjs-i18n';
import { dataSourceOptions } from './database/data-source';
import { AdminModule } from './admin/admin.module';
import { Languages } from './constants/app.constant';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),

    // Config module
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      cache: true,
    }),

    // Mailer config
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: +configService.get<number>('MAIL_PORT'),
          ignoreTLS: configService.get<string>('MAIL_ENCRYPTION') !== 'tls',
          secure: configService.get<string>('MAIL_ENCRYPTION') !== 'tls',
          auth: {
            user: configService.get<string>('MAIL_USERNAME'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: { from: configService.get<string>('MAIL_FROM_ADDRESS') },
        template: {
          dir: join(__dirname, '/views/emails'),
          adapter: new EjsAdapter(),
          options: { strict: false },
        },
      }),
    }),

    // Cron config
    ScheduleModule.forRoot(),

    // Localization config
    I18nModule.forRoot({
      fallbackLanguage: Languages.EN,
      loaderOptions: { path: join(__dirname, '/i18n/'), watch: true },
      typesOutputPath: join(__dirname, '../src/generated/i18n.generated.ts'),
      resolvers: [
        { use: HeaderResolver, options: ['Accept-Language'] },
        AcceptLanguageResolver,
      ],
    }),

    // Modules import
    ApiModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
