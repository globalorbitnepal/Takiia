import { z } from 'zod';

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.string().min(1),
  timestamp: z.string().datetime(),
  version: z.string().optional(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export function createHealthPayload(service: string, version?: string): HealthResponse {
  return healthResponseSchema.parse({
    status: 'ok',
    service,
    timestamp: new Date().toISOString(),
    ...(version ? { version } : {}),
  });
}
