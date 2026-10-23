'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { AuthPageFrame } from '../../components/marketing/AuthPageFrame';

function safeInAppPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/app';
  return next;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = safeInAppPath(searchParams.get('next'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      window.location.href = nextPath;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageFrame title="Sign in">
      <form
        className="card"
        style={{ padding: '1.2rem', display: 'grid', gap: '0.8rem' }}
        onSubmit={onSubmit}
      >
        <label>
          <span className="muted">Email</span>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label>
          <span className="muted">Password</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error ? (
          <p style={{ color: 'var(--danger)' }} role="alert">
            {error}
          </p>
        ) : null}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="muted" style={{ marginTop: '1rem', fontSize: 14 }}>
        <Link href="/forgot-password">Forgot password?</Link>
      </p>
      <p className="muted" style={{ marginTop: '0.5rem' }}>
        No account? <Link href="/signup">Create one</Link>
      </p>
    </AuthPageFrame>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthPageFrame title="Sign in">
          <p className="muted" role="status">
            Loading…
          </p>
        </AuthPageFrame>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
