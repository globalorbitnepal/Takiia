const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function HomePage() {
  return (
    <main>
      <h1>Takiia</h1>
      <p>Starter web app for messaging and calling. Authentication and chat are not enabled yet.</p>
      <section className="card" aria-label="Local development">
        <dl>
          <dt>Web health</dt>
          <dd>
            <a href="/api/health">/api/health</a>
          </dd>
          <dt>API health (proxy target)</dt>
          <dd>{apiUrl}/health</dd>
        </dl>
      </section>
    </main>
  );
}
