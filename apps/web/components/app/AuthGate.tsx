'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

type GateState = 'loading' | 'ready' | 'redirecting';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GateState>('loading');

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ user: { id: string } }>('/auth/me')
      .then(() => {
        if (!cancelled) setState('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setState('redirecting');
        const next = encodeURIComponent(
          typeof window !== 'undefined' ? window.location.pathname : '/app',
        );
        window.location.href = `/login?next=${next}`;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'ready') {
    return <>{children}</>;
  }

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <p className="muted" role="status">
        {state === 'redirecting' ? 'Redirecting to sign in…' : 'Loading your workspace…'}
      </p>
    </div>
  );
}
