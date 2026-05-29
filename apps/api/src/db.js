import pg from 'pg';

function shouldEnableSsl(databaseUrl) {
  return databaseUrl.includes('sslmode=require') || databaseUrl.includes('aivencloud.com');
}

export function createPool(databaseUrl) {
  if (!databaseUrl) {
    return null;
  }

  return new pg.Pool({
    connectionString: databaseUrl,
    ssl: shouldEnableSsl(databaseUrl)
      ? {
          rejectUnauthorized: false,
        }
      : false,
  });
}
