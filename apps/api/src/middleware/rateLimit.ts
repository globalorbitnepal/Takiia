import rateLimit from 'express-rate-limit';

const relaxed = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: relaxed ? 10_000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests' } },
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: relaxed ? 10_000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
});
