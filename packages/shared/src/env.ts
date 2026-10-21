import { z } from 'zod';

/** Public API base URL safe for web and mobile clients (no secrets). */
export const publicApiUrlSchema = z.string().url();

export type PublicApiUrl = z.infer<typeof publicApiUrlSchema>;
