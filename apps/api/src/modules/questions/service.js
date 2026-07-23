import {
  requireAuth,
  findOwnedRecord,
  NotFoundError,
} from '../auth/authorization.js';

export async function getQuestion({ models, user, id }) {
  requireAuth(user);
  return findOwnedRecord(models.Question, id, user.id);
}

export async function getQuestions({ models, user }) {
  requireAuth(user);

  return models.Question.findAll({
    where: {
      userId: user.id,
    },
  });
}

export async function createQuestion({ models, user, input }) {
  requireAuth(user);
  await findOwnedRecord(models.Topic, input.topicId, user.id);

  return models.Question.create({
    ...input,
    userId: user.id,
  });
}

export async function updateQuestion({ models, user, id, input }) {
  requireAuth(user);
  const question = await findOwnedRecord(models.Question, id, user.id);

  return question.update(input);
}

export async function deleteQuestion({ models, user, id }) {
  requireAuth(user);

  const question = await findOwnedRecord(models.Question, id, user.id);
  await question.destroy();

  return true;
}
