import { getTopics } from './service.js';

export const topicResolvers = {
  Query: {
    topics: (_, __, context) => {
      return getTopics(context.models.Topic);
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
