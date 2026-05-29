import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import App from '../App.jsx';

describe('App', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            data: {
              health: {
                status: 'ok',
                service: 'api',
                database: 'connected',
              },
            },
          }),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('shows the initial loading state', () => {
    render(<App />);

    expect(screen.getByText('Infrastructure is wired.')).toBeInTheDocument();
    expect(screen.getAllByText('loading')).toHaveLength(2);
  });

  test('renders API health status from GraphQL response', async () => {
    render(<App />);

    expect(await screen.findByText('ok')).toBeInTheDocument();
    expect(screen.getByText('api')).toBeInTheDocument();
    expect(screen.getByText('connected')).toBeInTheDocument();
  });
});
