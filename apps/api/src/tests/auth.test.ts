import { describe, expect, it } from 'vitest';
import { normalizeEmail } from '../lib/crypto.js';
import { hashPassword, verifyPassword } from '../lib/passwords.js';

describe('auth utilities', () => {
  it('normalizes email', () => {
    expect(normalizeEmail('  Test@Example.COM ')).toBe('test@example.com');
  });

  it('hashes and verifies passwords', async () => {
    const hash = await hashPassword('correct horse battery staple');
    expect(await verifyPassword('correct horse battery staple', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});
