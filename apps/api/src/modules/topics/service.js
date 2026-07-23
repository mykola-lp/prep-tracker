import { requireAuth, findOwnedRecord } from '../auth/authorization.js';

import { buildTagFilterInclude } from '../tags/filters.js';

export async function getTopic({ models, user, id }) {
  requireAuth(user);
  return findOwnedRecord(models.Topic, id, user.id);
}

export async function getTopics({ models, user, tagId, status }) {
  requireAuth(user);

  const where = {
    userId: user.id,
  };

  if (status) where.status = status;

  return models.Topic.findAll({
    where,
    include: buildTagFilterInclude(models, tagId),
  });
}

export async function createTopic({ models, user, input }) {
  requireAuth(user);

  return models.Topic.create({
    ...input,
    userId: user.id,
  });
}

export async function updateTopic({ models, user, id, input }) {
  requireAuth(user);
  const topic = await findOwnedRecord(models.Topic, id, user.id);

  return topic.update(input);
}

export async function deleteTopic({ models, user, id }) {
  requireAuth(user);

  const topic = await findOwnedRecord(models.Topic, id, user.id);
  await topic.destroy();

  return true;
}
