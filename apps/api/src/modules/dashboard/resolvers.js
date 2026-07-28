import { getProgressSummary } from './service.js';

export const dashboardResolvers = {
  Query: {
    progressSummary: (_, __, context) => {
      return getProgressSummary({
        models: context.models,
        user: context.user,
      });
    },
  },
};
