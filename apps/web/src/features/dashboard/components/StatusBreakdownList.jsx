const STATUS_LABELS = {
  new: 'New',
  learning: 'Learning',
  reviewing: 'Reviewing',
  done: 'Done',
};

export function StatusBreakdownList({ title, items }) {
  return (
    <section className="dashboard-card">
      <div className="dashboard-card-head">
        <h2 className="dashboard-card-title">{title}</h2>
      </div>

      <ul className="dashboard-status-list">
        {items.map((item) => (
          <li key={item.status} className="dashboard-status-row">
            <span>{STATUS_LABELS[item.status] ?? item.status}</span>
            <strong>{item.count}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
