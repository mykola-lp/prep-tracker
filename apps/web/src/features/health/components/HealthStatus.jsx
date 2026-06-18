import styles from './HealthStatus.module.css';

export function HealthStatus({ health }) {
  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Prep Tracker</p>

        <h1 className={styles.title}>Infrastructure is wired.</h1>

        <p className={styles.lead}>
          React talks to Express through GraphQL, with PostgreSQL ready for the first real feature.
        </p>

        <dl className={styles.statusGrid}>
          <div>
            <dt>API</dt>
            <dd>{health.status}</dd>
          </div>

          <div>
            <dt>Service</dt>
            <dd>{health.service}</dd>
          </div>

          <div>
            <dt>PostgreSQL</dt>
            <dd>{health.database}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
