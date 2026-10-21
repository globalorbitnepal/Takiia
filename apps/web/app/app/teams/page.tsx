'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

export default function TeamsPage() {
  const [workspaces, setWorkspaces] = useState<unknown[]>([]);
  useEffect(() => {
    apiFetch<{ workspaces: unknown[] }>('/workspaces').then((r) => setWorkspaces(r.workspaces));
  }, []);
  return (
    <div>
      <h1 className="h2">Teams & workspaces</h1>
      <p className="muted">Members and roles for your workspace.</p>
      <pre className="card" style={{ padding: '1rem', fontSize: 13 }}>
        {JSON.stringify(workspaces, null, 2)}
      </pre>
    </div>
  );
}
