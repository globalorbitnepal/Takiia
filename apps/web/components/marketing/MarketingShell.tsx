import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
