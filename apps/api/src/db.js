import pg from 'pg';

function shouldEnableSsl(databaseUrl) {
  return (
    databaseUrl.includes('sslmode=require') ||
    databaseUrl.includes('ssl=true') ||
    databaseUrl.includes('aivencloud.com')
  );
}

export function createPool(databaseUrl) {
  if (!databaseUrl) {
    return null;
  }

  const useSsl = shouldEnableSsl(databaseUrl);
  const normalizedDatabaseUrl = new URL(databaseUrl);

  normalizedDatabaseUrl.searchParams.delete('sslmode');
  normalizedDatabaseUrl.searchParams.delete('ssl');

  return new pg.Pool({
    connectionString: normalizedDatabaseUrl.toString(),
    ssl: useSsl
      ? {
          rejectUnauthorized: false,
        }
      : false,
  });
}
