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

import { NotesPage } from '../pages/NotesPage';

function setupMutations({
  createImpl = vi.fn().mockResolvedValue({}),
  updateImpl = vi.fn().mockResolvedValue({}),
  deleteImpl = vi.fn().mockResolvedValue({}),
} = {}) {
  useMutationMock.mockReset();
  useMutationMock.mockImplementation((document) => {
    const operationName = document?.definitions?.[0]?.name?.value;

    if (operationName === 'CreateNote') return [createImpl, { loading: false }];
    if (operationName === 'UpdateNote') return [updateImpl, { loading: false }];
    if (operationName === 'DeleteNote') return [deleteImpl, { loading: false }];
    return [vi.fn(), { loading: false }];
  });

  return { createImpl, updateImpl, deleteImpl };
}

describe('NotesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    useQueryMock.mockImplementation((document) => {
      const operationName = document?.definitions?.[0]?.name?.value;
      if (operationName === 'Notes') {
        return { data: undefined, loading: true, error: undefined, refetch: vi.fn() };
      }

      return {
        data: { topics: [], questions: [] },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      };
    });
    setupMutations();

    render(<NotesPage />);

    expect(screen.getByText('Loading notes...')).toBeInTheDocument();
  });

  it('renders notes and lets the user create, edit, and delete notes', async () => {
    const refetch = vi.fn().mockResolvedValue(undefined);
    const createImpl = vi.fn().mockResolvedValue({ data: { createNote: { id: '2' } } });
    const updateImpl = vi.fn().mockResolvedValue({ data: { updateNote: { id: '1' } } });
    const deleteImpl = vi.fn().mockResolvedValue({ data: { deleteNote: true } });

    useQueryMock.mockImplementation((document) => {
      const operationName = document?.definitions?.[0]?.name?.value;

      if (operationName === 'Notes') {
        return {
          data: {
            notes: [
              {
                id: '1',
                topicId: 'topic-1',
                questionId: null,
                body: 'Remember memoization.',
              },
            ],
          },
          loading: false,
          error: undefined,
          refetch,
        };
      }

      if (operationName === 'Questions') {
        return {
          data: {
            questions: [{ id: 'question-1', prompt: 'What is React?' }],
          },
          loading: false,
          error: undefined,
          refetch,
        };
      }

      return {
        data: {
          topics: [{ id: 'topic-1', title: 'JavaScript' }],
        },
        loading: false,
        error: undefined,
        refetch,
      };
    });
    setupMutations({ createImpl, updateImpl, deleteImpl });

    render(<NotesPage />);

    expect(screen.getByRole('heading', { name: 'Remember memoization.' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Parent type'), {
      target: { value: 'question' },
    });
    fireEvent.change(screen.getByLabelText('Parent'), {
      target: { value: 'question-1' },
    });
    fireEvent.change(screen.getByLabelText('Body'), {
      target: { value: 'Use plain language and examples.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create note' }));

    await waitFor(() => {
      expect(createImpl).toHaveBeenCalledWith({
        variables: {
          input: {
            questionId: 'question-1',
            body: 'Use plain language and examples.',
          },
        },
      });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByLabelText('Body'), {
      target: { value: 'Remember closures and scope.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update note' }));

    await waitFor(() => {
      expect(updateImpl).toHaveBeenCalledWith({
        variables: {
          id: '1',
          input: {
            body: 'Remember closures and scope.',
          },
        },
      });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }));

    await waitFor(() => {
      expect(deleteImpl).toHaveBeenCalledWith({
        variables: { id: '1' },
      });
    });
  });

  it('shows a validation error when body is missing', () => {
    useQueryMock.mockImplementation((document) => {
      const operationName = document?.definitions?.[0]?.name?.value;

      if (operationName === 'Notes') {
        return { data: { notes: [] }, loading: false, error: undefined, refetch: vi.fn() };
      }

      if (operationName === 'Questions') {
        return { data: { questions: [] }, loading: false, error: undefined, refetch: vi.fn() };
      }

      return {
        data: { topics: [{ id: 'topic-1', title: 'JavaScript' }] },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      };
    });
    setupMutations();

    render(<NotesPage />);

    fireEvent.change(screen.getByLabelText('Parent'), {
      target: { value: 'topic-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create note' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Note body is required.');
  });
});
