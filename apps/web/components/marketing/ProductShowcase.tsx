export function ProductShowcase() {
  return (
    <div
      className="glass"
      style={{ borderRadius: 20, padding: '1rem', position: 'relative', overflow: 'hidden' }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '-40%',
          background:
            'radial-gradient(circle at 30% 20%, rgba(34,199,232,0.18), transparent 50%), radial-gradient(circle at 70% 60%, rgba(103,232,197,0.2), transparent 45%)',
        }}
      />
      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '88px 1fr',
          gap: '0.75rem',
          minHeight: 360,
        }}
      >
        <aside style={{ fontSize: 12, color: 'var(--muted)' }}>
          {['Home', 'Inbox', 'Meetings', 'Social', 'Teams', 'Settings'].map((item) => (
            <p
              key={item}
              style={{
                margin: '0.35rem 0',
                color: item === 'Inbox' ? 'var(--primary)' : undefined,
              }}
            >
              {item}
            </p>
          ))}
        </aside>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <div className="card" style={{ padding: '0.6rem', background: '#fff' }}>
            <strong style={{ fontSize: 13 }}>Inbox preview</strong>
            <p style={{ margin: '0.35rem 0', fontSize: 13 }}>Maya: Client deck attached.</p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--primary-deep)' }}>
              You: Publishing at 3:00 PM.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div className="card" style={{ padding: '0.5rem', fontSize: 12, background: '#fff' }}>
              Social calendar
              <p className="muted" style={{ margin: '0.25rem 0 0' }}>
                Thu · 2 posts queued
              </p>
            </div>
            <div className="card" style={{ padding: '0.5rem', fontSize: 12, background: '#fff' }}>
              Meeting
              <p className="muted" style={{ margin: '0.25rem 0 0' }}>
                Team sync · 15:30
              </p>
            </div>
          </div>
          <div
            className="card"
            style={{ padding: '0.5rem', fontSize: 12, background: 'var(--panel-2)' }}
          >
            Video tile preview · camera/mic controls (UI)
          </div>
        </div>
      </div>
      <p className="muted" style={{ fontSize: 11, margin: '0.75rem 0 0' }}>
        Illustrative UI preview — not customer data.
      </p>
    </div>
  );
}
