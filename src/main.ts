import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('MAIN');

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('app.port', 4002);
  const NODE_ENV = configService.get<string>('app.nodeEnv', 'development');
  const TIMEZONE = configService.get<string>(
    'app.timezone',
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  await app.listen(PORT);

  logger.debug(
    `\n\nRunning on\n\nPort: [${PORT}]\n\nenvironment: [${NODE_ENV}]\n\nTimezone: [${TIMEZONE}]`,
  );
}
bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
  process.exit(1);
});
