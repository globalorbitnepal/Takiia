'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ user: { displayName: string; bio?: string | null } }>('/auth/me')
      .then((res) => {
        setDisplayName(res.user.displayName);
        setBio(res.user.bio ?? '');
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      await apiFetch('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ displayName, bio }),
      });
      setMessage('Profile saved.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed');
    }
  }

  return (
    <main className="container" style={{ padding: '2rem 0', maxWidth: 520 }}>
      <h1>Account settings</h1>
      <form
        className="card"
        style={{ padding: '1rem', display: 'grid', gap: '0.8rem' }}
        onSubmit={save}
      >
        <label>
          <span className="muted">Display name</span>
          <input
            className="input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>
        <label>
          <span className="muted">Bio</span>
          <textarea
            className="input"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </label>
        <button className="btn" type="submit">
          Save
        </button>
        {message ? <p className="muted">{message}</p> : null}
      </form>
    </main>
  );
}
