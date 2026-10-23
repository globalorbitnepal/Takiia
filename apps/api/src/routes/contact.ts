import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import { sendEmail } from '../services/email.js';

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().min(3).max(200),
  text: z.string().trim().min(10).max(5000),
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many contact requests. Try again later.' },
});

export const contactRouter = Router();

contactRouter.post('/', contactLimiter, async (req, res, next) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, 'Invalid contact form data');
    }
    const inbox = env.contactInboxEmail;
    if (!inbox) {
      throw new AppError(
        503,
        'Contact form is not configured yet. Set CONTACT_INBOX_EMAIL on the server.',
      );
    }
    const { name, email, subject, text } = parsed.data;
    const body = `From: ${name} <${email}>\n\n${text}`;
    await sendEmail(inbox, `[Takiia contact] ${subject}`, body);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
