import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env.js';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!env.smtp.host) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port ?? 587,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    });
  }
  return transporter;
}

export async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const from = env.smtp.from ?? 'noreply@takiia.com';
  const mailer = getTransporter();
  if (!mailer) {
    if (env.nodeEnv === 'production') {
      console.warn('[email] SMTP not configured; message not sent');
      return;
    }
    console.info(`[email:dev] to=${to} subject=${subject}\n${text}`);
    return;
  }
  await mailer.sendMail({ from, to, subject, text });
}
