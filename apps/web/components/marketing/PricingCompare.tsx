'use client';

export function PricingCompare() {
  const rows = [
    ['Messaging', 'Included', 'Included', 'Included', 'Included'],
    ['Social accounts', 'Per plan DB limits', 'Per plan', 'Per plan', 'Per plan'],
    ['Scheduled posts / month', 'Per plan', 'Per plan', 'Per plan', 'Per plan'],
    ['Team members', 'Per plan', 'Per plan', 'Per plan', 'Per plan'],
    ['Meetings / calls', 'Plan allowances', 'Plan allowances', 'Plan allowances', 'Plan allowances'],
    ['Analytics', 'Where API data exists', 'Basic', 'Advanced', 'Advanced'],
  ];

  return (
    <section className="section section-alt" id="compare">
      <div className="container">
        <h2 className="h2">Feature comparison</h2>
        <p className="muted">
          Exact numbers come from your live plan configuration—not hardcoded marketing tables.
        </p>
        <div className="pricing-table-wrap">
          <table className="pricing-table">
            <thead>
              <tr>
                <th scope="col">Capability</th>
                <th scope="col">Starter</th>
                <th scope="col">Pro</th>
                <th scope="col">Business</th>
                <th scope="col">Agency</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td key={`${row[0]}-${i}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ marginTop: '1rem', fontSize: 14 }}>
          When a quota is reached, the API returns an error until you upgrade or the billing period
          resets. See <a href="/billing-policy">billing policy</a>.
        </p>
      </div>
    </section>
  );
}
