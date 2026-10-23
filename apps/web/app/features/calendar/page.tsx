import type { Metadata } from 'next';
import { FeaturePageLayout } from '../../../components/marketing/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Calendar & scheduling',
  description: 'Unified view of meetings, social posts, and team events inside Takiia.',
};

export default function CalendarFeaturePage() {
  return (
    <FeaturePageLayout
      title="Keep every conversation, meeting and post on schedule"
      description="See upcoming meetings, scheduled social posts, and workspace events in one calendar-oriented workflow."
      crumbs={[
        { label: 'Home', href: '/' },
        { label: 'Features', href: '/features' },
        { label: 'Calendar' },
      ]}
      highlights={[
        'Workspace events',
        'Scheduled social posts',
        'Meeting times tied to workspace activity',
        'Time-zone-aware scheduling fields in the data model',
      ]}
      honestyNote="External Google Calendar or Outlook sync is not included unless separately implemented."
      ctaHref="/signup"
      ctaLabel="View calendar in app"
    />
  );
}
