import { getTopic, getTopics, createTopic, updateTopic, deleteTopic } from './service.js';

export const topicResolvers = {
  Query: {
    topic: async (_, { id }, context) => {
      return getTopic({
        models: context.models,
        user: context.user,
        id,
      });
    },

    topics: async (_, __, context) => {
      return getTopics({
        models: context.models,
        user: context.user,
      });
    },
  },

  Mutation: {
    createTopic: (_, { input }, context) => {
      return createTopic({
        models: context.models,
        user: context.user,
        input,
      });
    },

    updateTopic: (_, { id, input }, context) => {
      return updateTopic({
        models: context.models,
        user: context.user,
        id,
        input,
      });
    },

    deleteTopic: (_, { id }, context) => {
      return deleteTopic({
        models: context.models,
        user: context.user,
        id,
      });
    },
  },
};
