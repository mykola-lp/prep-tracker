import { Sequelize } from 'sequelize';

function shouldEnableSsl(databaseUrl) {
  if (!databaseUrl) {
    return false;
  }

  return (
    databaseUrl.includes('sslmode=require') ||
    databaseUrl.includes('ssl=true') ||
    databaseUrl.includes('aivencloud.com')
  );
}

function normalizeDatabaseUrl(databaseUrl) {
  const normalizedDatabaseUrl = new URL(databaseUrl);

  normalizedDatabaseUrl.searchParams.delete('sslmode');
  normalizedDatabaseUrl.searchParams.delete('ssl');

  return normalizedDatabaseUrl.toString();
}

export function createSequelize(databaseUrl) {
  if (!databaseUrl) {
    return null;
  }

  const useSsl = shouldEnableSsl(databaseUrl);

  return new Sequelize(normalizeDatabaseUrl(databaseUrl), {
    dialect: 'postgres',
    logging: false,
    dialectOptions: useSsl
      ? {
          ssl: {
            rejectUnauthorized: false,
          },
        }
      : undefined,
  });
}

export async function connectToDatabase(sequelize) {
  if (!sequelize) {
    return false;
  }

  const maxAttempts = 10;
  const retryDelayMs = 1000;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await sequelize.authenticate();
      console.log('connected to the database');
      return true;
    } catch (error) {
      if (attempt === maxAttempts) {
        console.log('failed to connect to the database');
        console.log(error);
        process.exit(1);
      }

      console.log(`waiting for the database (${attempt}/${maxAttempts})...`);
      await new Promise((resolve) => {
        setTimeout(resolve, retryDelayMs);
      });
    }
  }
}
