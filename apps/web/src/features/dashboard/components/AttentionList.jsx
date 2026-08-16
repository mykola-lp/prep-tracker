import styles from '../pages/dashboard.module.css';

const VARIANT_CLASS = {
  overdue: 'itemRowOverdue',
  review: 'itemRowReview',
  upcoming: 'itemRowUpcoming',
};

export function AttentionList({ title, items, emptyLabel, variant }) {
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>

      {items.length === 0 ? (
        <p className={styles.emptyState}>{emptyLabel}</p>
      ) : (
        <ul className={styles.itemList}>
          {items.map((item) => (
            <li
              key={`${item.type}-${item.id}`}
              className={`${styles.itemRow} ${styles[VARIANT_CLASS[variant]] ?? ''}`}
            >
              <div>
                <p className={styles.itemMeta}>
                  {item.typeLabel}
                  {' · '}
                  {item.statusLabel}
                </p>

                <p className={styles.itemTitle}>{item.title}</p>
              </div>

              <p className={styles.itemDeadline}>{item.deadlineLabel}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
