import type { NextFunction, Request, Response } from 'express';

function bigintReplacer(_key: string, value: unknown): unknown {
  return typeof value === 'bigint' ? value.toString() : value;
}

export function jsonBigIntMiddleware(_req: Request, res: Response, next: NextFunction): void {
  const originalJson = res.json.bind(res);
  res.json = (body?: unknown) => {
    if (body === undefined) {
      return originalJson(body);
    }
    return originalJson(JSON.parse(JSON.stringify(body, bigintReplacer)));
  };
  next();
}
