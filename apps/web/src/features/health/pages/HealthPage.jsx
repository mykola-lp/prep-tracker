import { useEffect, useState } from 'react';

import { HealthStatus } from '../components/HealthStatus';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

export function HealthPage() {
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

  return <HealthStatus health={health} />;
}
