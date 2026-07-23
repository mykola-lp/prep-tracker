import { requireAuth, findOwnedRecord } from '../auth/authorization.js';

export async function createTag({ models, user, input }) {
  requireAuth(user);

  try {
    return await models.Tag.create({
      name: input.name,
      userId: user.id,
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const err = new Error('Tag with this name already exists');
      err.extensions = { code: 'VALIDATION_ERROR' };
      throw err;
    }
    throw error;
  }
}

export async function getTags({ models, user }) {
  requireAuth(user);

  return models.Tag.findAll({
    where: {
      userId: user.id,
    },
  });
}

export async function deleteTag({ models, user, id }) {
  requireAuth(user);

  const tag = await findOwnedRecord(models.Tag, id, user.id);
  await tag.destroy();

  return true;
}

async function assertOwnedPair(models, entityModel, entityId, tagModel, tagId, userId) {
  const entity = await findOwnedRecord(entityModel, entityId, userId);
  const tag = await findOwnedRecord(tagModel, tagId, userId);

  return { entity, tag };
}

export async function addTagToTopic({ models, user, topicId, tagId }) {
  requireAuth(user);

  const { entity: topic, tag } = await assertOwnedPair(
    models,
    models.Topic,
    topicId,
    models.Tag,
    tagId,
    user.id
  );
  await topic.addTag(tag);

  return topic;
}

export async function removeTagFromTopic({ models, user, topicId, tagId }) {
  requireAuth(user);

  const { entity: topic, tag } = await assertOwnedPair(
    models,
    models.Topic,
    topicId,
    models.Tag,
    tagId,
    user.id
  );
  await topic.removeTag(tag);

  return topic;
}

export async function addTagToQuestion({ models, user, questionId, tagId }) {
  requireAuth(user);

  const { entity: question, tag } = await assertOwnedPair(
    models,
    models.Question,
    questionId,
    models.Tag,
    tagId,
    user.id
  );
  await question.addTag(tag);

  return question;
}

export async function removeTagFromQuestion({ models, user, questionId, tagId }) {
  requireAuth(user);

  const { entity: question, tag } = await assertOwnedPair(
    models,
    models.Question,
    questionId,
    models.Tag,
    tagId,
    user.id
  );
  await question.removeTag(tag);

  return question;
}

export async function addTagToNote({ models, user, noteId, tagId }) {
  requireAuth(user);

  const { entity: note, tag } = await assertOwnedPair(
    models,
    models.Note,
    noteId,
    models.Tag,
    tagId,
    user.id
  );
  await note.addTag(tag);

  return note;
}

export async function removeTagFromNote({ models, user, noteId, tagId }) {
  requireAuth(user);

  const { entity: note, tag } = await assertOwnedPair(
    models,
    models.Note,
    noteId,
    models.Tag,
    tagId,
    user.id
  );
  await note.removeTag(tag);

  return note;
}
