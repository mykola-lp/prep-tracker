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

  return new pg.Pool({
    connectionString: databaseUrl,
    ssl: useSsl
      ? {
          rejectUnauthorized: false,
        }
      : false,
  });
}
