import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4002,
  timezone: process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone,
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'postgres',
  },
  hallazgosDatabase: {
    host: process.env.HALLAZGOS_DB_HOST || '127.0.0.1',
    port: Number(process.env.HALLAZGOS_DB_PORT) || 5432,
    username: process.env.HALLAZGOS_DB_USERNAME || 'postgres',
    password: process.env.HALLAZGOS_DB_PASSWORD || '',
    name: process.env.HALLAZGOS_DB_NAME || 'postgres',
  },
  seed: {
    firstUser: {
      name: process.env.SEED_FIRST_USER_NAME || 'Administrador',
      email: process.env.SEED_FIRST_USER_EMAIL || 'admin@hada.local',
      password: process.env.SEED_FIRST_USER_PASSWORD || 'ChangeMe123!',
    },
  },
}));
