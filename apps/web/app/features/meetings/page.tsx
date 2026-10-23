import type { Metadata } from 'next';
import { FeaturePageLayout } from '../../../components/marketing/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Online meetings',
  description: 'Meeting scheduling and in-app call flows. Group media capabilities are still maturing.',
};

export default function MeetingsFeaturePage() {
  return (
    <FeaturePageLayout
      title="Bring everyone together, wherever they work"
      description="Schedule meetings, share join links, and use in-app voice/video where WebRTC is configured. Takiia is honest about what is production-ready versus in progress."
      crumbs={[
        { label: 'Home', href: '/' },
        { label: 'Features', href: '/features' },
        { label: 'Meetings' },
      ]}
      highlights={[
        'Meeting scheduling and workspace events',
        'Call lifecycle APIs',
        'In-app WebRTC UI for direct calls (environment-dependent)',
        'Participant limits enforced by plan entitlements',
        'Microphone and camera controls in supported clients',
      ]}
      honestyNote="Group meetings, screen sharing, and verified TURN/LiveKit routing are not yet marketed as complete Zoom-class meetings. Real-network WebRTC tests are required before claiming full video reliability."
      ctaHref="/signup"
      ctaLabel="Explore meetings"
      preview={
        <div className="meeting-preview card" style={{ padding: '1rem', background: '#fff' }}>
          <p className="eyebrow" style={{ fontSize: 10 }}>Demo tile layout</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {['You', 'Guest'].map((label) => (
              <div
                key={label}
                style={{
                  aspectRatio: '4/3',
                  background: 'var(--panel-2)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      }
      faq={[
        {
          question: 'Do meetings work on mobile?',
          answer: 'The Expo app can consume API URLs; verify media on target devices separately.',
        },
      ]}
    />
  );
}
