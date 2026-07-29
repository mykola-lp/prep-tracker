import { Op, fn, col } from 'sequelize';

import { requireAuth } from '../auth/authorization.js';

const STATUSES = ['new', 'learning', 'reviewing', 'done'];

export async function getDashboardSummary({ models, user }) {
  requireAuth(user);

  const userId = user.id;
  const today = todayDateOnly();

  const [
    totalTopics,
    totalQuestions,
    totalNotes,
    completedTopics,
    completedQuestions,
    topicsByStatus,
    questionsByStatus,
    dashboardItems,
  ] = await Promise.all([
    models.Topic.count({ where: { userId } }),
    models.Question.count({ where: { userId } }),
    models.Note.count({ where: { userId } }),
    models.Topic.count({ where: { userId, status: 'done' } }),
    models.Question.count({ where: { userId, status: 'done' } }),
    countByStatus(models.Topic, userId),
    countByStatus(models.Question, userId),
    getDashboardItems({ models, userId, today }),
  ]);

  return {
    totals: {
      topics: totalTopics,
      questions: totalQuestions,
      notes: totalNotes,
      completedTopics,
      completedQuestions,
      overdueItems: dashboardItems.overdueItems.length,
      reviewItems: dashboardItems.reviewItems.length,
    },
    topicsByStatus,
    questionsByStatus,
    ...dashboardItems,
  };
}

export async function getProgressSummary({ models, user }) {
  requireAuth(user);

  const userId = user.id;
  const today = todayDateOnly();

  const [topicsByStatus, questionsByStatus, upcomingDeadlines] = await Promise.all([
    countByStatus(models.Topic, userId),
    countByStatus(models.Question, userId),
    getUpcomingDeadlines({ models, userId, today }),
  ]);

  return {
    topicsByStatus,
    questionsByStatus,
    upcomingDeadlines,
  };
}

async function getUpcomingDeadlines({ models, userId, today }) {
  const [upcomingTopics, upcomingQuestions] = await Promise.all([
    models.Topic.findAll({
      attributes: ['id', 'title', 'status', 'deadline'],
      where: {
        userId,
        deadline: { [Op.gte]: today },
        status: { [Op.ne]: 'done' },
      },
      order: [['deadline', 'ASC']],
      limit: 10,
    }),
    models.Question.findAll({
      attributes: ['id', 'prompt', 'status', 'deadline'],
      where: {
        userId,
        deadline: { [Op.gte]: today },
        status: { [Op.ne]: 'done' },
      },
      order: [['deadline', 'ASC']],
      limit: 10,
    }),
  ]);

  const sortByDeadline = (a, b) => new Date(a.deadline) - new Date(b.deadline);

  const upcomingDeadlines = [
    ...upcomingTopics.map(mapTopicItem),
    ...upcomingQuestions.map(mapQuestionItem),
  ].sort(sortByDeadline);

  return upcomingDeadlines;
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
  const [
    overdueTopics,
    overdueQuestions,
    reviewTopics,
    reviewQuestions,
    upcomingTopics,
    upcomingQuestions,
  ] = await Promise.all([
    models.Topic.findAll({
      attributes: ['id', 'title', 'status', 'deadline'],
      where: {
        userId,
        deadline: { [Op.lt]: today },
        status: { [Op.ne]: 'done' },
      },
      order: [['deadline', 'ASC']],
    }),

    models.Question.findAll({
      attributes: ['id', 'prompt', 'status', 'deadline'],
      where: {
        userId,
        deadline: { [Op.lt]: today },
        status: { [Op.ne]: 'done' },
      },
      order: [['deadline', 'ASC']],
    }),

    models.Topic.findAll({
      attributes: ['id', 'title', 'status', 'deadline'],
      where: {
        userId,
        status: 'reviewing',
      },
      order: [['deadline', 'ASC']],
    }),

    models.Question.findAll({
      attributes: ['id', 'prompt', 'status', 'deadline'],
      where: {
        userId,
        status: 'reviewing',
      },
      order: [['deadline', 'ASC']],
    }),

    models.Topic.findAll({
      attributes: ['id', 'title', 'status', 'deadline'],
      where: {
        userId,
        deadline: { [Op.gte]: today },
        status: { [Op.ne]: 'done' },
      },
      order: [['deadline', 'ASC']],
      limit: 10,
    }),

    models.Question.findAll({
      attributes: ['id', 'prompt', 'status', 'deadline'],
      where: {
        userId,
        deadline: { [Op.gte]: today },
        status: { [Op.ne]: 'done' },
      },
      order: [['deadline', 'ASC']],
      limit: 10,
    }),
  ]);

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

function todayDateOnly() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeStatusCounts(rows) {
  const counts = new Map(rows.map((row) => [row.status, Number(row.get('count'))]));

  return STATUSES.map((status) => ({
    status,
    count: counts.get(status) ?? 0,
  }));
}

async function countByStatus(model, userId) {
  const rows = await model.findAll({
    attributes: ['status', [fn('COUNT', col('id')), 'count']],
    where: { userId },
    group: ['status'],
  });

  return normalizeStatusCounts(rows);
}
