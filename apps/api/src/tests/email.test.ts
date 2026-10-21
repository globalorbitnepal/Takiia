import { describe, expect, it, vi } from 'vitest';

const sendMail = vi.fn(async () => ({ messageId: 'test' }));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({ sendMail }),
  },
}));

describe('email delivery', () => {
  it('logs in development when SMTP is not configured', async () => {
    const { sendEmail } = await import('../services/email.js');
    const logSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    await sendEmail('user@example.com', 'Hello', 'Body text');
    expect(sendMail).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
