import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer
      className="section-alt"
      style={{ padding: '3rem 0', borderTop: '1px solid var(--border)' }}
    >
      <div
        className="container"
        style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        }}
      >
        <div>
          <strong style={{ color: 'var(--primary-deep)' }}>Takiia</strong>
          <p className="muted" style={{ fontSize: 14 }}>
            Communication and publishing workspace.
          </p>
        </div>
        <div>
          <p className="eyebrow" style={{ fontSize: 11 }}>
            Product
          </p>
          <Link href="/#messaging">Messaging</Link>
          <br />
          <Link href="/pricing">Pricing</Link>
        </div>
        <div>
          <p className="eyebrow" style={{ fontSize: 11 }}>
            Legal
          </p>
          <Link href="/privacy">Privacy</Link>
          <br />
          <Link href="/terms">Terms</Link>
          <br />
          <Link href="/contact">Contact</Link>
        </div>
      </div>
      <p className="container muted" style={{ fontSize: 12, marginTop: '2rem' }}>
        © {new Date().getFullYear()} Takiia. All rights reserved.
      </p>
    </footer>
  );
}
