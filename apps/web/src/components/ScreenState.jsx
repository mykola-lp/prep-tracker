import styles from './ScreenState.module.css';

export function ScreenState({
  title,
  message,
  tone = 'neutral',
  action = null,
  layout = 'inline',
}) {
  return (
    <section className={`${styles.page} ${styles[layout]}`}>
      <div className={`${styles.card} ${styles[tone]}`}>
        {title ? <h1 className={styles.title}>{title}</h1> : null}

        {message ? <p className={styles.message}>{message}</p> : null}

        {action ? <div className={styles.action}>{action}</div> : null}
      </div>
    </section>
  );
}
