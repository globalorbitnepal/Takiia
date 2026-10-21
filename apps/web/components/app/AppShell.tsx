'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/app', label: 'Overview' },
  { href: '/app/inbox', label: 'Inbox' },
  { href: '/app/meetings', label: 'Meetings' },
  { href: '/app/social', label: 'Social' },
  { href: '/app/teams', label: 'Teams' },
  { href: '/app/events', label: 'Events' },
  { href: '/app/files', label: 'Files' },
  { href: '/app/billing', label: 'Subscription' },
  { href: '/app/settings', label: 'Settings' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Application navigation">
        <div style={{ padding: '0.5rem 0.75rem 1rem' }}>
          <Link
            href="/"
            style={{ fontWeight: 700, color: 'var(--primary-deep)', fontSize: '1.2rem' }}
          >
            Takiia
          </Link>
        </div>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? 'active' : undefined}
          >
            {link.label}
          </Link>
        ))}
      </aside>
      <main className="app-main">{children}</main>
    </div>
  );
}
