import { z } from 'zod';

function emptyToUndefined(value: unknown): unknown {
  return value === '' ? undefined : value;
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(4000)),
  DATABASE_URL: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:8081'),
  SESSION_SECRET: z.preprocess(
    emptyToUndefined,
    z.string().min(32).default('dev-only-change-me-in-production-32chars!!'),
  ),
  COOKIE_DOMAIN: z.preprocess(emptyToUndefined, z.string().optional()),
  PUBLIC_WEB_URL: z.preprocess(emptyToUndefined, z.string().url().default('http://localhost:3000')),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_UPLOAD_BYTES: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number()
      .int()
      .positive()
      .default(10 * 1024 * 1024),
  ),
  SMTP_HOST: z.preprocess(emptyToUndefined, z.string().optional()),
  SMTP_PORT: z.preprocess(emptyToUndefined, z.coerce.number().optional()),
  SMTP_USER: z.preprocess(emptyToUndefined, z.string().optional()),
  SMTP_PASS: z.preprocess(emptyToUndefined, z.string().optional()),
  EMAIL_FROM: z.preprocess(emptyToUndefined, z.string().optional()),
  STUN_URLS: z.string().default('stun:stun.l.google.com:19302'),
  TURN_URLS: z.preprocess(emptyToUndefined, z.string().optional()),
  TURN_USERNAME: z.preprocess(emptyToUndefined, z.string().optional()),
  TURN_CREDENTIAL: z.preprocess(emptyToUndefined, z.string().optional()),
  FACEBOOK_APP_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  FACEBOOK_APP_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  TIKTOK_CLIENT_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  TIKTOK_CLIENT_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  PAYMENT_PROVIDER: z.preprocess(emptyToUndefined, z.string().optional()),
  CONTACT_INBOX_EMAIL: z.preprocess(emptyToUndefined, z.string().email().optional()),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.flatten().fieldErrors;
  throw new Error(`[api] Invalid environment configuration: ${JSON.stringify(details)}`);
}

const corsOrigins = parsed.data.CORS_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  host: parsed.data.HOST,
  port: parsed.data.PORT,
  databaseUrl: parsed.data.DATABASE_URL,
  corsOrigins,
  sessionSecret: parsed.data.SESSION_SECRET,
  cookieDomain: parsed.data.COOKIE_DOMAIN,
  publicWebUrl: parsed.data.PUBLIC_WEB_URL,
  uploadDir: parsed.data.UPLOAD_DIR,
  maxUploadBytes: parsed.data.MAX_UPLOAD_BYTES,
  smtp: {
    host: parsed.data.SMTP_HOST,
    port: parsed.data.SMTP_PORT,
    user: parsed.data.SMTP_USER,
    pass: parsed.data.SMTP_PASS,
    from: parsed.data.EMAIL_FROM,
  },
  webrtc: {
    stunUrls: parsed.data.STUN_URLS.split(',')
      .map((u) => u.trim())
      .filter(Boolean),
    turnUrls:
      parsed.data.TURN_URLS?.split(',')
        .map((u) => u.trim())
        .filter(Boolean) ?? [],
    turnUsername: parsed.data.TURN_USERNAME,
    turnCredential: parsed.data.TURN_CREDENTIAL,
  },
  isProduction: parsed.data.NODE_ENV === 'production',
  social: {
    facebookAppId: parsed.data.FACEBOOK_APP_ID,
    facebookAppSecret: parsed.data.FACEBOOK_APP_SECRET,
    tiktokClientKey: parsed.data.TIKTOK_CLIENT_KEY,
    tiktokClientSecret: parsed.data.TIKTOK_CLIENT_SECRET,
  },
  paymentProvider: parsed.data.PAYMENT_PROVIDER ?? 'pending',
  contactInboxEmail: parsed.data.CONTACT_INBOX_EMAIL,
};
