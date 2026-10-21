'use client';

import Link from 'next/link';
import { useState } from 'react';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="marketing-nav">
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 0',
          gap: '1rem',
        }}
      >
        <Link
          href="/"
          style={{ fontWeight: 800, fontSize: '1.35rem', color: 'var(--primary-deep)' }}
        >
          Takiia
        </Link>
        <nav aria-label="Primary" className={`site-nav ${open ? 'open' : ''}`}>
          <Link href="/#messaging">Messaging</Link>
          <Link href="/#meetings">Meetings</Link>
          <Link href="/#social">Social Media</Link>
          <Link href="/#teams">Teams</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/#faq">Resources</Link>
        </nav>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn secondary"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            style={{ display: 'none' }}
          >
            Menu
          </button>
          <Link className="btn secondary" href="/login">
            Log in
          </Link>
          <Link className="btn" href="/signup">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
