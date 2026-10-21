import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1).optional(),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:8081'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[api] Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const corsOrigins = parsed.data.CORS_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  databaseUrl: parsed.data.DATABASE_URL,
  corsOrigins,
};
