import { createServer, type Server as HttpServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Server } from 'socket.io';
import type { Express } from 'express';
import { createApp } from '../app.js';
import { registerSocketHandlers } from '../socket/index.js';

export type TestServer = {
  app: Express;
  httpServer: HttpServer;
  port: number;
  baseUrl: string;
  close: () => Promise<void>;
};

export async function createTestServer(): Promise<TestServer> {
  const app = createApp();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
  });
  registerSocketHandlers(io);

  await new Promise<void>((resolve) => httpServer.listen(0, '127.0.0.1', () => resolve()));
  const port = (httpServer.address() as AddressInfo).port;

  return {
    app,
    httpServer,
    port,
    baseUrl: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise((resolve, reject) => {
        io.close();
        httpServer.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}

export function sessionCookieHeader(setCookie: string[] | string | undefined): string {
  if (!setCookie) return '';
  const list = Array.isArray(setCookie) ? setCookie : [setCookie];
  return list.map((c) => c.split(';')[0]).join('; ');
}
