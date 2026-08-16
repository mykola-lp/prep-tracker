import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { HealthPage } from '../pages/HealthPage';

describe('HealthPage', () => {
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

  test('shows the initial loading state', async () => {
    render(<HealthPage />);

    expect(screen.getByText('Infrastructure is wired.')).toBeInTheDocument();
    expect(screen.getAllByText('loading')).toHaveLength(2);

    await waitFor(() => expect(screen.getByText('ok')).toBeInTheDocument());
  });

  test('renders API health status from GraphQL response', async () => {
    render(<HealthPage />);

    expect(await screen.findByText('ok')).toBeInTheDocument();
    expect(screen.getByText('api')).toBeInTheDocument();
    expect(screen.getByText('connected')).toBeInTheDocument();
  });
});
