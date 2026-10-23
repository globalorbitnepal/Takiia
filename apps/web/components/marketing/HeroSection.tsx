import Image from 'next/image';
import Link from 'next/link';

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

export function HeroSection() {
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
            Chat, Meet and Manage Social Media{' '}
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
            <button type="button" className="btn btn-hero-video">
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
            src="/marketing/hero-desktop.jpg"
            alt="Takiia dashboard on laptop and team video call on mobile"
            width={1400}
            height={1050}
            priority
            className="hero-mockup-image"
            sizes="(min-width: 1280px) 640px, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
