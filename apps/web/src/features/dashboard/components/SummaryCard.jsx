import styles from '../pages/dashboard.module.css';

export function SummaryCard({ label, value, hint }) {
  return (
    <article className={styles.summaryCard}>
      <p className={styles.summaryLabel}>{label}</p>
      <p className={styles.summaryValue}>{value}</p>

      {hint ? <p className={styles.summaryHint}>{hint}</p> : null}
    </article>
  );
}
