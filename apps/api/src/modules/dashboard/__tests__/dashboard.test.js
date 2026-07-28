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

function countByStatus(statusCounts, status) {
  return statusCounts.find((item) => item.status === status)?.count;
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
    const laterTopic = await createTopic(user.token, {
      title: 'React',
      deadline: '2026-09-10',
    });
    const earlierTopic = await createTopic(user.token, {
      title: 'JavaScript',
      deadline: '2026-08-01',
    });
    const topic = await createTopic(user.token, { title: 'Databases' });

    await createQuestion(user.token, topic.id, {
      prompt: 'What is an index?',
      deadline: '2026-08-15',
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
        deadline: '2026-08-01',
      },
      {
        type: 'question',
        title: 'What is an index?',
        deadline: '2026-08-15',
      },
      {
        id: laterTopic.id,
        type: 'topic',
        title: 'React',
        deadline: '2026-09-10',
      },
    ]);
  });

  it('does not include another user progress data', async () => {
    const userA = await registerUser('summary-owner@test.com');
    const userB = await registerUser('summary-other@test.com');

    await createTopic(userA.token, {
      title: 'Private Topic',
      deadline: '2026-08-01',
    });

    const foreignTopic = await createTopic(userB.token, {
      title: 'Other Topic',
      deadline: '2026-07-30',
    });
    await updateTopic(userB.token, foreignTopic.id, { status: 'done' });
    await createQuestion(userB.token, foreignTopic.id, {
      prompt: 'Other question',
      deadline: '2026-08-15',
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
});
