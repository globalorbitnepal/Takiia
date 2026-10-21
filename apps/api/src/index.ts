import 'dotenv/config';
import { createServer } from 'node:http';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';
import { createHealthPayload } from '@takiia/shared';
import { env } from './config/env.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerSocketHandlers } from './socket/index.js';

const app = express();

app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());

registerHealthRoutes(app);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.corsOrigins,
    methods: ['GET', 'POST'],
  },
});

registerSocketHandlers(io);

io.on('connection', (socket) => {
  socket.emit('takiia:ready', createHealthPayload('socket.io'));
});

httpServer.listen(env.port, () => {
  console.log(`[api] listening on http://localhost:${env.port}`);
});
