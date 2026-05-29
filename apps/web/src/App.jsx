import { useEffect, useState } from 'react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

export default function App() {
  const [health, setHealth] = useState({
    status: 'loading',
    service: 'api',
    database: 'loading',
  });

  useEffect(() => {
    async function loadHealth() {
      try {
        const response = await fetch(`${apiBaseUrl}/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: '{ health { status service database } }',
          }),
        });
        const result = await response.json();

        setHealth(result.data.health);
      } catch {
        setHealth({
          status: 'error',
          service: 'api',
          database: 'unknown',
        });
      }
    }

    loadHealth();
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Prep Tracker</p>

        <h1>Infrastructure is wired.</h1>

        <p className="lead">
          React talks to Express through GraphQL, with PostgreSQL ready for the first real feature.
        </p>

        <dl className="status-grid">
          <div>
            <dt>API</dt>
            <dd>{health.status}</dd>
          </div>

          <div>
            <dt>Service</dt>
            <dd>{health.service}</dd>
          </div>

          <div>
            <dt>PostgreSQL</dt>
            <dd>{health.database}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
