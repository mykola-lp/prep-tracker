import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Umzug, SequelizeStorage } from 'umzug';

import { DATABASE_URL, TEST_DATABASE_URL } from '../utils/config.js';
import { createSequelize } from '../utils/db.js';

const migrationsPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../migrations/*.js'
);

const sequelize = createSequelize(TEST_DATABASE_URL || DATABASE_URL);

if (!sequelize) {
  console.error('DATABASE_URL or TEST_DATABASE_URL is required to run migrations.');
  process.exit(1);
}

const umzug = new Umzug({
  migrations: {
    glob: migrationsPath,
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({
    sequelize,
    tableName: 'schema_migrations',
  }),
  logger: console,
});

const command = process.argv[2] || 'up';

async function run() {
  try {
    if (command === 'up') {
      console.log('Running migrations...');
      const migrations = await umzug.up();

      for (const migration of migrations) {
        console.log(`Applied migration ${migration.name}`);
      }

      console.log('Migrations up to date');
      return;
    }

    if (command === 'down') {
      await umzug.down();
      return;
    }

    if (command === 'pending') {
      const pendingMigrations = await umzug.pending();
      console.log(pendingMigrations.map((migration) => migration.name).join('\n'));
      return;
    }

    if (command === 'executed') {
      const executedMigrations = await umzug.executed();
      console.log(executedMigrations.map((migration) => migration.name).join('\n'));
      return;
    }

    throw new Error(`Unsupported migration command: ${command}`);
  } finally {
    await sequelize.close();
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
