import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { JoiValidationSchema } from './config/joi-validation-schema';
import EnvConfiguration from './config/env.configuration';

const env = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${env}`, '.env'],
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
