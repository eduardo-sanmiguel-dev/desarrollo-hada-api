import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4002,
  timezone: process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone,
}));
