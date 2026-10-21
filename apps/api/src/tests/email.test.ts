import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sendMail = vi.fn(async () => ({ messageId: 'test' }));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({ sendMail }),
  },
}));

describe('email delivery', () => {
  beforeEach(() => {
    sendMail.mockClear();
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('logs in development when SMTP is not configured', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('SMTP_HOST', '');
    const { sendEmail } = await import('../services/email.js');
    const logSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    await sendEmail('user@example.com', 'Hello', 'Body text');
    expect(sendMail).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
