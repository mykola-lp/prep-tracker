import { getDatabaseStatus } from './service.js';

export const healthResolvers = {
  Query: {
    health: async (_source, _args, context) => ({
      status: 'ok',
      service: 'prep-tracker-api',
      database: await getDatabaseStatus(context.sequelize),
    }),
  },
};
