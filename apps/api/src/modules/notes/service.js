import { requireAuth, findOwnedRecord } from '../auth/authorization.js';

export async function getNote({ models, user, id }) {
  requireAuth(user);
  return findOwnedRecord(models.Note, id, user.id);
}

export async function getNotes({ models, user }) {
  requireAuth(user);

  return models.Note.findAll({
    where: {
      userId: user.id,
    },
  });
}

export async function createNote({ models, user, input }) {
  requireAuth(user);

  const hasTopic = Boolean(input.topicId);
  const hasQuestion = Boolean(input.questionId);

  if (hasTopic === hasQuestion) {
    const err = new Error('Note must belong to exactly one of topicId or questionId');
    err.extensions = { code: 'VALIDATION_ERROR' };
    throw err;
  }

  if (hasTopic) {
    await findOwnedRecord(models.Topic, input.topicId, user.id);
  } else {
    await findOwnedRecord(models.Question, input.questionId, user.id);
  }

  return models.Note.create({
    ...input,
    userId: user.id,
  });
}

export async function updateNote({ models, user, id, input }) {
  requireAuth(user);
  const note = await findOwnedRecord(models.Note, id, user.id);

  return note.update(input);
}

export async function deleteNote({ models, user, id }) {
  requireAuth(user);

  const note = await findOwnedRecord(models.Note, id, user.id);
  await note.destroy();

  return true;
}
