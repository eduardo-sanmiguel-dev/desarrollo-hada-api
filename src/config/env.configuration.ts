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
      code: process.env.SEED_FIRST_USER_CODE || '20090',
    },
  },
  auth: {
    accessTokenSecret: process.env.AUTH_ACCESS_TOKEN_SECRET || '',
    accessTokenExpiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshTokenSecret: process.env.AUTH_REFRESH_TOKEN_SECRET || '',
    refreshTokenExpiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN || '7d',
    accessTokenCookieName:
      process.env.AUTH_ACCESS_TOKEN_COOKIE_NAME || 'access_token',
    refreshTokenCookieName:
      process.env.AUTH_REFRESH_TOKEN_COOKIE_NAME || 'refresh_token',
    cookieDomain: process.env.AUTH_COOKIE_DOMAIN || '',
    cookiePath: process.env.AUTH_COOKIE_PATH || '/',
    cookieSecure: process.env.AUTH_COOKIE_SECURE || 'false',
    cookieSameSite: process.env.AUTH_COOKIE_SAME_SITE || 'lax',
    credentialsCryptoKey: process.env.AUTH_CREDENTIALS_CRYPTO_KEY || '',
  },
}));
