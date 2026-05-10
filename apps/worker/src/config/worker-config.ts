import { z } from 'zod';

const workerConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  SUPPORT_DISPATCH_ENABLED: z.coerce.boolean().default(false)
});

export type WorkerConfig = z.infer<typeof workerConfigSchema>;

export function loadWorkerConfig(env: NodeJS.ProcessEnv = process.env): WorkerConfig {
  const config = workerConfigSchema.parse(env);
  if (config.SUPPORT_DISPATCH_ENABLED) {
    throw new Error('Real support dispatch is prohibited until UOW-08');
  }
  return config;
}
