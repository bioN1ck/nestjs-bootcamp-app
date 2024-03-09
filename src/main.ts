import { NestFactory, Reflector } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { config } from 'aws-sdk';

import { AppModule } from './app.module';
// import { ExcludeNullInterceptor } from './utils/exclude-null.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  // To use class-serializer globally
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  // app.useGlobalInterceptors(new ExcludeNullInterceptor());
  app.use(cookieParser());

  const configService = app.get(ConfigService);
  config.update({
    accessKeyId: configService.get('S3_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('S3_SECRET_ACCESS_KEY'),
    region: configService.get('S3_REGION'),
  });

  await app.listen(3000);
}
bootstrap().then();
