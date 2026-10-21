import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container" style={{ padding: '4rem 0 6rem' }}>
      <section style={{ maxWidth: 720 }}>
        <p
          className="muted"
          style={{ letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 12 }}
        >
          Secure messaging for teams and friends
        </p>
        <h1
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            lineHeight: 1.05,
            margin: '0.4rem 0 1rem',
          }}
        >
          Talk, share, and call on Takiia
        </h1>
        <p className="muted" style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
          Real-time chats, groups, and voice/video calling with a privacy-first experience.
        </p>
        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.6rem', flexWrap: 'wrap' }}>
          <Link className="btn" href="/signup">
            Create account
          </Link>
          <Link className="btn secondary" href="/login">
            Sign in
          </Link>
          <Link className="btn secondary" href="/app">
            Open messages
          </Link>
        </div>
      </section>
    </main>
  );
}
