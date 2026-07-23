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
    }
  }
`;

const CREATE_QUESTION_MUTATION = `#graphql
  mutation CreateQuestion($input: CreateQuestionInput!) {
    createQuestion(input: $input) {
      id
      prompt
      answer
      status
    }
  }
`;

const UPDATE_QUESTION_MUTATION = `#graphql
  mutation UpdateQuestion($id: ID!, $input: UpdateQuestionInput!) {
    updateQuestion(id: $id, input: $input) {
      id
      prompt
      status
    }
  }
`;

const DELETE_QUESTION_MUTATION = `#graphql
  mutation DeleteQuestion($id: ID!) {
    deleteQuestion(id: $id)
  }
`;

const QUESTIONS_QUERY = `#graphql
  query Questions {
    questions {
      id
      prompt
      status
    }
  }
`;

const QUESTION_QUERY = `#graphql
  query Question($id: ID!) {
    question(id: $id) {
      id
      prompt
      status
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

  return response.body.data?.createQuestion;
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

describe('Questions GraphQL ownership', () => {
  beforeEach(async () => {
    await models.User.destroy({
      where: {},
      truncate: true,
      cascade: true,
    });
  });

  it('requires authentication to create a question', async () => {
    const response = await graphql({
      query: CREATE_QUESTION_MUTATION,
      variables: {
        input: {
          topicId: 1,
          prompt: 'What is a closure?',
        },
      },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Unauthorized');
    expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  it('creates a question for a topic owned by the current user', async () => {
    const user = await registerUser('owner@test.com');
    const topic = await createTopic(user.token);

    const question = await createQuestion(user.token, topic.id);

    expect(question.prompt).toBe('What is a closure?');

    const storedQuestion = await models.Question.findByPk(question.id);

    expect(storedQuestion.userId).toBe(Number(user.user.id));
    expect(storedQuestion.topicId).toBe(Number(topic.id));
  });

  it('rejects creating a question under another user topic', async () => {
    const userA = await registerUser('topic-owner@test.com');
    const userB = await registerUser('question-creator@test.com');
    const topic = await createTopic(userA.token);

    const response = await graphql({
      query: CREATE_QUESTION_MUTATION,
      token: userB.token,
      variables: {
        input: {
          topicId: topic.id,
          prompt: 'Trying to attach to a foreign topic',
        },
      },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Not found');
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(response.body.data?.createQuestion).toBeFalsy();
  });

  it('lists only questions owned by the current user', async () => {
    const userA = await registerUser('user-a@test.com');
    const userB = await registerUser('user-b@test.com');
    const topicA = await createTopic(userA.token);

    await createQuestion(userA.token, topicA.id);

    const response = await graphql({
      query: QUESTIONS_QUERY,
      token: userB.token,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.questions).toEqual([]);
  });

  it('does not return another user question by id', async () => {
    const userA = await registerUser('detail-a@test.com');
    const userB = await registerUser('detail-b@test.com');
    const topic = await createTopic(userA.token);
    const question = await createQuestion(userA.token, topic.id);

    const response = await graphql({
      query: QUESTION_QUERY,
      token: userB.token,
      variables: {
        id: question.id,
      },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Not found');
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(response.body.data.question).toBeNull();
  });

  it('rejects updating another user question', async () => {
    const userA = await registerUser('update-a@test.com');
    const userB = await registerUser('update-b@test.com');
    const topic = await createTopic(userA.token);
    const question = await createQuestion(userA.token, topic.id);

    const response = await graphql({
      query: UPDATE_QUESTION_MUTATION,
      token: userB.token,
      variables: {
        id: question.id,
        input: {
          status: 'answered',
        },
      },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Not found');
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
  });

  it('rejects deleting another user question', async () => {
    const userA = await registerUser('delete-a@test.com');
    const userB = await registerUser('delete-b@test.com');
    const topic = await createTopic(userA.token);
    const question = await createQuestion(userA.token, topic.id);

    const response = await graphql({
      query: DELETE_QUESTION_MUTATION,
      token: userB.token,
      variables: {
        id: question.id,
      },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe('Not found');
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
  });

  it('updates and deletes questions owned by the current user', async () => {
    const user = await registerUser('owner-actions@test.com');
    const topic = await createTopic(user.token);
    const question = await createQuestion(user.token, topic.id);

    const updateResponse = await graphql({
      query: UPDATE_QUESTION_MUTATION,
      token: user.token,
      variables: {
        id: question.id,
        input: {
          status: 'answered',
        },
      },
    });

    expect(updateResponse.body.errors).toBeUndefined();
    expect(updateResponse.body.data.updateQuestion.status).toBe('answered');

    const deleteResponse = await graphql({
      query: DELETE_QUESTION_MUTATION,
      token: user.token,
      variables: {
        id: question.id,
      },
    });

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteQuestion).toBe(true);

    const storedQuestion = await models.Question.findByPk(question.id);

    expect(storedQuestion).toBeNull();
  });
});
