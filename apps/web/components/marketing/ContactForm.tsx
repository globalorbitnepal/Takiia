'use client';

import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    const form = e.currentTarget;
    const data = new FormData(form);
    const body = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      subject: String(data.get('subject') ?? '').trim(),
      text: String(data.get('text') ?? '').trim(),
    };
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setStatus('error');
        setMessage(json.error ?? 'Could not send your message. Try again later.');
        return;
      }
      setStatus('ok');
      setMessage('Thanks — your message was received.');
      form.reset();
    } catch {
      setStatus('error');
      setMessage('Network error. Check your connection and try again.');
    }
  }

  return (
    <form className="contact-form card glass" onSubmit={onSubmit} noValidate>
      <label>
        Name
        <input className="input" name="name" required minLength={2} maxLength={120} />
      </label>
      <label>
        Email
        <input className="input" type="email" name="email" required maxLength={200} />
      </label>
      <label>
        Subject
        <input className="input" name="subject" required minLength={3} maxLength={200} />
      </label>
      <label>
        Message
        <textarea className="input" name="text" required rows={5} minLength={10} maxLength={5000} />
      </label>
      <button className="btn" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending…' : 'Send message'}
      </button>
      {message ? (
        <p className={status === 'error' ? 'form-error' : 'form-success'} role="status">{message}</p>
      ) : null}
    </form>
  );
}
