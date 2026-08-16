import styles from '../pages/dashboard.module.css';

export function StatusBreakdownList({ title, items }) {
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>

      <ul className={styles.statusList}>
        {items.map((item) => (
          <li key={item.status} className={styles.statusRow}>
            <span>{item.label}</span>
            <strong>{item.count}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
