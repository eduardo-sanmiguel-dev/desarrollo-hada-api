import { existsSync } from 'fs';
import { join } from 'path';

import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';
import { TemplateAdapter } from '@nestjs-modules/mailer/dist/interfaces/template-adapter.interface';
import { MailerOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-options.interface';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

import { MailService } from './mail.service';

const TypedMailerModule = MailerModule as unknown as {
  forRootAsync: (options: MailerAsyncOptions) => DynamicModule;
};

const HandlebarsTemplateAdapter = HandlebarsAdapter as unknown as {
  new (): TemplateAdapter;
};

const resolveTemplatesDir = (): string => {
  const distTemplateDir = join(__dirname, 'templates');
  const srcTemplateDir = join(
    process.cwd(),
    'src',
    'modules',
    'mail',
    'templates',
  );

  if (existsSync(distTemplateDir)) {
    return distTemplateDir;
  }

  return srcTemplateDir;
};

const createMailerOptions = (configService: ConfigService): MailerOptions => ({
  transport: {
    host: configService.getOrThrow<string>('MAIL_HOST'),
    port: 587,
    secure: false,
    auth: {
      user: configService.getOrThrow<string>('MAIL_USER'),
      pass: configService.getOrThrow<string>('MAIL_PASSWORD'),
    },
    tls: {
      rejectUnauthorized: false,
    },
  },
  template: {
    dir: resolveTemplatesDir(),
    adapter: new HandlebarsTemplateAdapter(),
    options: {
      strict: true,
    },
  },
});

@Global()
@Module({
  imports: [
    TypedMailerModule.forRootAsync({
      useFactory: (configService: ConfigService) =>
        createMailerOptions(configService),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
