import 'dotenv/config';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from './config/env.js';
import { createApp } from './app.js';
import { registerSocketHandlers } from './socket/index.js';

const app = createApp();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

registerSocketHandlers(io);

function shutdown(signal: string) {
  console.log(`[api] ${signal} received, closing...`);
  httpServer.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

httpServer.listen(env.port, env.host, () => {
  console.log(`[api] listening on http://${env.host}:${env.port}`);
});
