const faqItems = [
  {
    q: 'What is Takiia?',
    a: 'Takiia is an all-in-one workspace for team messaging, meetings, and social media scheduling—built as one product, not a bundle of unrelated tools.',
  },
  {
    q: 'Which features are included?',
    a: 'Messaging, workspaces, attachments, social scheduling infrastructure, billing and usage limits, and meeting/call APIs. Availability of live social publishing and group media depends on platform credentials and media infrastructure.',
  },
  {
    q: 'Which social platforms are supported?',
    a: 'Facebook, Instagram (via Meta), and TikTok are integrated in the codebase using official OAuth patterns. Each network requires your developer app credentials and may require platform approval.',
  },
  {
    q: 'Can all platforms publish automatically?',
    a: 'No. API permissions, media requirements, and app review vary by platform. Takiia queues and tracks jobs server-side; publishing succeeds only when the platform accepts the request.',
  },
  {
    q: 'Are WhatsApp Business messages included?',
    a: 'No. Takiia provides built-in workspace messaging. It is not a WhatsApp Business API client.',
  },
  {
    q: 'How do online meetings work?',
    a: 'You can schedule meetings and use in-app call flows where enabled. Group meetings, screen sharing, and production-grade TURN/LiveKit routing are still being hardened.',
  },
  {
    q: 'Are audio/video calls available?',
    a: 'Direct call lifecycle APIs and WebRTC UI exist for development and early use. Treat group video as beta until real-network verification is complete.',
  },
  {
    q: 'What happens when a quota is reached?',
    a: 'The API returns a quota error. Upgrade your plan or wait for the next billing period reset. Data is not deleted when limits are hit.',
  },
  {
    q: 'Can I upgrade or cancel?',
    a: 'Plan changes and cancellation follow your subscription status in billing. See the pricing page and billing policy for terms.',
  },
  {
    q: 'How are attachments protected?',
    a: 'Downloads require authentication and conversation membership checks. Storage counts toward plan quotas.',
  },
  {
    q: 'Which payment methods are supported?',
    a: 'Depends on the configured payment provider. Live payments require provider credentials; the app exposes billing structure without faking successful charges.',
  },
];

export function HomeFaq() {
  return (
    <section className="section section-alt" id="faq">
      <div className="container">
        <h2 className="h2">FAQ</h2>
        <div className="faq-stack">
          {faqItems.map((item) => (
            <details key={item.q} className="card" style={{ padding: '1rem' }}>
              <summary>{item.q}</summary>
              <p className="muted" style={{ marginBottom: 0 }}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
