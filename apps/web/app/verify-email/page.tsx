'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '../../lib/api';

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get('token');
  const [message, setMessage] = useState('Verifying your email…');
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage('Missing verification token.');
      return;
    }
    apiFetch('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) })
      .then(() => {
        setOk(true);
        setMessage('Email verified. You can sign in and start messaging.');
      })
      .catch((err) => setMessage(err instanceof Error ? err.message : 'Verification failed'));
  }, [token]);

  return (
    <main className="container" style={{ padding: '3rem 0', maxWidth: 520 }}>
      <h1>Email verification</h1>
      <p className={ok ? 'muted' : ''} style={{ color: ok ? undefined : 'var(--danger)' }}>
        {message}
      </p>
      <Link className="btn" href="/login">
        Go to sign in
      </Link>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<main className="container">Loading…</main>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
