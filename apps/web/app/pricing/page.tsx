import Link from 'next/link';
import { PricingSection } from '../../components/marketing/PricingSection';
import { SiteFooter } from '../../components/marketing/SiteFooter';
import { SiteHeader } from '../../components/marketing/SiteHeader';

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ paddingTop: '1rem' }}>
        <PricingSection />
        <div className="container" style={{ paddingBottom: '3rem' }}>
          <Link className="btn" href="/signup">
            Create account
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
