import { getCurrentUser, registerUser, loginUser } from './service.js';

export const authResolvers = {
  Query: {
    me: async (_, __, context) => {
      return getCurrentUser({
        models: context.models,
        userId: context.user?.id,
      });
    },
  },

  Mutation: {
    register: async (_, { input }, context) => {
      return registerUser({
        models: context.models,
        ...input,
      });
    },

    login: async (_, { input }, context) => {
      return loginUser({
        models: context.models,
        ...input,
      });
    },
  },
};
