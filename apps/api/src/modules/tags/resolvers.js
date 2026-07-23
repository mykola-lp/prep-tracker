import {
  getTags,
  createTag,
  deleteTag,
  addTagToTopic,
  removeTagFromTopic,
  addTagToQuestion,
  removeTagFromQuestion,
  addTagToNote,
  removeTagFromNote,
} from './service.js';

export const tagsResolvers = {
  Query: {
    tags: async (_, __, context) => {
      return getTags({
        models: context.models,
        user: context.user,
      });
    },
  },

  Mutation: {
    createTag: async (_, { input }, context) => {
      return createTag({
        models: context.models,
        user: context.user,
        input,
      });
    },

    deleteTag: async (_, { id }, context) => {
      return deleteTag({
        models: context.models,
        user: context.user,
        id,
      });
    },

    addTagToTopic: async (_, { topicId, tagId }, context) => {
      return addTagToTopic({
        models: context.models,
        user: context.user,
        topicId,
        tagId,
      });
    },

    removeTagFromTopic: async (_, { topicId, tagId }, context) => {
      return removeTagFromTopic({
        models: context.models,
        user: context.user,
        topicId,
        tagId,
      });
    },

    addTagToQuestion: async (_, { questionId, tagId }, context) => {
      return addTagToQuestion({
        models: context.models,
        user: context.user,
        questionId,
        tagId,
      });
    },

    removeTagFromQuestion: async (_, { questionId, tagId }, context) => {
      return removeTagFromQuestion({
        models: context.models,
        user: context.user,
        questionId,
        tagId,
      });
    },

    addTagToNote: async (_, { noteId, tagId }, context) => {
      return addTagToNote({
        models: context.models,
        user: context.user,
        noteId,
        tagId,
      });
    },

    removeTagFromNote: async (_, { noteId, tagId }, context) => {
      return removeTagFromNote({
        models: context.models,
        user: context.user,
        noteId,
        tagId,
      });
    },
  },
};
