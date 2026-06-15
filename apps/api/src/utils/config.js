import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const rootLocalEnvPath = path.join(projectRoot, '.env.local');
const rootAivenDevEnvPath = path.join(projectRoot, '.env.aiven-dev');
const envFile = process.env.ENV_FILE;

if (!process.env.DATABASE_URL) {
  if (envFile) {
    const resolvedEnvFile = path.isAbsolute(envFile) ? envFile : path.join(projectRoot, envFile);

    if (!fs.existsSync(resolvedEnvFile)) {
      throw new Error(`ENV_FILE not found: ${envFile}`);
    }

    dotenv.config({ path: resolvedEnvFile });
  } else if (fs.existsSync(rootLocalEnvPath)) {
    dotenv.config({ path: rootLocalEnvPath });
  } else if (fs.existsSync(rootAivenDevEnvPath)) {
    dotenv.config({ path: rootAivenDevEnvPath });
  }
}

export const DATABASE_URL = process.env.DATABASE_URL;
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
export const PORT = Number(process.env.PORT) || 3001;
export const JWT_SECRET = process.env.JWT_SECRET;
