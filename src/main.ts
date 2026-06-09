import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';

import { GlobalExceptionFilter } from './common/filters';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('MAIN');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('app.port', 4002);
  const NODE_ENV = configService.get<string>('app.nodeEnv', 'development');
  const TIMEZONE = configService.get<string>(
    'app.timezone',
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const FRONTEND_URL = configService.get<string>(
    'app.frontendUrl',
    'http://localhost:3000',
  );

  // Configurar CORS
  app.enableCors({
    origin: FRONTEND_URL,
    credentials: true,
  });

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(PORT);

  logger.debug(
    `\nRunning on\nPort: [${PORT}]\nenvironment: [${NODE_ENV}]\nTimezone: [${TIMEZONE}]`,
  );
}
bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
  process.exit(1);
});
