import {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from './service.js';

export const questionsResolvers = {
  Query: {
    question: async (_, { id }, context) => {
      return getQuestion({
        models: context.models,
        user: context.user,
        id,
      });
    },

    questions: async (_, __, context) => {
      return getQuestions({
        models: context.models,
        user: context.user,
      });
    },
  },

  Mutation: {
    createQuestion: async (_, { input }, context) => {
      return createQuestion({
        models: context.models,
        user: context.user,
        input,
      });
    },

    updateQuestion: async (_, { id, input }, context) => {
      return updateQuestion({
        models: context.models,
        user: context.user,
        id,
        input,
      });
    },

    deleteQuestion: async (_, { id }, context) => {
      return deleteQuestion({
        models: context.models,
        user: context.user,
        id,
      });
    },
  },

  Question: {
    notes: async (question, _, context) => {
      return context.models.Note.findAll({
        where: {
          questionId: question.id,
          userId: context.user.id,
        },
      });
    },
  },
};
