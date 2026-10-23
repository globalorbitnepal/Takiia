export function MessagingPreview() {
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.75rem', minHeight: 220 }}
    >
      <aside style={{ fontSize: 12, color: 'var(--muted)' }}>
        <p>Product</p>
        <p>Alex</p>
        <p>Support</p>
      </aside>
      <div>
        <div
          className="card"
          style={{ padding: '0.5rem', marginBottom: '0.5rem', background: '#fff' }}
        >
          <span className="muted" style={{ fontSize: 12 }}>
            Alex · 10:02
          </span>
          <p style={{ margin: '0.25rem 0 0', fontSize: 14 }}>Draft is ready for review.</p>
        </div>
        <div
          className="card"
          style={{ padding: '0.5rem', background: 'var(--panel-2)', marginLeft: '1.5rem' }}
        >
          <span className="muted" style={{ fontSize: 12 }}>
            You · 10:04
          </span>
          <p style={{ margin: '0.25rem 0 0', fontSize: 14 }}>On it — scheduling posts too.</p>
        </div>
      </div>
    </div>
  );
}
