import cors from 'cors';
import express from 'express';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';

import { CLIENT_ORIGIN, DATABASE_URL } from './utils/config.js';
import { createSequelize } from './utils/db.js';
import { initModels } from './models/index.js';

import { createContext } from './graphql/context.js';
import { resolvers } from './graphql/resolvers.js';
import { typeDefs } from './graphql/typeDefs.js';
import { getDatabaseStatus } from './modules/health/service.js';

const GRAPHQL_PATH = '/api/graphql';

export async function createApp({
  clientOrigin = CLIENT_ORIGIN,
  databaseUrl = DATABASE_URL,
  sequelize: providedSequelize = null,
  models: providedModels = null,
} = {}) {
  const app = express();

  const sequelize = providedSequelize ?? createSequelize(databaseUrl);

  const models = providedModels ?? (sequelize ? initModels(sequelize) : null);

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
      database: await getDatabaseStatus(sequelize),
    });
  });

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();

  app.use(
    GRAPHQL_PATH,
    cors({
      origin: clientOrigin,
    }),
    expressMiddleware(apolloServer, {
      context: async ({ req }) =>
        createContext({
          req,
          models,
          sequelize,
        }),
    })
  );

  return app;
}
