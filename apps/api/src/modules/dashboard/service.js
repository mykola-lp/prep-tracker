import { Op } from 'sequelize';

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
