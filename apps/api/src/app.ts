import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimit } from './middleware/rateLimit.js';
import { csrfProtection, registerCsrfRoute } from './middleware/csrf.js';
import { registerHealthRoutes } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { conversationsRouter } from './routes/conversations.js';
import { webrtcRouter } from './routes/webrtc.js';
import { usersRouter } from './routes/users.js';
import { attachmentsRouter } from './routes/attachments.js';
import { callsRouter } from './routes/calls.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser(env.sessionSecret));
  app.use(apiRateLimit);

  registerHealthRoutes(app);
  registerCsrfRoute(app);

  app.use(csrfProtection);
  app.use('/auth', authRouter);
  app.use('/conversations', conversationsRouter);
  app.use('/webrtc', webrtcRouter);
  app.use('/users', usersRouter);
  app.use('/attachments', attachmentsRouter);
  app.use('/calls', callsRouter);

  app.use(errorHandler);
  return app;
}
