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

import { QuestionsPage } from '../pages/QuestionsPage';

function setupMutations({
  createImpl = vi.fn().mockResolvedValue({}),
  updateImpl = vi.fn().mockResolvedValue({}),
  deleteImpl = vi.fn().mockResolvedValue({}),
} = {}) {
  useMutationMock.mockReset();
  useMutationMock.mockImplementation((document) => {
    const operationName = document?.definitions?.[0]?.name?.value;

    if (operationName === 'CreateQuestion') return [createImpl, { loading: false }];
    if (operationName === 'UpdateQuestion') return [updateImpl, { loading: false }];
    if (operationName === 'DeleteQuestion') return [deleteImpl, { loading: false }];
    return [vi.fn(), { loading: false }];
  });

  return { createImpl, updateImpl, deleteImpl };
}

describe('QuestionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading and empty states', () => {
    useQueryMock.mockImplementation((document) => {
      const operationName = document?.definitions?.[0]?.name?.value;
      if (operationName === 'Questions') {
        return { data: undefined, loading: true, error: undefined, refetch: vi.fn() };
      }

      return { data: { topics: [] }, loading: false, error: undefined, refetch: vi.fn() };
    });
    setupMutations();

    render(<QuestionsPage />);

    expect(screen.getByText('Loading questions...')).toBeInTheDocument();
  });

  it('renders questions and lets the user create, edit, and delete questions', async () => {
    const refetch = vi.fn().mockResolvedValue(undefined);
    const createImpl = vi.fn().mockResolvedValue({ data: { createQuestion: { id: '2' } } });
    const updateImpl = vi.fn().mockResolvedValue({ data: { updateQuestion: { id: '1' } } });
    const deleteImpl = vi.fn().mockResolvedValue({ data: { deleteQuestion: true } });

    useQueryMock.mockImplementation((document) => {
      const operationName = document?.definitions?.[0]?.name?.value;

      if (operationName === 'Questions') {
        return {
          data: {
            questions: [
              {
                id: '1',
                topicId: 'topic-1',
                prompt: 'What is a closure?',
                answer: 'A function bundled with its lexical scope.',
                status: 'reviewing',
                deadline: '2026-08-20',
              },
            ],
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

    render(<QuestionsPage />);

    expect(screen.getByRole('heading', { name: 'What is a closure?' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Topic'), {
      target: { value: 'topic-1' },
    });
    fireEvent.change(screen.getByLabelText('Prompt'), {
      target: { value: 'How does the event loop work?' },
    });
    fireEvent.change(screen.getByLabelText('Answer'), {
      target: { value: 'It processes tasks and microtasks.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create question' }));

    await waitFor(() => {
      expect(createImpl).toHaveBeenCalledWith({
        variables: {
          input: {
            topicId: 'topic-1',
            prompt: 'How does the event loop work?',
            answer: 'It processes tasks and microtasks.',
            deadline: null,
          },
        },
      });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByLabelText('Prompt'), {
      target: { value: 'What is a closure in JS?' },
    });
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'done' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update question' }));

    await waitFor(() => {
      expect(updateImpl).toHaveBeenCalledWith({
        variables: {
          id: '1',
          input: {
            prompt: 'What is a closure in JS?',
            answer: 'A function bundled with its lexical scope.',
            status: 'done',
            deadline: '2026-08-20',
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

  it('shows a validation error when prompt is missing', () => {
    useQueryMock.mockImplementation((document) => {
      const operationName = document?.definitions?.[0]?.name?.value;

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

    render(<QuestionsPage />);

    fireEvent.change(screen.getByLabelText('Topic'), {
      target: { value: 'topic-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create question' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Question prompt is required.');
  });
});
