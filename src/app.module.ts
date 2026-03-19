import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { PersonnelRequisitionsModule } from './modules/personnel-requisitions/personnel-requisitions.module';
import { ReasonsForRequestModule } from './modules/reasons-for-request/reasons-for-request.module';
import { WorkplacesModule } from './modules/workplaces/workplaces.module';
import { JoiValidationSchema } from './config/joi-validation-schema';
import { AuthTokenMiddleware } from './auth/auth-token.middleware';
import { UsersModule } from './modules/users/users.module';
import { AreasModule } from './modules/areas/areas.module';
import EnvConfiguration from './config/env.configuration';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { MailModule } from './modules/mail/mail.module';
import { PositionConfigurationsModule } from './modules/position-configurations/position-configurations.module';

const env = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${env}`, '.env'],
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('app.database.host', '127.0.0.1'),
        port: configService.get<number>('app.database.port', 5432),
        username: configService.get<string>(
          'app.database.username',
          'postgres',
        ),
        password: configService.get<string>('app.database.password', ''),
        database: configService.get<string>('app.database.name', 'postgres'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TypeOrmModule.forRootAsync({
      name: 'hallazgos',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        name: 'hallazgos',
        type: 'postgres' as const,
        host: configService.get<string>(
          'app.hallazgosDatabase.host',
          '127.0.0.1',
        ),
        port: configService.get<number>('app.hallazgosDatabase.port', 5432),
        username: configService.get<string>(
          'app.hallazgosDatabase.username',
          'postgres',
        ),
        password: configService.get<string>(
          'app.hallazgosDatabase.password',
          '',
        ),
        database: configService.get<string>(
          'app.hallazgosDatabase.name',
          'postgres',
        ),
        autoLoadEntities: false,
        synchronize: false,
      }),
    }),
    MailModule,
    AuthModule,
    UsersModule,
    AreasModule,
    WorkplacesModule,
    ReasonsForRequestModule,
    PersonnelRequisitionsModule,
    EmployeesModule,
    ProjectsModule,
    PositionConfigurationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthTokenMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/refresh-token', method: RequestMethod.POST },
        { path: 'auth/logout', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
