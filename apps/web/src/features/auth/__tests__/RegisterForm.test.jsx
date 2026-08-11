import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { navigateMock, setTokenMock, setUserMock, registerMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  setTokenMock: vi.fn(),
  setUserMock: vi.fn(),
  registerMock: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@apollo/client/react', () => ({
  useMutation: () => [registerMock, { loading: false }],
}));

vi.mock('@/lib/storage', () => ({
  storage: {
    setToken: setTokenMock,
    removeToken: vi.fn(),
    getToken: vi.fn(),
  },
}));

vi.mock('../store/authStore', () => ({
  useAuthStore: (selector) =>
    selector({
      setUser: setUserMock,
    }),
}));

import { RegisterForm } from '../components/RegisterForm';

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a validation error when password is missing', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Password is required.');
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('shows API errors when registration fails', async () => {
    registerMock.mockRejectedValueOnce({
      graphQLErrors: [{ message: 'User already exists' }],
    });

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Display name'), {
      target: { value: 'New User' },
    });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('User already exists');
    expect(setTokenMock).not.toHaveBeenCalled();
    expect(setUserMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('stores the token and redirects to dashboard after registration', async () => {
    registerMock.mockResolvedValueOnce({
      data: {
        register: {
          token: 'token-456',
          user: { id: '2', email: 'new@example.com', displayName: 'New User' },
        },
      },
    });

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Display name'), {
      target: { value: 'New User' },
    });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(registerMock).toHaveBeenCalledWith({
      variables: {
        input: {
          email: 'new@example.com',
          password: 'password123',
          displayName: 'New User',
        },
      },
    });
    await waitFor(() => {
      expect(setTokenMock).toHaveBeenCalledWith('token-456');
      expect(setUserMock).toHaveBeenCalledWith({
        id: '2',
        email: 'new@example.com',
        displayName: 'New User',
      });
      expect(navigateMock).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });
});
