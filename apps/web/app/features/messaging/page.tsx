import type { Metadata } from 'next';
import { FeaturePageLayout } from '../../../components/marketing/FeaturePageLayout';
import { MessagingPreview } from '../../../components/marketing/previews/MessagingPreview';

export const metadata: Metadata = {
  title: 'Team messaging',
  description:
    'Built-in direct and group messaging with attachments, read state, and workspace security.',
};

export default function MessagingFeaturePage() {
  return (
    <FeaturePageLayout
      title="Conversations that keep work moving"
      description="Takiia messaging is native to your workspace—not a WhatsApp connector. Chat with teammates, share files, and stay in sync with read state and real-time delivery where enabled."
      crumbs={[
        { label: 'Home', href: '/' },
        { label: 'Features', href: '/features' },
        { label: 'Messaging' },
      ]}
      highlights={[
        'Direct and group conversations',
        'Message history with pagination',
        'Read and delivery state',
        'Attachments with membership-checked downloads',
        'Block and report controls',
        'Socket.IO delivery with server-side authorization',
      ]}
      honestyNote="Channel-style layouts beyond group chats depend on your workspace configuration. Verify presence and typing indicators in your environment before advertising them publicly."
      ctaHref="/signup"
      ctaLabel="Explore messaging"
      preview={<MessagingPreview />}
      faq={[
        {
          question: 'Is this WhatsApp?',
          answer: 'No. Messages stay inside Takiia workspaces with your own membership rules.',
        },
        {
          question: 'Can outsiders read our chats?',
          answer: 'APIs enforce workspace and conversation membership on every request.',
        },
      ]}
    />
  );
}
