'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '../../lib/api';

function ResetPasswordInner() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    }
  }

  return (
    <main className="container" style={{ padding: '3rem 0', maxWidth: 480 }}>
      <h1>Choose a new password</h1>
      {done ? (
        <p className="muted">
          Password updated. <Link href="/login">Sign in</Link>
        </p>
      ) : (
        <form
          className="card"
          style={{ padding: '1rem', display: 'grid', gap: '0.8rem' }}
          onSubmit={onSubmit}
        >
          <input
            className="input"
            type="password"
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}
          <button className="btn" type="submit">
            Update password
          </button>
        </form>
      )}
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="container">Loading…</main>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
