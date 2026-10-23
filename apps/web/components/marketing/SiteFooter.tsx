import Link from 'next/link';
import Image from 'next/image';

export function SiteFooter() {
  return (
    <footer className="site-footer section-alt">
      <div className="container site-footer-grid">
        <div>
          <Image
            src="/brand/takiia-logo.png"
            alt="Takiia"
            width={140}
            height={46}
            className="brand-logo-image"
          />
          <p className="muted" style={{ fontSize: 14, marginTop: '0.75rem' }}>
            Chat. Meet. Manage. All in One.
          </p>
        </div>
        <div>
          <p className="eyebrow" style={{ fontSize: 11 }}>
            Product
          </p>
          <Link href="/features">Features</Link>
          <Link href="/integrations">Integrations</Link>
          <Link href="/pricing">Pricing</Link>
        </div>
        <div>
          <p className="eyebrow" style={{ fontSize: 11 }}>
            Solutions
          </p>
          <Link href="/solutions/individuals">Individuals</Link>
          <Link href="/solutions/teams">Teams</Link>
          <Link href="/solutions/agencies">Agencies</Link>
        </div>
        <div>
          <p className="eyebrow" style={{ fontSize: 11 }}>
            Resources
          </p>
          <Link href="/help">Help</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div>
          <p className="eyebrow" style={{ fontSize: 11 }}>
            Legal
          </p>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/billing-policy">Billing</Link>
        </div>
      </div>
      <p className="container muted site-footer-copy">
        © {new Date().getFullYear()} Takiia. Legal entity and support details to be completed by the
        product owner before public launch.
      </p>
    </footer>
  );
}
