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

    topics: async (_, { tagId, status }, context) => {
      return getTopics({
        models: context.models,
        user: context.user,
        tagId,
        status,
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

  Topic: {
    questions: async (topic, _, context) => {
      return context.models.Question.findAll({
        where: {
          topicId: topic.id,
          userId: context.user.id,
        },
      });
    },

    notes: async (topic, _, context) => {
      return context.models.Note.findAll({
        where: {
          topicId: topic.id,
          userId: context.user.id,
        },
      });
    },

    tags: async (topic, _, context) => {
      return topic.getTags();
    },
  },
};
