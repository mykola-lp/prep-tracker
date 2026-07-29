import { Link } from 'react-router-dom';

import { routePaths } from '@/app/router/routePaths';

export function HomePage() {
  return (
    <main className="home-shell">
      <section className="home-card">
        <p className="home-eyebrow">Prep Tracker</p>

        <h1 className="home-title">Track your interview preparation in one place.</h1>

        <p className="home-lead">
          Organize topics, questions, notes, progress states, and deadlines without scattering study
          work across tabs and todo lists.
        </p>

        <div className="home-actions">
          <Link className="home-primary-link" to={routePaths.login}>
            Sign in
          </Link>

          <Link className="home-secondary-button" to={routePaths.register}>
            Create account
          </Link>
        </div>

        <p className="home-note">You can now create an account and jump straight into the app.</p>

        <Link className="home-secondary-link" to={routePaths.health}>
          <span className="home-secondary-link-label">Health</span>
          <span className="home-secondary-link-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </section>
    </main>
  );
}
