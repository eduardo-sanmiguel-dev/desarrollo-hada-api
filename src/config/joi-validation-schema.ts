import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(4002),
  TZ: Joi.string().required(),
  DB_HOST: Joi.string().hostname().required(),
  DB_PORT: Joi.number().port().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
  DB_NAME: Joi.string().required(),
  HALLAZGOS_DB_HOST: Joi.string().hostname().required(),
  HALLAZGOS_DB_PORT: Joi.number().port().required(),
  HALLAZGOS_DB_USERNAME: Joi.string().required(),
  HALLAZGOS_DB_PASSWORD: Joi.string().allow('').required(),
  HALLAZGOS_DB_NAME: Joi.string().required(),
  SEED_FIRST_USER_NAME: Joi.string().min(2).required(),
  SEED_FIRST_USER_EMAIL: Joi.string().email().required(),
  SEED_FIRST_USER_PASSWORD: Joi.string().min(8).required(),
  AUTH_ACCESS_TOKEN_SECRET: Joi.string().min(20).required(),
  AUTH_ACCESS_TOKEN_EXPIRES_IN: Joi.string()
    .pattern(/^\d+[smhd]$/)
    .required(),
  AUTH_REFRESH_TOKEN_SECRET: Joi.string().min(20).required(),
  AUTH_REFRESH_TOKEN_EXPIRES_IN: Joi.string()
    .pattern(/^\d+[smhd]$/)
    .required(),
  AUTH_ACCESS_TOKEN_COOKIE_NAME: Joi.string().required(),
  AUTH_REFRESH_TOKEN_COOKIE_NAME: Joi.string().required(),
  AUTH_COOKIE_DOMAIN: Joi.string().allow('').required(),
  AUTH_COOKIE_PATH: Joi.string().required(),
  AUTH_COOKIE_SECURE: Joi.string().valid('true', 'false').required(),
  AUTH_COOKIE_SAME_SITE: Joi.string().valid('strict', 'lax', 'none').required(),
  AUTH_CREDENTIALS_CRYPTO_KEY: Joi.string().min(16).required(),
});
