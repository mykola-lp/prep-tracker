import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useQueryMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: useQueryMock,
}));

import { DashboardPage } from '../pages/DashboardPage';

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });

    render(<DashboardPage />);

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error('Network error'),
    });

    render(<DashboardPage />);

    expect(screen.getByRole('heading', { name: 'Unable to load dashboard.' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Check your connection and try again. If the problem continues, refresh the page.'
      )
    ).toBeInTheDocument();
  });

  it('renders summary data and attention items', () => {
    useQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: {
        dashboardSummary: {
          totals: {
            topics: 3,
            questions: 5,
            notes: 2,
            completedTopics: 1,
            completedQuestions: 2,
            overdueItems: 1,
            reviewItems: 2,
          },
          topicsByStatus: [
            { status: 'new', count: 1 },
            { status: 'learning', count: 1 },
            { status: 'reviewing', count: 0 },
            { status: 'done', count: 1 },
          ],
          questionsByStatus: [
            { status: 'new', count: 2 },
            { status: 'learning', count: 1 },
            { status: 'reviewing', count: 1 },
            { status: 'done', count: 1 },
          ],
          overdueItems: [
            {
              id: '1',
              type: 'topic',
              title: 'Algorithms',
              status: 'learning',
              deadline: '2026-08-10',
            },
          ],
          reviewItems: [
            {
              id: '2',
              type: 'question',
              title: 'What is memoization?',
              status: 'reviewing',
              deadline: '2026-08-20',
            },
          ],
          upcomingDeadlines: [
            {
              id: '3',
              type: 'topic',
              title: 'React',
              status: 'new',
              deadline: '2026-08-25',
            },
          ],
        },
      },
    });

    render(<DashboardPage />);

    expect(screen.getByRole('heading', { name: 'Quick prep overview' })).toBeInTheDocument();
    expect(screen.getByText('Topics')).toBeInTheDocument();
    expect(screen.getByText('Questions')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Needs attention')).toBeInTheDocument();
    expect(screen.getByText('Algorithms')).toBeInTheDocument();
    expect(screen.getByText('What is memoization?')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });
});

import { AttentionList } from '../components/AttentionList';
import { StatusBreakdownList } from '../components/StatusBreakdownList';
import { SummaryCard } from '../components/SummaryCard';

describe('dashboard components', () => {
  it('renders summary card content', () => {
    render(<SummaryCard label="Topics" value={5} hint="3 completed" />);

    expect(screen.getByText('Topics')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3 completed')).toBeInTheDocument();
  });

  it('renders status breakdown rows', () => {
    render(
      <StatusBreakdownList
        title="Topics by status"
        items={[
          { status: 'new', label: 'New', count: 2 },
          { status: 'done', label: 'Done', count: 4 },
        ]}
      />
    );

    expect(screen.getByRole('heading', { name: 'Topics by status' })).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders empty and populated attention states', () => {
    const { rerender } = render(
      <AttentionList title="Overdue" items={[]} emptyLabel="No overdue items." variant="overdue" />
    );

    expect(screen.getByText('No overdue items.')).toBeInTheDocument();

    rerender(
      <AttentionList
        title="Overdue"
        items={[
          {
            id: '1',
            type: 'topic',
            typeLabel: 'Topic',
            title: 'JavaScript',
            statusLabel: 'Reviewing',
            deadlineLabel: 'Due 2026-08-10',
          },
        ]}
        emptyLabel="No overdue items."
        variant="overdue"
      />
    );

    expect(screen.getByText('Topic · Reviewing')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Due 2026-08-10')).toBeInTheDocument();
  });
});
