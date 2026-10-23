'use client';

import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container section" style={{ maxWidth: 520 }}>
      <h1 className="h2">Something went wrong</h1>
      <p className="muted">
        {error.message || 'An unexpected error occurred. You can try again or return home.'}
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button type="button" className="btn" onClick={() => reset()}>
          Try again
        </button>
        <Link className="btn secondary" href="/">
          Home
        </Link>
      </div>
    </main>
  );
}
