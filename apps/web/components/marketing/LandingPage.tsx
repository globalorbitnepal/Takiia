import Link from 'next/link';
import { CapabilityStrip } from './CapabilityStrip';
import { DashboardPreview } from './DashboardPreview';
import { HeroSection } from './HeroSection';
import { HomeFaq } from './HomeFaq';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import { PricingSection } from './PricingSection';

export function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />

        <CapabilityStrip />

        <section className="section" id="platform">
          <div className="container">
            <h2 className="h2">Everything Your Team Needs, Without the Constant Switching.</h2>
            <p className="muted" style={{ maxWidth: 720 }}>
              Teams often juggle chat apps, meeting links, and social schedulers. Takiia unifies
              supported workflows in one dashboard. You may still need native platform apps where
              official APIs require it.
            </p>
            <div className="grid-2" style={{ marginTop: '2rem' }}>
              {[
                [
                  'Too Many Tools',
                  'Move conversations, meetings, and publishing into one workspace view.',
                ],
                [
                  'Scattered Work',
                  'Keep group chats, read state, and team membership in one place.',
                ],
                [
                  'Limited Visibility',
                  'Draft, schedule, and track publish jobs with clear status in the dashboard.',
                ],
              ].map(([title, body]) => (
                <article key={title} className="card glass" style={{ padding: '1.25rem' }}>
                  <h3 style={{ marginTop: 0, color: 'var(--primary-deep)' }}>{title}</h3>
                  <p className="muted" style={{ marginBottom: 0 }}>
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-alt" id="workspace">
          <div className="container grid-2">
            <div>
              <h2 className="h2">One Workspace. A Clearer Way to Work.</h2>
              <p className="muted">
                Signed-in customers see live inbox, subscription usage, events, and social queue data.
                The preview opposite uses fictional demo data only.
              </p>
              <Link className="btn" href="/app">Open dashboard</Link>
            </div>
            <DashboardPreview />
          </div>
        </section>

        <section className="section section-alt" id="messaging">
          <div className="container grid-2">
            <div>
              <h2 className="h2">Conversations That Keep Work Moving.</h2>
              <p className="muted">
                Takiia messaging is built-in — not a WhatsApp connector. Direct and group chats,
                attachments, read state, typing and presence (where enabled), block and report
                controls, and real-time delivery over Socket.IO.
              </p>
              <ul className="muted">
                <li>One-to-one and group conversations</li>
                <li>Attachments with membership-checked downloads</li>
                <li>Search people and filter conversations</li>
              </ul>
              <Link className="btn" href="/features/messaging">
                Explore Messaging
              </Link>
            </div>
            <div className="card glass" style={{ padding: '1rem', minHeight: 280 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: '0.75rem',
                  height: '100%',
                }}
              >
                <div style={{ borderRight: '1px solid var(--border)', paddingRight: '0.5rem' }}>
                  <p className="eyebrow" style={{ fontSize: 10 }}>
                    Chats
                  </p>
                  <p style={{ fontSize: 14 }}>Product team</p>
                  <p style={{ fontSize: 14 }}>Alex</p>
                </div>
                <div>
                  <div
                    className="card"
                    style={{ padding: '0.5rem', marginBottom: '0.5rem', background: '#fff' }}
                  >
                    <span className="muted" style={{ fontSize: 12 }}>
                      Alex · 10:02
                    </span>
                    <p style={{ margin: '0.25rem 0 0' }}>Draft is ready for review.</p>
                  </div>
                  <div
                    className="card"
                    style={{ padding: '0.5rem', background: 'var(--panel-2)', marginLeft: '2rem' }}
                  >
                    <span className="muted" style={{ fontSize: 12 }}>
                      You · 10:04
                    </span>
                    <p style={{ margin: '0.25rem 0 0' }}>Scheduling social posts for Thursday.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="meetings">
          <div className="container">
            <h2 className="h2">Bring Everyone Together, Wherever They Work.</h2>
            <p className="muted" style={{ maxWidth: 720 }}>
              Call lifecycle APIs and in-app WebRTC UI exist for direct voice/video. Production
              group meetings, screen sharing, and verified TURN/LiveKit routing are still being
              hardened — not claimed as complete Zoom-class meetings yet.
            </p>
            <Link className="btn" href="/features/meetings">Explore Meetings</Link>
          </div>
        </section>

        <section className="section section-alt" id="social">
          <div className="container">
            <h2 className="h2">Plan Once. Publish Across Your Connected Channels.</h2>
            <p className="muted" style={{ maxWidth: 720 }}>
              Connect Facebook, Instagram, and TikTok through official OAuth when credentials and
              app review are in place. Scheduling, queues, idempotent publish jobs, and retries are
              implemented server-side; live publishing remains pending platform configuration.
            </p>
            <Link className="btn" href="/features/social-media">
              Explore Social Media Management
            </Link>
          </div>
        </section>

        <section className="section" id="teams">
          <div className="container">
            <h2 className="h2">Give Your Team One Place to Work Together.</h2>
            <p className="muted">
              Workspaces isolate billing, social accounts, and scheduled posts per team.
            </p>
            <Link className="btn" href="/features/teams">Explore Teams</Link>
          </div>
        </section>

        <section className="section section-alt" id="calendar">
          <div className="container">
            <h2 className="h2">Keep Every Conversation, Meeting and Post on Schedule.</h2>
            <p className="muted">
              Workspace events and social schedules share a unified calendar concept in the
              dashboard.
            </p>
          </div>
        </section>

        <section className="section" id="files">
          <div className="container">
            <h2 className="h2">Share What Your Team Needs, Securely.</h2>
            <p className="muted">
              Validated uploads, storage quotas by plan, and authenticated downloads.
            </p>
            <Link className="btn" href="/features/file-sharing">Explore File Sharing</Link>
          </div>
        </section>

        <section className="section section-alt" id="dashboard-preview">
          <div className="container">
            <h2 className="h2">Choose a Plan That Fits the Way You Work.</h2>
            <p className="muted">
              Plans and limits load from your database configuration—see full comparison on the
              pricing page.
            </p>
            <Link className="btn" href="/pricing">View Pricing</Link>
          </div>
        </section>

        <section className="section" id="how">
          <div className="container">
            <h2 className="h2">How Takiia works</h2>
            <ol style={{ display: 'grid', gap: '1rem', paddingLeft: '1.2rem' }}>
              <li>Create your account</li>
              <li>Set up your team workspace</li>
              <li>Connect supported social accounts when credentials are ready</li>
              <li>Message, schedule, and collaborate from one place</li>
            </ol>
          </div>
        </section>

        <section className="section section-alt" id="integrations">
          <div className="container">
            <h2 className="h2">Connect the Platforms You Already Use.</h2>
            <ul className="muted">
              <li>Facebook — structure ready; requires app credentials</li>
              <li>Instagram — via Meta APIs; requires approval</li>
              <li>TikTok — structure ready; requires developer app</li>
            </ul>
            <Link className="btn secondary" href="/integrations">Integration directory</Link>
          </div>
        </section>

        <PricingSection />

        <section className="section" id="trust">
          <div className="container">
            <h2 className="h2">Your Workspace. Your Data. Your Control.</h2>
            <p className="muted">
              Session-based authentication, CSRF protection on mutating API requests,
              workspace-scoped data access, encrypted token storage fields for social connections,
              and audit events for admin changes. No fabricated testimonials or customer counts are
              shown here.
            </p>
          </div>
        </section>

        <HomeFaq />

        <section className="section" style={{ textAlign: 'center' }}>
          <div className="container">
            <h2 className="h2">Bring Your Conversations and Workflows Together.</h2>
            <p className="muted">
              Manage your communication, meetings, team collaboration and social publishing from
              one organized workspace.
            </p>
            <Link className="btn" href="/signup">
              Get Started
            </Link>
            <Link className="btn secondary" href="/pricing" style={{ marginLeft: '0.5rem' }}>
              View Pricing
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
