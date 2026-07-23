import { getNotes, getNote, createNote, updateNote, deleteNote } from './service.js';

export const notesResolvers = {
  Query: {
    note: async (_, { id }, context) => {
      return getNote({
        models: context.models,
        user: context.user,
        id,
      });
    },

    notes: async (_, __, context) => {
      return getNotes({
        models: context.models,
        user: context.user,
      });
    },
  },

  Mutation: {
    createNote: async (_, { input }, context) => {
      return createNote({
        models: context.models,
        user: context.user,
        input,
      });
    },

    updateNote: async (_, { id, input }, context) => {
      return updateNote({
        models: context.models,
        user: context.user,
        id,
        input,
      });
    },

    deleteNote: async (_, { id }, context) => {
      return deleteNote({
        models: context.models,
        user: context.user,
        id,
      });
    },
  },
};
