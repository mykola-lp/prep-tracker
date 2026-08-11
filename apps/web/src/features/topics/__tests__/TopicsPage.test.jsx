import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useQueryMock, useMutationMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  useMutationMock: vi.fn(),
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: useQueryMock,
  useMutation: useMutationMock,
}));

import { TopicsPage } from '../pages/TopicsPage';

function setupMutations({
  createImpl = vi.fn().mockResolvedValue({}),
  updateImpl = vi.fn().mockResolvedValue({}),
  deleteImpl = vi.fn().mockResolvedValue({}),
  createLoading = false,
  updateLoading = false,
  deleteLoading = false,
} = {}) {
  useMutationMock.mockReset();
  useMutationMock.mockImplementation((document) => {
    const operationName = document?.definitions?.[0]?.name?.value;

    if (operationName === 'CreateTopic') {
      return [createImpl, { loading: createLoading }];
    }

    if (operationName === 'UpdateTopic') {
      return [updateImpl, { loading: updateLoading }];
    }

    if (operationName === 'DeleteTopic') {
      return [deleteImpl, { loading: deleteLoading }];
    }

    return [vi.fn(), { loading: false }];
  });

  return { createImpl, updateImpl, deleteImpl };
}

describe('TopicsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading and empty states', () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      refetch: vi.fn(),
    });
    setupMutations();

    render(<TopicsPage />);

    expect(screen.getByText('Loading topics...')).toBeInTheDocument();
    expect(screen.queryByText('No topics yet.')).not.toBeInTheDocument();
  });

  it('shows an error state when topics fail to load', () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error('Network error'),
      refetch: vi.fn(),
    });
    setupMutations();

    render(<TopicsPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load topics.');
  });

  it('renders topics and lets the user create, edit, and delete topics', async () => {
    const refetch = vi.fn().mockResolvedValue(undefined);
    const createImpl = vi.fn().mockResolvedValue({ data: { createTopic: { id: '3' } } });
    const updateImpl = vi.fn().mockResolvedValue({ data: { updateTopic: { id: '2' } } });
    const deleteImpl = vi.fn().mockResolvedValue({ data: { deleteTopic: true } });

    useQueryMock.mockReturnValue({
      data: {
        topics: [
          {
            id: '2',
            title: 'React',
            description: 'Hooks and rendering',
            status: 'learning',
            deadline: '2026-08-20',
          },
          {
            id: '1',
            title: 'Algorithms',
            description: '',
            status: 'new',
            deadline: null,
          },
        ],
      },
      loading: false,
      error: undefined,
      refetch,
    });
    setupMutations({ createImpl, updateImpl, deleteImpl });

    render(<TopicsPage />);

    expect(screen.getByRole('heading', { name: 'Algorithms' })).toBeInTheDocument();
    expect(screen.getByText('No deadline')).toBeInTheDocument();
    expect(screen.getByText('Hooks and rendering')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Databases' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'SQL and indexing' },
    });
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'reviewing' },
    });
    fireEvent.change(screen.getByLabelText('Deadline'), {
      target: { value: '2026-09-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create topic' }));

    await waitFor(() => {
      expect(createImpl).toHaveBeenCalledWith({
        variables: {
          input: {
            title: 'Databases',
            description: 'SQL and indexing',
            status: 'reviewing',
            deadline: '2026-09-01',
          },
        },
      });
    });

    await waitFor(() => expect(refetch).toHaveBeenCalled());

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    expect(screen.getByRole('heading', { name: 'Edit topic' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Algorithms')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Algorithms updated' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update topic' }));

    await waitFor(() => {
      expect(updateImpl).toHaveBeenCalledWith({
        variables: {
          id: '1',
          input: {
            title: 'Algorithms updated',
            description: null,
            status: 'new',
            deadline: null,
          },
        },
      });
    });

    await waitFor(() => expect(refetch).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    expect(screen.getByRole('button', { name: 'Confirm delete' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }));

    await waitFor(() => {
      expect(deleteImpl).toHaveBeenCalledWith({
        variables: {
          id: '1',
        },
      });
    });

    await waitFor(() => expect(refetch).toHaveBeenCalledTimes(3));
  });

  it('shows a validation error when the topic title is missing', () => {
    useQueryMock.mockReturnValue({
      data: { topics: [] },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    });
    setupMutations();

    render(<TopicsPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Create topic' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Topic title is required.');
  });
});
