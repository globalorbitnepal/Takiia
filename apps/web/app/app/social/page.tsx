'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

type Workspace = { id: string; name: string };
type Account = { id: string; platform: string; status: string; displayName: string | null };
type Post = { id: string; body: string; status: string; scheduledFor: string | null };

export default function SocialPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ workspace: Workspace | null }>('/workspaces/primary').then((res) => {
      if (!res.workspace) return;
      setWorkspace(res.workspace);
      apiFetch<{ accounts: Account[] }>(`/social/${res.workspace.id}/accounts`).then((a) =>
        setAccounts(a.accounts),
      );
      apiFetch<{ posts: Post[] }>(`/social/${res.workspace.id}/posts`).then((p) =>
        setPosts(p.posts),
      );
    });
  }, []);

  async function connect(platform: 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK') {
    if (!workspace) return;
    try {
      const res = await apiFetch<{ message: string }>(`/social/${workspace.id}/accounts/connect`, {
        method: 'POST',
        body: JSON.stringify({ platform }),
      });
      setMessage(res.message);
      const refreshed = await apiFetch<{ accounts: Account[] }>(`/social/${workspace.id}/accounts`);
      setAccounts(refreshed.accounts);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Connect failed');
    }
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <h1 className="h2" style={{ margin: 0 }}>
        Social publishing
      </h1>
      <p className="muted">
        OAuth structure and publishing jobs are in place. Live Facebook, Instagram, and TikTok
        publishing requires platform app credentials and approval.
      </p>
      {message ? <p className="muted">{message}</p> : null}
      <section className="card" style={{ padding: '1rem' }}>
        <h3>Connected accounts</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn secondary" type="button" onClick={() => connect('FACEBOOK')}>
            Connect Facebook
          </button>
          <button className="btn secondary" type="button" onClick={() => connect('INSTAGRAM')}>
            Connect Instagram
          </button>
          <button className="btn secondary" type="button" onClick={() => connect('TIKTOK')}>
            Connect TikTok
          </button>
        </div>
        <ul>
          {accounts.map((a) => (
            <li key={a.id}>
              {a.platform} — {a.status} {a.displayName ? `(${a.displayName})` : ''}
            </li>
          ))}
        </ul>
      </section>
      <section className="card" style={{ padding: '1rem' }}>
        <h3>Composer</h3>
        <textarea
          className="input"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <p className="muted" style={{ fontSize: 13 }}>
          Scheduling to connected accounts is available once accounts show status CONNECTED after
          OAuth is configured on the server.
        </p>
      </section>
      <section className="card" style={{ padding: '1rem' }}>
        <h3>Queue</h3>
        {posts.length === 0 ? <p className="muted">No posts yet.</p> : null}
        <ul>
          {posts.map((p) => (
            <li key={p.id}>
              {p.status}: {p.body.slice(0, 120)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
