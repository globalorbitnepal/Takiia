'use client';

import Link from 'next/link';

export default function AppSettingsPage() {
  return (
    <div>
      <h1 className="h2">Settings</h1>
      <p className="muted">Profile settings are available on the global settings route.</p>
      <Link className="btn secondary" href="/settings">
        Open profile settings
      </Link>
    </div>
  );
}
