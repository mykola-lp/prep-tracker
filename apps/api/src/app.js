import cors from 'cors';
import express from 'express';
import { buildSchema, graphql } from 'graphql';

import { CLIENT_ORIGIN, DATABASE_URL } from './utils/config.js';
import { createSequelize } from './utils/db.js';
import { initModels } from './models/index.js';

const schema = buildSchema(`
  type Health {
    status: String!
    service: String!
    database: String!
  }

  type Query {
    health: Health!
  }
`);

export function createApp({ clientOrigin = CLIENT_ORIGIN, databaseUrl = DATABASE_URL } = {}) {
  const app = express();
  const sequelize = createSequelize(databaseUrl);

  if (sequelize) {
    initModels(sequelize);
  }

  async function getDatabaseStatus() {
    if (!sequelize) {
      return 'not_configured';
    }

    try {
      await sequelize.authenticate();
      return 'ok';
    } catch (error) {
      console.error('Database health check failed:', error.message);
      return 'error';
    }
  }

  app.use(
    cors({
      origin: clientOrigin,
    })
  );
  app.use(express.json());

  app.get('/api/health', async (_request, response) => {
    response.json({
      status: 'ok',
      service: 'prep-tracker-api',
      database: await getDatabaseStatus(),
    });
  });

  app.post('/api/graphql', async (request, response) => {
    const result = await graphql({
      schema,
      source: request.body?.query || '',
      rootValue: {
        health: async () => ({
          status: 'ok',
          service: 'prep-tracker-api',
          database: await getDatabaseStatus(),
        }),
      },
    });

    response.json(result);
  });

  return app;
}
