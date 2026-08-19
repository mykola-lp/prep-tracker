import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

loadEnvironment();

export const DATABASE_URL = buildDatabaseUrl();
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
export const PORT = Number(process.env.PORT) || 3001;
export const JWT_SECRET = process.env.JWT_SECRET;

if (!DATABASE_URL) {
  throw new Error(
    'DATABASE_URL could not be resolved. Did you forget to set ENV_FILE (e.g. ENV_FILE=.env.local or ENV_FILE=.env.test)?'
  );
}

logDbTarget(DATABASE_URL);

function loadEnvironment() {
  if (process.env.DATABASE_URL) {
    return;
  }

  const envFile = process.env.ENV_FILE;

  if (!envFile) {
    return;
  }

  const envPath = path.isAbsolute(envFile) ? envFile : path.join(projectRoot, envFile);

  if (!fs.existsSync(envPath)) {
    throw new Error(`ENV_FILE not found: ${envFile}`);
  }

  dotenv.config({ path: envPath });
}

function buildDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const {
    DB_HOST,
    DB_LOCAL_HOST,
    DB_PORT = '5432',
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_SSLMODE,
  } = process.env;

  const host = DB_LOCAL_HOST || DB_HOST;

  if (!host || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    return undefined;
  }

  const credentials = `${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}`;
  const database = `/${DB_NAME}`;
  const sslMode = DB_SSLMODE ? `?sslmode=${DB_SSLMODE}` : '';

  return `postgresql://${credentials}@${host}:${DB_PORT}${database}${sslMode}`;
}

function logDbTarget(databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    console.log(`[db] connecting to ${url.hostname}:${url.port}${url.pathname}`);
  } catch {
    console.log('[db] DATABASE_URL is set but could not be parsed for logging');
  }
}
