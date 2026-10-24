'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hero device artwork is a devices-only crop of the brand mockup
 * (apps/web/public/marketing/hero-desktop.jpg) so the headline, sub-copy, buttons and
 * feature chips stay as crisp live text instead of being duplicated inside a bitmap.
 */
const features = [
  {
    label: 'Team Messaging',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M7 9h10M7 13h6M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Online Meetings',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="6" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M16 10l5-3v10l-5-3"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Social Publishing',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3 3 8l9 5 9-5-9-5Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M3 13l9 5 9-5M3 18l9 5 9-5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Team Collaboration',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M3 20c0-3 2.7-5 6-5s6 2 6 5M14 20c0-2.2 1.8-4 4-4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const tourStops = [
  {
    label: 'Inbox and group chats',
    detail: 'Direct messages, group conversations, read state, and attachments in one thread list.',
  },
  {
    label: 'Meetings and calls',
    detail: 'Schedule sessions, then join the call from the same workspace view.',
  },
  {
    label: 'Social queue',
    detail: 'Draft, schedule, and track publishing jobs with a clear status per platform.',
  },
  {
    label: 'Team and files',
    detail: 'Members, roles, and shared files with plan-based quotas enforced server-side.',
  },
];

export function HeroSection() {
  const [tourOpen, setTourOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeTour = useCallback(() => setTourOpen(false), []);

  useEffect(() => {
    if (!tourOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeTour();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [tourOpen, closeTour]);

  return (
    <section className="hero-section" id="top" aria-labelledby="hero-heading">
      <div className="hero-bg" aria-hidden />
      <div className="hero-glass-ribbon" aria-hidden />
      <div className="hero-glass-orb hero-glass-orb--a" aria-hidden />
      <div className="hero-glass-orb hero-glass-orb--b" aria-hidden />
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="hero-badge">ALL-IN-ONE WORKSPACE</p>
          <h1 className="hero-title" id="hero-heading">
            <span className="hero-title-line">Chat, Meet and</span>{' '}
            <span className="hero-title-line">Manage Social Media</span>{' '}
            <span className="hero-title-gradient">All in One Place.</span>
          </h1>
          <p className="hero-lead">
            Bring your conversations, online meetings, team collaboration and social publishing
            together in one simple workspace. Spend less time switching tools and more time getting
            work done.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-hero-primary" href="/signup">
              Get Started
              <span aria-hidden>→</span>
            </Link>
            <button
              type="button"
              className="btn btn-hero-video"
              aria-haspopup="dialog"
              aria-expanded={tourOpen}
              onClick={() => setTourOpen(true)}
            >
              <span className="hero-play" aria-hidden>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              Watch Video
            </button>
          </div>
          <ul className="hero-features">
            {features.map((item) => (
              <li key={item.label} className="hero-feature-card">
                <span className="hero-feature-icon">{item.icon}</span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="hero-visual">
          <div className="hero-visual-glass" aria-hidden />
          <Image
            src="/marketing/hero-devices.jpg"
            alt="Takiia workspace on a laptop with the dashboard open, next to the mobile app showing a four-person team meeting"
            width={1168}
            height={944}
            priority
            sizes="(min-width: 1100px) 54vw, (min-width: 720px) 88vw, 94vw"
            className="hero-mockup-image"
          />
        </div>
      </div>
      {tourOpen ? (
        <div className="hero-tour-overlay">
          <button
            type="button"
            className="hero-tour-backdrop"
            tabIndex={-1}
            aria-label="Close product tour"
            onClick={closeTour}
          />
          <div
            className="hero-tour-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hero-tour-title"
          >
            <button
              ref={closeButtonRef}
              type="button"
              className="hero-tour-close"
              aria-label="Close product tour"
              onClick={closeTour}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <p className="eyebrow hero-tour-eyebrow">Product tour</p>
            <h2 className="h2 hero-tour-title" id="hero-tour-title">
              A quick look inside Takiia
            </h2>
            <p className="muted hero-tour-lead">
              Our walkthrough video is still in production. Until it is live, here is what the
              workspace covers today.
            </p>
            <ul className="hero-tour-list">
              {tourStops.map((stop) => (
                <li key={stop.label}>
                  <strong>{stop.label}</strong>
                  <span className="muted">{stop.detail}</span>
                </li>
              ))}
            </ul>
            <div className="hero-tour-actions">
              <Link className="btn" href="/signup">
                Create your workspace
              </Link>
              <Link className="btn secondary" href="/features">
                Browse all features
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
