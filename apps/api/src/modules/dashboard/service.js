import { Op, fn, col } from 'sequelize';

import { requireAuth } from '../auth/authorization.js';

const STATUSES = ['new', 'learning', 'reviewing', 'done'];

function buildStatusCounts(items) {
  return STATUSES.map((status) => ({
    status,
    count: items.filter((item) => item.status === status).length,
  }));
}

export async function getProgressSummary({ models, user }) {
  requireAuth(user);

  const [topics, questions] = await Promise.all([
    models.Topic.findAll({ where: { userId: user.id } }),
    models.Question.findAll({ where: { userId: user.id } }),
  ]);

  const upcomingTopics = topics
    .filter((topic) => topic.deadline)
    .map((topic) => ({
      id: topic.id,
      type: 'topic',
      title: topic.title,
      status: topic.status,
      deadline: topic.deadline,
    }));

  const upcomingQuestions = questions
    .filter((question) => question.deadline)
    .map((question) => ({
      id: question.id,
      type: 'question',
      title: question.prompt,
      status: question.status,
      deadline: question.deadline,
    }));

  return {
    topicsByStatus: buildStatusCounts(topics),
    questionsByStatus: buildStatusCounts(questions),
    upcomingDeadlines: [...upcomingTopics, ...upcomingQuestions].sort((a, b) =>
      a.deadline.localeCompare(b.deadline)
    ),
  };
}

function mapTopicItem(topic) {
  return {
    id: topic.id,
    type: 'topic',
    title: topic.title,
    status: topic.status,
    deadline: topic.deadline,
  };
}

function mapQuestionItem(question) {
  return {
    id: question.id,
    type: 'question',
    title: question.prompt,
    status: question.status,
    deadline: question.deadline,
  };
}

async function getDashboardItems({ models, userId, today }) {
  const overdueTopics = await models.Topic.findAll({
    attributes: ['id', 'title', 'status', 'deadline'],
    where: {
      userId,
      deadline: { [Op.lt]: today },
      status: { [Op.ne]: 'done' },
    },
    order: [['deadline', 'ASC']],
  });

  const overdueQuestions = await models.Question.findAll({
    attributes: ['id', 'prompt', 'status', 'deadline'],
    where: {
      userId,
      deadline: { [Op.lt]: today },
      status: { [Op.ne]: 'done' },
    },
    order: [['deadline', 'ASC']],
  });

  const reviewTopics = await models.Topic.findAll({
    attributes: ['id', 'title', 'status', 'deadline'],
    where: {
      userId,
      status: 'reviewing',
    },
    order: [['deadline', 'ASC']],
  });

  const reviewQuestions = await models.Question.findAll({
    attributes: ['id', 'prompt', 'status', 'deadline'],
    where: {
      userId,
      status: 'reviewing',
    },
    order: [['deadline', 'ASC']],
  });

  const upcomingTopics = await models.Topic.findAll({
    attributes: ['id', 'title', 'status', 'deadline'],
    where: {
      userId,
      deadline: { [Op.gte]: today },
      status: { [Op.ne]: 'done' },
    },
    order: [['deadline', 'ASC']],
    limit: 10,
  });

  const upcomingQuestions = await models.Question.findAll({
    attributes: ['id', 'prompt', 'status', 'deadline'],
    where: {
      userId,
      deadline: { [Op.gte]: today },
      status: { [Op.ne]: 'done' },
    },
    order: [['deadline', 'ASC']],
    limit: 10,
  });

  const sortByDeadline = (a, b) => new Date(a.deadline) - new Date(b.deadline);

  const overdueItems = [
    ...overdueTopics.map(mapTopicItem),
    ...overdueQuestions.map(mapQuestionItem),
  ].sort(sortByDeadline);

  const reviewItems = [...reviewTopics.map(mapTopicItem), ...reviewQuestions.map(mapQuestionItem)];

  const upcomingDeadlines = [
    ...upcomingTopics.map(mapTopicItem),
    ...upcomingQuestions.map(mapQuestionItem),
  ].sort(sortByDeadline);

  return {
    overdueItems,
    reviewItems,
    upcomingDeadlines,
  };
}
