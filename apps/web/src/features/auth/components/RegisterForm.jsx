import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { Link, useNavigate } from 'react-router-dom';

import { routePaths } from '@/app/router/routePaths';
import { storage } from '@/lib/storage';
import { REGISTER_MUTATION } from '../graphql/registerMutation';

import { useAuthStore } from '../store/authStore';

import styles from './Form.module.css';

export function RegisterForm() {
  const navigate = useNavigate();

  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const [register, { loading }] = useMutation(REGISTER_MUTATION);

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
      const { data } = await register({
        variables: {
          input: {
            email,
            password,
            displayName: displayName || null,
          },
        },
      });

      storage.setToken(data.register.token);
      setUser(data.register.user);
      navigate(routePaths.dashboard, { replace: true });
    } catch (err) {
      const message =
        err?.graphQLErrors?.[0]?.message || err?.message || 'Unable to create account.';
      setError(message);
    }
  }

  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Prep Tracker</p>

        <h1 className={styles.title}>Create account</h1>

        <p className={styles.lead}>
          Set up your profile and start tracking your prep in one place.
        </p>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.field}>
            <span className={styles.label}>Display name</span>

            <input
              className={styles.input}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              type="text"
              autoComplete="name"
              placeholder="Your name"
            />
          </label>

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
              autoComplete="new-password"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </label>

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to={routePaths.login}>Sign in</Link>
        </p>
      </section>
    </main>
  );
}
