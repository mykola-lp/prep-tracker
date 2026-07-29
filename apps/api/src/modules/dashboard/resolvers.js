import { getDashboardSummary, getProgressSummary } from './service.js';

export const dashboardResolvers = {
  Query: {
    dashboardSummary: (_, __, context) => {
      return getDashboardSummary({
        models: context.models,
        user: context.user,
      });
    },

    progressSummary: (_, __, context) => {
      return getProgressSummary({
        models: context.models,
        user: context.user,
      });
    },
  },
};
