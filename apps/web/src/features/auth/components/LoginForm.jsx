import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router';

import { storage } from '@/lib/storage';
import { LOGIN_MUTATION } from '../graphql/loginMutation';
import { useAuthStore } from '../store/authStore';
import styles from './LoginForm.module.css';

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
    <main className={styles.shell}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Prep Tracker</p>

        <h1 className={styles.title}>Sign in</h1>

        <p className={styles.lead}>Use your account to continue into the dashboard.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
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
            />
          </label>

          <button className={styles.button} type="submit">
            Login
          </button>
        </form>
      </section>
    </main>
  );
}
