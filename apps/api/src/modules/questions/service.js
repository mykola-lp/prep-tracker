import { requireAuth, findOwnedRecord, NotFoundError } from '../auth/authorization.js';

import { buildTagFilterInclude } from '../tags/filters.js';

import { validateProgressInput } from '../progress/validation.js';

export async function getQuestion({ models, user, id }) {
  requireAuth(user);
  return findOwnedRecord(models.Question, id, user.id);
}

export async function getQuestions({ models, user, tagId, status }) {
  requireAuth(user);

  const where = {
    userId: user.id,
  };

  if (status) where.status = status;

  return models.Question.findAll({
    where,
    include: buildTagFilterInclude(models, tagId),
  });
}

export async function createQuestion({ models, user, input }) {
  requireAuth(user);
  await findOwnedRecord(models.Topic, input.topicId, user.id);

  validateProgressInput(input);

  return models.Question.create({
    ...input,
    userId: user.id,
  });
}

export async function updateQuestion({ models, user, id, input }) {
  requireAuth(user);
  const question = await findOwnedRecord(models.Question, id, user.id);

  validateProgressInput(input);

  return question.update(input);
}

export async function deleteQuestion({ models, user, id }) {
  requireAuth(user);

  const question = await findOwnedRecord(models.Question, id, user.id);
  await question.destroy();

  return true;
}
