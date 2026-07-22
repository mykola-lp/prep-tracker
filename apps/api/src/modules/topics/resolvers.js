import * as topicService from './service.js';

export const topicResolvers = {
  Query: {
    topic: async (_, { id }, context) => {
      return topicService.getTopic({
        models: context.models,
        user: context.user,
        id,
      });
    },

    topics: async (_, __, context) => {
      return topicService.getTopics({
        models: context.models,
        user: context.user,
      });
    },
  },

  Mutation: {
    createTopic: (_, { input }, context) => {
      return topicService.createTopic({
        models: context.models,
        user: context.user,
        input,
      });
    },

    updateTopic: (_, { id, input }, context) => {
      return topicService.updateTopic({
        models: context.models,
        user: context.user,
        id,
        input,
      });
    },

    deleteTopic: (_, { id }, context) => {
      return topicService.deleteTopic({
        models: context.models,
        user: context.user,
        id,
      });
    },
  },
};
