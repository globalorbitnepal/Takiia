'use client';

import Link from 'next/link';
import { useState } from 'react';
import { apiFetch } from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    }
  }

  return (
    <main className="container" style={{ padding: '3rem 0', maxWidth: 480 }}>
      <h1>Reset password</h1>
      {sent ? (
        <p className="muted">If an account exists for that email, a reset link has been sent.</p>
      ) : (
        <form
          className="card"
          style={{ padding: '1rem', display: 'grid', gap: '0.8rem' }}
          onSubmit={onSubmit}
        >
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}
          <button className="btn" type="submit">
            Send reset link
          </button>
        </form>
      )}
      <p className="muted" style={{ marginTop: '1rem' }}>
        <Link href="/login">Back to sign in</Link>
      </p>
    </main>
  );
}
