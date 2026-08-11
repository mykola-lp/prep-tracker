import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { navigateMock, setTokenMock, setUserMock, loginMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  setTokenMock: vi.fn(),
  setUserMock: vi.fn(),
  loginMock: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    useNavigate: () => navigateMock,
    useLocation: () => ({ state: { from: { pathname: '/topics', search: '?q=1', hash: '#top' } } }),
  };
});

vi.mock('@apollo/client/react', () => ({
  useMutation: () => [loginMock, { loading: false }],
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

import { LoginForm } from '../components/LoginForm';

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a validation error when email is missing', async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Email is required.');
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('shows API errors when login fails', async () => {
    loginMock.mockRejectedValueOnce({
      graphQLErrors: [{ message: 'Invalid credentials' }],
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
    expect(setTokenMock).not.toHaveBeenCalled();
    expect(setUserMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('stores the token and redirects to the original route after login', async () => {
    loginMock.mockResolvedValueOnce({
      data: {
        login: {
          token: 'token-123',
          user: { id: '1', email: 'user@example.com', displayName: 'User' },
        },
      },
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(loginMock).toHaveBeenCalledWith({
      variables: {
        input: {
          email: 'user@example.com',
          password: 'password123',
        },
      },
    });
    await waitFor(() => {
      expect(setTokenMock).toHaveBeenCalledWith('token-123');
      expect(setUserMock).toHaveBeenCalledWith({
        id: '1',
        email: 'user@example.com',
        displayName: 'User',
      });
      expect(navigateMock).toHaveBeenCalledWith('/topics?q=1#top', { replace: true });
    });
  });
});
