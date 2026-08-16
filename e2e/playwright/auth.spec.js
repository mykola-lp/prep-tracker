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

const LOGIN_MUTATION = `#graphql
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        displayName
      }
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

async function loginUser(request, user) {
  const response = await request.post('/api/graphql', {
    data: {
      query: LOGIN_MUTATION,
      variables: {
        input: user,
      },
    },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.errors).toBeUndefined();

  return body.data.login;
}

test.describe('auth flow', () => {
  test('shows login and register screens', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

    await page.goto('/register');

    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
    await expect(page.getByLabel('Display name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
  });

  test('shows validation errors in the UI', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('alert')).toHaveText('Email is required.');

    await page.goto('/register');
    await page.getByLabel('Email').fill('new-user@example.com');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByRole('alert')).toHaveText('Password is required.');
  });

  test('shows API errors for invalid credentials and duplicate registration', async ({ page }) => {
    const email = `auth-${randomUUID()}@example.com`;
    const password = 'password123';

    await registerUser(page.request, {
      email,
      password,
      displayName: 'Auth User',
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('alert')).toHaveText('Invalid credentials');

    await page.goto('/register');
    await page.getByLabel('Display name').fill('Auth User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByRole('alert')).toHaveText('User already exists');
  });

  test('registers, logs in, redirects back from protected routes, and logs out', async ({
    page,
  }) => {
    const email = `auth-${randomUUID()}@example.com`;
    const password = 'password123';

    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('alert')).toHaveText('Invalid credentials');

    await page.goto('/register');
    await page.getByLabel('Display name').fill('Auth User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Quick prep overview' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();

    await page.getByRole('button', { name: 'Logout' }).click();

    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

    const afterLogoutToken = await page.evaluate(() => localStorage.getItem('token'));
    expect(afterLogoutToken).toBeNull();
  });

  test('logs in with an existing user', async ({ page }) => {
    const email = `auth-${randomUUID()}@example.com`;
    const password = 'password123';

    await registerUser(page.request, {
      email,
      password,
      displayName: 'Auth User',
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Quick prep overview' })).toBeVisible();

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });
});
