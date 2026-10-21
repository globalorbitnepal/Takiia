import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { createServer, type Server as HttpServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import request from 'supertest';
import { csrfProtection, registerCsrfRoute } from '../middleware/csrf.js';
import { setSessionCookie } from '../middleware/auth.js';
import { errorHandler } from '../middleware/errorHandler.js';

describe('csrf protection', () => {
  let httpServer: HttpServer;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use(cookieParser('dev-only-change-me-in-production-32chars!!'));
    registerCsrfRoute(app);
    app.use(csrfProtection);
    app.post('/auth/register', (req, res) => {
      setSessionCookie(res, 'session-token-abcdefghijklmnopqrstuvwxyz012345');
      res.status(201).json({ ok: true });
    });
    app.post('/auth/verify-email', (_req, res) => {
      res.json({ ok: true });
    });
    app.post('/conversations/direct', (_req, res) => {
      res.status(201).json({ ok: true });
    });
    app.use(errorHandler);

    httpServer = createServer(app);
    await new Promise<void>((resolve) => httpServer.listen(0, '127.0.0.1', () => resolve()));
    const port = (httpServer.address() as AddressInfo).port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      httpServer.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it('reuses the csrf cookie after login and accepts mutating requests', async () => {
    const agent = request.agent(baseUrl);
    const first = await agent.get('/auth/csrf');
    expect(first.status).toBe(200);
    const token = first.body.csrfToken as string;

    const register = await agent.post('/auth/register').set('x-csrf-token', token).send({});
    expect(register.status, JSON.stringify(register.body)).toBe(201);

    const second = await agent.get('/auth/csrf');
    expect(second.body.csrfToken).toBe(token);

    const verify = await agent
      .post('/auth/verify-email')
      .set('x-csrf-token', token)
      .send({ token: 'abcdefghij' });
    expect(verify.status, JSON.stringify(verify.body)).toBe(200);

    const conv = await agent.post('/conversations/direct').set('x-csrf-token', token).send({});
    expect(conv.status, JSON.stringify(conv.body)).toBe(201);
  });

  it('rejects mutating requests without a matching csrf cookie', async () => {
    const agent = request.agent(baseUrl);
    const res = await agent
      .post('/conversations/direct')
      .set('x-csrf-token', 'not-a-cookie')
      .send({});
    expect(res.status).toBe(403);
    expect(res.body.error?.code).toBe('CSRF_FAILED');
  });
});
