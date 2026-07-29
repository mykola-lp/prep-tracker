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

          <button className="home-secondary-button" type="button" disabled>
            Create account
          </button>
        </div>

        <Link className="home-secondary-link" to={routePaths.health}>
          Health
        </Link>

        <p className="home-note">Account creation is available through the API for now.</p>
      </section>
    </main>
  );
}
