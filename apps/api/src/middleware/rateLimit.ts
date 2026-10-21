import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.nodeEnv === 'test' ? 10_000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests' } },
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: env.nodeEnv === 'test' ? 10_000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
});
