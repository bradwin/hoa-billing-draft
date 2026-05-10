import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  APP_PUBLIC_URL: z.string().url(),
  API_PUBLIC_URL: z.string().url(),
  CORS_ALLOWED_ORIGINS: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  DATABASE_SSL_MODE: z.enum(['disable', 'require', 'verify-full']).default('disable'),
  COOKIE_NAME: z.string().min(3).max(80).default('hoa_session'),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  PRIVILEGED_IDLE_TIMEOUT_MINUTES: z.coerce.number().int().min(5).max(60).default(15),
  PRIVILEGED_ABSOLUTE_TIMEOUT_HOURS: z.coerce.number().int().min(1).max(24).default(8),
  STANDARD_IDLE_TIMEOUT_MINUTES: z.coerce.number().int().min(15).max(240).default(60),
  STANDARD_ABSOLUTE_TIMEOUT_HOURS: z.coerce.number().int().min(1).max(72).default(24)
});

export type AppConfig = z.infer<typeof configSchema> & {
  corsAllowedOrigins: string[];
};

export function loadAppConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = configSchema.parse(env);
  if (parsed.NODE_ENV === 'production') {
    if (!parsed.COOKIE_SECURE) {
      throw new Error('Production requires secure cookies');
    }
    if (parsed.DATABASE_SSL_MODE === 'disable') {
      throw new Error('Production requires PostgreSQL TLS');
    }
  }
  return {
    ...parsed,
    corsAllowedOrigins: parsed.CORS_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  };
}
