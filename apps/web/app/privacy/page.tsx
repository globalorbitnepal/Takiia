import { SiteFooter } from '../../components/marketing/SiteFooter';
import { SiteHeader } from '../../components/marketing/SiteHeader';

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="container section">
        <h1 className="h2">Privacy Policy</h1>
        <p className="muted">
          Replace this placeholder with counsel-reviewed policy text before public launch. Takiia
          processes account, messaging, workspace, and connected social account data according to
          your configured retention and security practices.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
