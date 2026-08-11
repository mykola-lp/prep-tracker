import request from 'supertest';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../../app.js';
import { initModels } from '../../../models/index.js';

import { DATABASE_URL, TEST_DATABASE_URL } from '../../../utils/config.js';
import { createSequelize } from '../../../utils/db.js';

const REGISTER_MUTATION = `#graphql
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
      }
    }
  }
`;

const CREATE_TOPIC_MUTATION = `#graphql
  mutation CreateTopic($input: CreateTopicInput!) {
    createTopic(input: $input) {
      id
      title
      status
      deadline
    }
  }
`;

const UPDATE_TOPIC_MUTATION = `#graphql
  mutation UpdateTopic($id: ID!, $input: UpdateTopicInput!) {
    updateTopic(id: $id, input: $input) {
      id
      status
      deadline
    }
  }
`;

const CREATE_QUESTION_MUTATION = `#graphql
  mutation CreateQuestion($input: CreateQuestionInput!) {
    createQuestion(input: $input) {
      id
      prompt
      status
      deadline
    }
  }
`;

const UPDATE_QUESTION_MUTATION = `#graphql
  mutation UpdateQuestion($id: ID!, $input: UpdateQuestionInput!) {
    updateQuestion(id: $id, input: $input) {
      id
      status
      deadline
    }
  }
`;

const PROGRESS_SUMMARY_QUERY = `#graphql
  query ProgressSummary {
    progressSummary {
      topicsByStatus {
        status
        count
      }
      questionsByStatus {
        status
        count
      }
      upcomingDeadlines {
        id
        type
        title
        status
        deadline
      }
    }
  }
`;

const DASHBOARD_SUMMARY_QUERY = `#graphql
  query DashboardSummary {
    dashboardSummary {
      totals {
        topics
        questions
        notes
        completedTopics
        completedQuestions
        overdueItems
        reviewItems
      }
      topicsByStatus {
        status
        count
      }
      questionsByStatus {
        status
        count
      }
      overdueItems {
        id
        type
        title
        status
        deadline
      }
      reviewItems {
        id
        type
        title
        status
        deadline
      }
      upcomingDeadlines {
        id
        type
        title
        status
        deadline
      }
    }
  }
`;

const CREATE_NOTE_MUTATION = `#graphql
  mutation CreateNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      id
      body
      topicId
      questionId
    }
  }
`;

let app;
let sequelize;
let models;

async function graphql({ query, variables, token }) {
  const operation = request(app).post('/api/graphql').send({
    query,
    variables,
  });

  if (token) {
    operation.set('Authorization', `Bearer ${token}`);
  }

  return operation;
}

async function registerUser(email) {
  const response = await graphql({
    query: REGISTER_MUTATION,
    variables: {
      input: {
        email,
        password: 'password123',
      },
    },
  });

  return response.body.data.register;
}

async function createTopic(token, input = {}) {
  const response = await graphql({
    query: CREATE_TOPIC_MUTATION,
    token,
    variables: {
      input: {
        title: 'JavaScript',
        ...input,
      },
    },
  });

  return response.body.data.createTopic;
}

async function updateTopic(token, id, input) {
  const response = await graphql({
    query: UPDATE_TOPIC_MUTATION,
    token,
    variables: {
      id,
      input,
    },
  });

  return response.body.data.updateTopic;
}

async function createQuestion(token, topicId, input = {}) {
  const response = await graphql({
    query: CREATE_QUESTION_MUTATION,
    token,
    variables: {
      input: {
        topicId,
        prompt: 'What is a closure?',
        ...input,
      },
    },
  });

  return response.body.data.createQuestion;
}

async function updateQuestion(token, id, input) {
  const response = await graphql({
    query: UPDATE_QUESTION_MUTATION,
    token,
    variables: {
      id,
      input,
    },
  });

  return response.body.data.updateQuestion;
}

async function createNote(token, input) {
  const response = await graphql({
    query: CREATE_NOTE_MUTATION,
    token,
    variables: {
      input,
    },
  });

  return response.body.data.createNote;
}

function countByStatus(statusCounts, status) {
  return statusCounts.find((item) => item.status === status)?.count;
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

beforeAll(async () => {
  sequelize = createSequelize(TEST_DATABASE_URL || DATABASE_URL);

  if (!sequelize) {
    throw new Error(
      'Failed to initialize database connection. TEST_DATABASE_URL or DATABASE_URL may be missing or invalid.'
    );
  }

  models = initModels(sequelize);

  app = await createApp({
    sequelize,
    models,
  });
});

afterAll(async () => {
  if (sequelize) {
    await sequelize.close();
  }
});

describe('Dashboard GraphQL progress summary', () => {
  beforeEach(async () => {
    await models.User.destroy({
      where: {},
      truncate: true,
      cascade: true,
    });
  });

  it('requires authentication', async () => {
    const response = await graphql({
      query: PROGRESS_SUMMARY_QUERY,
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Unauthorized');
    expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  it('counts topics by status', async () => {
    const user = await registerUser('topic-summary@test.com');
    const firstTopic = await createTopic(user.token, { title: 'JavaScript' });
    const secondTopic = await createTopic(user.token, { title: 'React' });
    const thirdTopic = await createTopic(user.token, { title: 'Databases' });

    await updateTopic(user.token, secondTopic.id, { status: 'learning' });
    await updateTopic(user.token, thirdTopic.id, { status: 'done' });

    const response = await graphql({
      query: PROGRESS_SUMMARY_QUERY,
      token: user.token,
    });

    expect(response.body.errors).toBeUndefined();
    expect(countByStatus(response.body.data.progressSummary.topicsByStatus, 'new')).toBe(1);
    expect(countByStatus(response.body.data.progressSummary.topicsByStatus, 'learning')).toBe(1);
    expect(countByStatus(response.body.data.progressSummary.topicsByStatus, 'reviewing')).toBe(0);
    expect(countByStatus(response.body.data.progressSummary.topicsByStatus, 'done')).toBe(1);
    expect(firstTopic.status).toBe('new');
  });

  it('counts questions by status', async () => {
    const user = await registerUser('question-summary@test.com');
    const topic = await createTopic(user.token);
    const firstQuestion = await createQuestion(user.token, topic.id, {
      prompt: 'What is scope?',
    });
    const secondQuestion = await createQuestion(user.token, topic.id, {
      prompt: 'What is hoisting?',
    });
    const thirdQuestion = await createQuestion(user.token, topic.id, {
      prompt: 'What is a promise?',
    });

    await updateQuestion(user.token, secondQuestion.id, { status: 'reviewing' });
    await updateQuestion(user.token, thirdQuestion.id, { status: 'done' });

    const response = await graphql({
      query: PROGRESS_SUMMARY_QUERY,
      token: user.token,
    });

    expect(response.body.errors).toBeUndefined();
    expect(countByStatus(response.body.data.progressSummary.questionsByStatus, 'new')).toBe(1);
    expect(countByStatus(response.body.data.progressSummary.questionsByStatus, 'learning')).toBe(0);
    expect(countByStatus(response.body.data.progressSummary.questionsByStatus, 'reviewing')).toBe(
      1
    );
    expect(countByStatus(response.body.data.progressSummary.questionsByStatus, 'done')).toBe(1);
    expect(firstQuestion.status).toBe('new');
  });

  it('returns upcoming deadlines sorted by date', async () => {
    const user = await registerUser('deadline-summary@test.com');
    const earliestDeadline = addDays(7);
    const middleDeadline = addDays(14);
    const latestDeadline = addDays(21);

    const laterTopic = await createTopic(user.token, {
      title: 'React',
      deadline: latestDeadline,
    });
    const earlierTopic = await createTopic(user.token, {
      title: 'JavaScript',
      deadline: earliestDeadline,
    });
    const topic = await createTopic(user.token, { title: 'Databases' });

    await createQuestion(user.token, topic.id, {
      prompt: 'What is an index?',
      deadline: middleDeadline,
    });

    const response = await graphql({
      query: PROGRESS_SUMMARY_QUERY,
      token: user.token,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.progressSummary.upcomingDeadlines).toMatchObject([
      {
        id: earlierTopic.id,
        type: 'topic',
        title: 'JavaScript',
        deadline: earliestDeadline,
      },
      {
        type: 'question',
        title: 'What is an index?',
        deadline: middleDeadline,
      },
      {
        id: laterTopic.id,
        type: 'topic',
        title: 'React',
        deadline: latestDeadline,
      },
    ]);
  });

  it('does not include another user progress data', async () => {
    const userA = await registerUser('summary-owner@test.com');
    const userB = await registerUser('summary-other@test.com');
    const userDeadline = addDays(7);

    await createTopic(userA.token, {
      title: 'Private Topic',
      deadline: userDeadline,
    });

    const foreignTopic = await createTopic(userB.token, {
      title: 'Other Topic',
      deadline: addDays(3),
    });
    await updateTopic(userB.token, foreignTopic.id, { status: 'done' });
    await createQuestion(userB.token, foreignTopic.id, {
      prompt: 'Other question',
      deadline: addDays(14),
    });

    const response = await graphql({
      query: PROGRESS_SUMMARY_QUERY,
      token: userA.token,
    });

    expect(response.body.errors).toBeUndefined();
    expect(countByStatus(response.body.data.progressSummary.topicsByStatus, 'new')).toBe(1);
    expect(countByStatus(response.body.data.progressSummary.topicsByStatus, 'done')).toBe(0);
    expect(countByStatus(response.body.data.progressSummary.questionsByStatus, 'new')).toBe(0);
    expect(response.body.data.progressSummary.upcomingDeadlines).toHaveLength(1);
    expect(response.body.data.progressSummary.upcomingDeadlines[0].title).toBe('Private Topic');
  });

  it('requires authentication for dashboard summary', async () => {
    const response = await graphql({
      query: DASHBOARD_SUMMARY_QUERY,
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Unauthorized');
    expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  it('returns dashboard totals for the current user', async () => {
    const user = await registerUser('dashboard-totals@test.com');
    const topic = await createTopic(user.token, { title: 'JavaScript' });
    const doneTopic = await createTopic(user.token, { title: 'React' });

    await updateTopic(user.token, doneTopic.id, { status: 'done' });
    await createQuestion(user.token, topic.id, { prompt: 'What is closure?' });
    await createNote(user.token, { topicId: topic.id, body: 'Scope note' });

    const response = await graphql({
      query: DASHBOARD_SUMMARY_QUERY,
      token: user.token,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.dashboardSummary.totals).toMatchObject({
      topics: 2,
      questions: 1,
      notes: 1,
      completedTopics: 1,
      completedQuestions: 0,
    });
  });

  it('returns overdue and review items', async () => {
    const user = await registerUser('dashboard-overdue@test.com');
    const topic = await createTopic(user.token, {
      title: 'Algorithms',
      deadline: '2026-07-01',
    });
    const question = await createQuestion(user.token, topic.id, {
      prompt: 'What is binary search?',
      deadline: '2026-07-02',
    });

    await updateTopic(user.token, topic.id, { status: 'reviewing' });
    await updateQuestion(user.token, question.id, { status: 'learning' });

    const response = await graphql({
      query: DASHBOARD_SUMMARY_QUERY,
      token: user.token,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.dashboardSummary.overdueItems).toHaveLength(2);
    expect(response.body.data.dashboardSummary.reviewItems).toHaveLength(1);
    expect(response.body.data.dashboardSummary.reviewItems[0]).toMatchObject({
      type: 'topic',
      title: 'Algorithms',
      status: 'reviewing',
    });
  });

  it('does not include another user dashboard data', async () => {
    const userA = await registerUser('dashboard-owner@test.com');
    const userB = await registerUser('dashboard-other@test.com');

    await createTopic(userA.token, { title: 'Private Topic' });

    const foreignTopic = await createTopic(userB.token, {
      title: 'Foreign Topic',
      deadline: '2026-07-01',
    });

    await updateTopic(userB.token, foreignTopic.id, { status: 'done' });
    await createQuestion(userB.token, foreignTopic.id, {
      prompt: 'Foreign Question',
    });

    await createNote(userB.token, {
      topicId: foreignTopic.id,
      body: 'Foreign note',
    });

    const response = await graphql({
      query: DASHBOARD_SUMMARY_QUERY,
      token: userA.token,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.dashboardSummary.totals).toMatchObject({
      topics: 1,
      questions: 0,
      notes: 0,
      completedTopics: 0,
      completedQuestions: 0,
    });
    expect(response.body.data.dashboardSummary.overdueItems).toEqual([]);
  });
});
