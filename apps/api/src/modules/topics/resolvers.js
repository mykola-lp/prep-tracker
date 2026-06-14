import { getTopics } from './service.js';

export const topicResolvers = {
  Query: {
    topics: (_, __, context) => {
      return getTopics(context.models);
    },
  },
};
