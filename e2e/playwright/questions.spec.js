import { randomUUID } from 'node:crypto';

import { expect, test } from '@playwright/test';

const REGISTER_MUTATION = `#graphql
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        displayName
      }
    }
  }
`;

const CREATE_TOPIC_MUTATION = `#graphql
  mutation CreateTopic($input: CreateTopicInput!) {
    createTopic(input: $input) {
      id
      title
      description
      status
      deadline
    }
  }
`;

const CREATE_QUESTION_MUTATION = `#graphql
  mutation CreateQuestion($input: CreateQuestionInput!) {
    createQuestion(input: $input) {
      id
      topicId
      prompt
      answer
      status
      deadline
    }
  }
`;

const UPDATE_QUESTION_MUTATION = `#graphql
  mutation UpdateQuestion($id: ID!, $input: UpdateQuestionInput!) {
    updateQuestion(id: $id, input: $input) {
      id
      topicId
      prompt
      answer
      status
      deadline
    }
  }
`;

async function registerUser(request, user) {
  const response = await request.post('/api/graphql', {
    data: {
      query: REGISTER_MUTATION,
      variables: {
        input: user,
      },
    },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.errors).toBeUndefined();

  return body.data.register;
}

async function createTopic(request, token, input) {
  const response = await request.post('/api/graphql', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      query: CREATE_TOPIC_MUTATION,
      variables: {
        input,
      },
    },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.errors).toBeUndefined();

  return body.data.createTopic;
}

async function createQuestion(request, token, input) {
  const response = await request.post('/api/graphql', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      query: CREATE_QUESTION_MUTATION,
      variables: {
        input,
      },
    },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.errors).toBeUndefined();

  return body.data.createQuestion;
}

async function updateQuestion(request, token, id, input) {
  const response = await request.post('/api/graphql', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      query: UPDATE_QUESTION_MUTATION,
      variables: {
        id,
        input,
      },
    },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.errors).toBeUndefined();

  return body.data.updateQuestion;
}

test.describe('questions flow', () => {
  test('renders questions list with metadata for the current user', async ({ page }) => {
    const email = `questions-${randomUUID()}@example.com`;
    const password = 'password123';
    const user = await registerUser(page.request, {
      email,
      password,
      displayName: 'Questions User',
    });

    const topic = await createTopic(page.request, user.token, {
      title: 'JavaScript',
      description: 'Core language topics',
      deadline: '2026-08-20',
    });

    const question = await createQuestion(page.request, user.token, {
      topicId: topic.id,
      prompt: 'What is a closure?',
      deadline: '2026-08-21',
    });

    await updateQuestion(page.request, user.token, question.id, {
      answer: 'A function bundled with its lexical scope.',
      status: 'learning',
      deadline: '2026-08-22',
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.getByRole('link', { name: 'Questions' }).click();

    await expect(page.getByRole('heading', { name: 'Practice questions by topic' })).toBeVisible();
    const questionCard = page
      .getByRole('article')
      .filter({ has: page.getByRole('heading', { name: 'What is a closure?' }) });

    await expect(questionCard.getByRole('heading', { name: 'What is a closure?' })).toBeVisible();
    await expect(questionCard.getByText('learning', { exact: true })).toBeVisible();
    await expect(questionCard.getByText('2026-08-22')).toBeVisible();
    await expect(questionCard.getByText('JavaScript')).toBeVisible();
    await expect(
      questionCard.getByText('A function bundled with its lexical scope.')
    ).toBeVisible();
  });

  test('creates, edits, and deletes a question through the UI', async ({ page }) => {
    const email = `questions-${randomUUID()}@example.com`;
    const password = 'password123';
    const user = await registerUser(page.request, {
      email,
      password,
      displayName: 'Questions User',
    });

    const topic = await createTopic(page.request, user.token, {
      title: 'System design',
      description: 'Scaling and architecture',
      deadline: '2026-08-30',
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.getByRole('link', { name: 'Questions' }).click();

    const form = page.locator('form').first();
    const selects = form.locator('select');
    await selects.nth(0).selectOption(topic.id);
    await form.getByLabel('Prompt').fill('How do you scale reads?');
    await form.getByLabel('Deadline').fill('2026-08-25');
    await page.getByRole('button', { name: 'Create question' }).click();

    const createdQuestionCard = page
      .getByRole('article')
      .filter({ hasText: 'How do you scale reads?' });

    await expect(createdQuestionCard).toBeVisible();
    await expect(
      createdQuestionCard.getByRole('heading', { name: 'How do you scale reads?' })
    ).toBeVisible();
    await expect(createdQuestionCard.getByText('new', { exact: true })).toBeVisible();
    await expect(createdQuestionCard.getByText('2026-08-25')).toBeVisible();
    await expect(createdQuestionCard.getByText('System design')).toBeVisible();
    await expect(createdQuestionCard.getByText('Use read replicas and caching.')).toHaveCount(0);

    await page.getByRole('button', { name: 'Edit' }).last().click();
    await expect(page.getByRole('heading', { name: 'Edit question' })).toBeVisible();

    await page.getByLabel('Prompt').fill('How do you scale reads in production?');
    await page.getByLabel('Answer').fill('Use read replicas, caching, and queues.');
    await page.getByLabel('Status').selectOption('reviewing');
    await page.getByLabel('Deadline').fill('2026-08-28');
    await page.getByRole('button', { name: 'Update question' }).click();

    const updatedQuestionCard = page
      .getByRole('article')
      .filter({ hasText: 'How do you scale reads in production?' });

    await expect(updatedQuestionCard).toBeVisible();
    await expect(updatedQuestionCard.getByText('reviewing', { exact: true })).toBeVisible();
    await expect(updatedQuestionCard.getByText('2026-08-28')).toBeVisible();
    await expect(
      updatedQuestionCard.getByText('Use read replicas, caching, and queues.')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Delete' }).last().click();
    await expect(page.getByRole('button', { name: 'Confirm delete' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('button', { name: 'Confirm delete' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Delete' }).last().click();
    await page.getByRole('button', { name: 'Confirm delete' }).click();

    await expect(
      page.getByRole('heading', { name: 'How do you scale reads in production?' })
    ).toHaveCount(0);
  });

  test('shows the empty state for a user without questions', async ({ page }) => {
    const email = `questions-${randomUUID()}@example.com`;
    const password = 'password123';

    await registerUser(page.request, {
      email,
      password,
      displayName: 'Questions User',
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.getByRole('link', { name: 'Questions' }).click();

    await expect(page.getByText('No questions yet.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Practice questions by topic' })).toBeVisible();
  });

  test('shows a validation error when prompt is missing', async ({ page }) => {
    const email = `questions-${randomUUID()}@example.com`;
    const password = 'password123';
    const user = await registerUser(page.request, {
      email,
      password,
      displayName: 'Questions User',
    });

    const topic = await createTopic(page.request, user.token, {
      title: 'JavaScript',
      description: 'Core language topics',
      deadline: '2026-08-20',
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.getByRole('link', { name: 'Questions' }).click();
    const form = page.locator('form').first();
    const selects = form.locator('select');
    await selects.nth(0).selectOption(topic.id);
    await page.getByRole('button', { name: 'Create question' }).click();

    await expect(page.getByRole('alert')).toHaveText('Question prompt is required.');
  });
});
