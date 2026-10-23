/** Illustrative demo UI — not live customer data. */
export function DashboardPreview() {
  return (
    <div className="dashboard-preview card glass" aria-label="Demo dashboard preview">
      <p className="eyebrow" style={{ fontSize: 10, margin: 0 }}>
        Demo preview · fictional data
      </p>
      <div className="dashboard-preview-grid">
        <aside className="dashboard-preview-sidebar">
          <p>Inbox</p>
          <p>Meetings</p>
          <p>Social</p>
          <p>Calendar</p>
        </aside>
        <div className="dashboard-preview-main">
          <div className="card" style={{ padding: '0.75rem', background: '#fff' }}>
            <strong>Recent messages</strong>
            <p className="muted" style={{ fontSize: 13, margin: '0.35rem 0 0' }}>
              Product team · Draft ready for review
            </p>
          </div>
          <div className="dashboard-preview-row">
            <div className="card" style={{ padding: '0.65rem', background: '#fff', fontSize: 13 }}>
              <strong>Upcoming meeting</strong>
              <p className="muted" style={{ margin: '0.25rem 0 0' }}>
                Team sync · 15:30
              </p>
            </div>
            <div className="card" style={{ padding: '0.65rem', background: '#fff', fontSize: 13 }}>
              <strong>Scheduled posts</strong>
              <p className="muted" style={{ margin: '0.25rem 0 0' }}>
                2 queued for Thursday
              </p>
            </div>
          </div>
          <div
            className="card"
            style={{ padding: '0.65rem', background: 'var(--panel-2)', fontSize: 12 }}
          >
            Usage: 12 / 300 posts · 2.1 GB storage (example)
          </div>
        </div>
      </div>
    </div>
  );
}
