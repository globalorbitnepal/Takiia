const items = [
  { label: 'Messaging', icon: '💬' },
  { label: 'Meetings', icon: '📹' },
  { label: 'Social Media', icon: '📱' },
  { label: 'Teams', icon: '👥' },
  { label: 'Files', icon: '📎' },
  { label: 'Events', icon: '📅' },
  { label: 'Notifications', icon: '🔔' },
  { label: 'Scheduling', icon: '⏱' },
];

export function CapabilityStrip() {
  return (
    <section className="section-alt capability-strip" aria-label="Product capabilities">
      <div className="container capability-strip-inner">
        {items.map((item) => (
          <div key={item.label} className="capability-pill glass">
            <span className="capability-icon" aria-hidden>
              {item.icon}
            </span>
            <span className="capability-label">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
