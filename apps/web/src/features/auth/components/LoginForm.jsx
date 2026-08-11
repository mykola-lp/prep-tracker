import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { routePaths } from '@/app/router/routePaths';
import { storage } from '@/lib/storage';
import { LOGIN_MUTATION } from '../graphql/loginMutation';
import { useAuthStore } from '../store/authStore';

import styles from './Form.module.css';

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [login, { loading }] = useMutation(LOGIN_MUTATION);

  function getRedirectTarget() {
    const from = location.state?.from;

    if (from?.pathname) {
      return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`;
    }

    return routePaths.dashboard;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    try {
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

      navigate(getRedirectTarget(), { replace: true });
    } catch (err) {
      const message = err?.graphQLErrors?.[0]?.message || err?.message || 'Unable to sign in.';
      setError(message);
    }
  }

  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Prep Tracker</p>

        <h1 className={styles.title}>Sign in</h1>

        <p className={styles.lead}>Use your account to continue into the dashboard.</p>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Password</span>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </label>

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className={styles.footer}>
          Need an account? <Link to={routePaths.register}>Create one</Link>
        </p>
      </section>
    </main>
  );
}
