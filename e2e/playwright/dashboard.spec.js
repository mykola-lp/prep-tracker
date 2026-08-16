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

const UPDATE_TOPIC_MUTATION = `#graphql
  mutation UpdateTopic($id: ID!, $input: UpdateTopicInput!) {
    updateTopic(id: $id, input: $input) {
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

const CREATE_NOTE_MUTATION = `#graphql
  mutation CreateNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      id
      topicId
      questionId
      body
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

async function updateTopic(request, token, id, input) {
  const response = await request.post('/api/graphql', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      query: UPDATE_TOPIC_MUTATION,
      variables: {
        id,
        input,
      },
    },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.errors).toBeUndefined();

  return body.data.updateTopic;
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

async function createNote(request, token, input) {
  const response = await request.post('/api/graphql', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      query: CREATE_NOTE_MUTATION,
      variables: {
        input,
      },
    },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.errors).toBeUndefined();

  return body.data.createNote;
}

test.describe('dashboard flow', () => {
  test('shows summary metrics and attention items for the current user', async ({ page }) => {
    const email = `dashboard-${randomUUID()}@example.com`;
    const password = 'password123';
    const user = await registerUser(page.request, {
      email,
      password,
      displayName: 'Dashboard User',
    });

    const overdueTopic = await createTopic(page.request, user.token, {
      title: 'Algorithms',
      description: 'Core problem solving',
      deadline: '2026-08-10',
    });
    const reviewTopic = await createTopic(page.request, user.token, {
      title: 'React',
      description: 'Hooks and rendering',
      deadline: '2026-08-25',
    });
    const upcomingTopic = await createTopic(page.request, user.token, {
      title: 'Databases',
      description: 'Modeling and queries',
      deadline: '2026-09-01',
    });

    const overdueQuestion = await createQuestion(page.request, user.token, {
      topicId: overdueTopic.id,
      prompt: 'What is dynamic programming?',
      deadline: '2026-08-09',
    });
    const reviewQuestion = await createQuestion(page.request, user.token, {
      topicId: reviewTopic.id,
      prompt: 'How do hooks work?',
      deadline: '2026-08-26',
    });
    await createQuestion(page.request, user.token, {
      topicId: upcomingTopic.id,
      prompt: 'What is indexing?',
      deadline: '2026-09-03',
    });

    await updateTopic(page.request, user.token, overdueTopic.id, {
      status: 'learning',
    });
    await updateTopic(page.request, user.token, reviewTopic.id, {
      status: 'reviewing',
    });
    await updateQuestion(page.request, user.token, overdueQuestion.id, {
      status: 'learning',
    });
    await updateQuestion(page.request, user.token, reviewQuestion.id, {
      status: 'reviewing',
    });

    await createNote(page.request, user.token, {
      topicId: overdueTopic.id,
      body: 'Focus on recurrence relation patterns.',
    });
    await createNote(page.request, user.token, {
      questionId: reviewQuestion.id,
      body: 'Explain hooks with a concrete example.',
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');

    await expect(page.getByRole('heading', { name: 'Quick prep overview' })).toBeVisible();

    const summaryMetrics = page.getByLabel('Summary metrics');
    const summaryCards = summaryMetrics.getByRole('article');
    await expect(summaryCards).toHaveCount(4);

    const topicsCard = summaryCards.nth(0);
    await expect(topicsCard.getByText('Topics', { exact: true })).toBeVisible();
    await expect(topicsCard.getByText('3', { exact: true })).toBeVisible();
    await expect(topicsCard.getByText('0 completed', { exact: true })).toBeVisible();

    const questionsCard = summaryCards.nth(1);
    await expect(questionsCard.getByText('Questions', { exact: true })).toBeVisible();
    await expect(questionsCard.getByText('3', { exact: true })).toBeVisible();
    await expect(questionsCard.getByText('0 completed', { exact: true })).toBeVisible();

    const notesCard = summaryCards.nth(2);
    await expect(notesCard.getByText('Notes', { exact: true })).toBeVisible();
    await expect(notesCard.getByText('2', { exact: true })).toBeVisible();
    await expect(notesCard.getByText('Captured notes', { exact: true })).toBeVisible();

    const attentionCard = summaryCards.nth(3);
    await expect(attentionCard.getByText('Needs attention', { exact: true })).toBeVisible();
    await expect(attentionCard.getByText('4', { exact: true })).toBeVisible();
    await expect(attentionCard.getByText('2 overdue, 2 in review', { exact: true })).toBeVisible();

    const topicsStatusCard = page.getByRole('heading', { name: 'Topics by status' }).locator('..');
    const topicsStatusRows = topicsStatusCard.getByRole('listitem');
    await expect(topicsStatusRows).toHaveCount(4);
    await expect(topicsStatusRows.nth(0).getByText('New', { exact: true })).toBeVisible();
    await expect(topicsStatusRows.nth(0).getByText('1', { exact: true })).toBeVisible();
    await expect(topicsStatusRows.nth(1).getByText('Learning', { exact: true })).toBeVisible();
    await expect(topicsStatusRows.nth(1).getByText('1', { exact: true })).toBeVisible();
    await expect(topicsStatusRows.nth(2).getByText('Reviewing', { exact: true })).toBeVisible();
    await expect(topicsStatusRows.nth(2).getByText('1', { exact: true })).toBeVisible();
    await expect(topicsStatusRows.nth(3).getByText('Done', { exact: true })).toBeVisible();
    await expect(topicsStatusRows.nth(3).getByText('0', { exact: true })).toBeVisible();

    const questionsStatusCard = page
      .getByRole('heading', { name: 'Questions by status' })
      .locator('..');
    const questionsStatusRows = questionsStatusCard.getByRole('listitem');
    await expect(questionsStatusRows).toHaveCount(4);
    await expect(questionsStatusRows.nth(0).getByText('New', { exact: true })).toBeVisible();
    await expect(questionsStatusRows.nth(0).getByText('1', { exact: true })).toBeVisible();
    await expect(questionsStatusRows.nth(1).getByText('Learning', { exact: true })).toBeVisible();
    await expect(questionsStatusRows.nth(1).getByText('1', { exact: true })).toBeVisible();
    await expect(questionsStatusRows.nth(2).getByText('Reviewing', { exact: true })).toBeVisible();
    await expect(questionsStatusRows.nth(2).getByText('1', { exact: true })).toBeVisible();
    await expect(questionsStatusRows.nth(3).getByText('Done', { exact: true })).toBeVisible();
    await expect(questionsStatusRows.nth(3).getByText('0', { exact: true })).toBeVisible();

    const overdueItemsCard = page.getByRole('heading', { name: 'Overdue' }).locator('..');
    await expect(overdueItemsCard.getByText('Algorithms', { exact: true })).toBeVisible();
    await expect(
      overdueItemsCard.getByText('What is dynamic programming?', { exact: true })
    ).toBeVisible();
    await expect(overdueItemsCard.getByText('Due 2026-08-10', { exact: true })).toBeVisible();
    await expect(overdueItemsCard.getByText('Due 2026-08-09', { exact: true })).toBeVisible();
    await expect(overdueItemsCard.getByText('Topic · Learning', { exact: true })).toBeVisible();
    await expect(overdueItemsCard.getByText('Question · Learning', { exact: true })).toBeVisible();

    const reviewItemsCard = page.getByRole('heading', { name: 'Review' }).locator('..');
    await expect(reviewItemsCard.getByText('React', { exact: true })).toBeVisible();
    await expect(reviewItemsCard.getByText('How do hooks work?', { exact: true })).toBeVisible();
    await expect(reviewItemsCard.getByText('Due 2026-08-25', { exact: true })).toBeVisible();
    await expect(reviewItemsCard.getByText('Due 2026-08-26', { exact: true })).toBeVisible();
    await expect(reviewItemsCard.getByText('Topic · Reviewing', { exact: true })).toBeVisible();
    await expect(reviewItemsCard.getByText('Question · Reviewing', { exact: true })).toBeVisible();

    const upcomingItemsCard = page.getByRole('heading', { name: 'Upcoming' }).locator('..');
    await expect(upcomingItemsCard.getByText('Databases', { exact: true })).toBeVisible();
    await expect(upcomingItemsCard.getByText('What is indexing?', { exact: true })).toBeVisible();
    await expect(upcomingItemsCard.getByText('Due 2026-09-01', { exact: true })).toBeVisible();
    await expect(upcomingItemsCard.getByText('Due 2026-09-03', { exact: true })).toBeVisible();
    await expect(upcomingItemsCard.getByText('Topic · New', { exact: true })).toBeVisible();
    await expect(upcomingItemsCard.getByText('Question · New', { exact: true })).toBeVisible();
  });

  test('shows the empty state for a user without prep data', async ({ page }) => {
    const email = `dashboard-${randomUUID()}@example.com`;
    const password = 'password123';

    await registerUser(page.request, {
      email,
      password,
      displayName: 'Dashboard User',
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');

    await expect(page.getByRole('heading', { name: 'Quick prep overview' })).toBeVisible();

    const summaryMetrics = page.getByLabel('Summary metrics');
    const summaryCards = summaryMetrics.getByRole('article');
    await expect(summaryCards).toHaveCount(4);
    await expect(summaryCards.nth(0).getByText('0', { exact: true })).toBeVisible();
    await expect(summaryCards.nth(1).getByText('0', { exact: true })).toBeVisible();
    await expect(summaryCards.nth(2).getByText('0', { exact: true })).toBeVisible();
    await expect(summaryCards.nth(3).getByText('0', { exact: true })).toBeVisible();
    await expect(page.getByText('No overdue items.', { exact: true })).toBeVisible();
    await expect(page.getByText('Nothing currently in review.', { exact: true })).toBeVisible();
    await expect(page.getByText('No upcoming deadlines.', { exact: true })).toBeVisible();
  });
});
