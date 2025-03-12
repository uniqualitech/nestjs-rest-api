import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import fs from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import basicAuth from 'express-basic-auth';
import firebaseAdmin from 'firebase-admin';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import session from 'express-session';
import morgan from 'morgan';
import { AllExceptionsFilter } from './helpers/exceptions-filter.helper';

async function bootstrap() {
  // SSL certificate path
  const isSecure = process.env.IS_SECURE === 'true';
  let httpsOptions: { key: Buffer; cert: Buffer; ca: Buffer[] };

  if (isSecure) {
    const certBasePath = process.env.SSL_CERT_BASE_PATH;
    httpsOptions = {
      key: fs.readFileSync(`${certBasePath}/privkey.pem`),
      cert: fs.readFileSync(`${certBasePath}/cert.pem`),
      ca: [
        fs.readFileSync(`${certBasePath}/cert.pem`),
        fs.readFileSync(`${certBasePath}/fullchain.pem`),
      ],
    };
  }

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    isSecure ? { httpsOptions } : {},
  );

  const configService = app.get(ConfigService);

  /**
   * Swagger Documentation
   */
  app.use(
    ['/api/documentation'],
    basicAuth({
      challenge: true,
      users: { Basic_SetUp: '$$Basic+setup_3_MAR/2025' },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle(configService.get<string>('APP_NAME'))
    .setDescription(
      `APIs for ${configService.get<string>('APP_NAME')} native app.`,
    )
    .addServer(process.env.APP_URL)
    .setVersion(process.env.API_VERSION)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/documentation', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customfavIcon: `${configService.get<string>('APP_URL')}/images/favicon.ico`,
    customSiteTitle: 'API Documentation',
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.useStaticAssets(join(__dirname, '..', 'src/views'));
  app.setBaseViewsDir(join(__dirname, '..', 'src/views'));
  app.setViewEngine('ejs');

  app.use(morgan('dev'));

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  const allowedOrigins = process.env.CORS_DOMAINS || '';

  const allowedOriginsArray = allowedOrigins
    .split(',')
    .map((item) => item.trim());

  app.enableCors({
    origin: allowedOriginsArray,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    credentials: true,
  });

  // Session
  app.use(
    session({
      secret: configService.get('APP_KEY'),
      resave: false,
      saveUninitialized: true,
    }),
  );

  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.applicationDefault(),
  });

  await app.listen(configService.get('PORT', 3080), () => {
    console.log(`Application running on: ${configService.get('APP_URL')}`);
  });
}
bootstrap();
