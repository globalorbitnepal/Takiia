'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const navGroups = [
  {
    label: 'Product',
    links: [
      { href: '/#platform', label: 'Platform overview' },
      { href: '/app', label: 'Dashboard' },
      { href: '/#dashboard-preview', label: 'Workspace preview' },
    ],
  },
  {
    label: 'Features',
    links: [
      { href: '/#messaging', label: 'Team messaging' },
      { href: '/#meetings', label: 'Online meetings' },
      { href: '/#social', label: 'Social publishing' },
    ],
  },
  {
    label: 'Solutions',
    links: [
      { href: '/#teams', label: 'Teams' },
      { href: '/#calendar', label: 'Scheduling' },
      { href: '/#files', label: 'Files & sharing' },
    ],
  },
];

export function SiteHeader() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="marketing-nav marketing-nav-hero">
      <div className="container marketing-nav-inner">
        <Link href="/" className="brand-logo" aria-label="Takiia home">
          <Image
            src="/brand/takiia-logo.png"
            alt="Takiia"
            width={168}
            height={48}
            priority
            className="brand-logo-image"
          />
        </Link>

        <nav aria-label="Primary" className={`site-nav-desktop ${mobileOpen ? 'is-open' : ''}`}>
          {navGroups.map((group) => (
            <div
              key={group.label}
              className="nav-dropdown"
              onMouseEnter={() => setOpenDropdown(group.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                className="nav-link nav-link-dropdown"
                aria-expanded={openDropdown === group.label}
                onClick={() =>
                  setOpenDropdown((v) => (v === group.label ? null : group.label))
                }
              >
                {group.label}
                <Chevron />
              </button>
              {openDropdown === group.label && (
                <div className="nav-dropdown-panel" role="menu">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      role="menuitem"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link className="nav-link" href="/pricing" onClick={() => setMobileOpen(false)}>
            Pricing
          </Link>
          <Link className="nav-link" href="/#faq" onClick={() => setMobileOpen(false)}>
            Blog
          </Link>
        </nav>

        <div className="marketing-nav-actions">
          <button type="button" className="lang-select" aria-label="Language: English">
            <GlobeIcon />
            English
            <Chevron />
          </button>
          <Link className="nav-login" href="/login">
            Log in
          </Link>
          <Link className="btn btn-nav-cta" href="/signup">
            Get Started
            <span aria-hidden>→</span>
          </Link>
          <button
            type="button"
            className="nav-mobile-toggle"
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden className="nav-chevron">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M3 12h18M12 3c2.5 2.8 4 6 4 9s-1.5 6.2-4 9M12 3c-2.5 2.8-4 6-4 9s1.5 6.2 4 9"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  );
}
