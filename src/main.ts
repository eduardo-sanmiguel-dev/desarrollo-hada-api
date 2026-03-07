import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('MAIN');

  const app = await NestFactory.create(AppModule);
  const PORT = Number(process.env.PORT) || 4002;
  const NODE_ENV = process.env.NODE_ENV || 'development';
  await app.listen(PORT);

  logger.debug(
    `\n\nRunning on\n\nPort: [${PORT}]\n\nenvironment: [${NODE_ENV}]\n\nTimezone: [${Intl.DateTimeFormat().resolvedOptions().timeZone}]`,
  );
}
bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
  process.exit(1);
});
