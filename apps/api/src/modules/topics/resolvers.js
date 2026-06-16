import { getTopics } from './service.js';

export const topicResolvers = {
  Query: {
    topics: async (_, __, context) => {
      return getTopics({
        models: context.models,
        user: context.user,
      });
    },
    topic: () => null,
  },

  Mutation: {
    createTopic: () => {
      throw new Error('Not implemented');
    },

    updateTopic: () => {
      throw new Error('Not implemented');
    },

    deleteTopic: () => {
      throw new Error('Not implemented');
    },
  },
};
