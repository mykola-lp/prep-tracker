import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router';

import { storage } from '@/lib/storage';
import { LOGIN_MUTATION } from '../graphql/loginMutation';
import { useAuthStore } from '../store/authStore';

export function LoginForm() {
  const navigate = useNavigate();

  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [login] = useMutation(LOGIN_MUTATION);

  async function handleSubmit(event) {
    event.preventDefault();

    const { data } = await login({
      variables: {
        input: {
          email,
          password,
        },
      },
    });

    storage.setToken(data.login.token);

    setUser(data.login.user);

    navigate('/dashboard');
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />

      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <button type="submit">Login</button>
    </form>
  );
}
