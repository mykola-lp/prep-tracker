const TYPE_LABELS = {
  topic: 'Topic',
  question: 'Question',
};

export function AttentionList({ title, items, emptyLabel, variant }) {
  return (
    <section className="dashboard-card">
      <div className="dashboard-card-head">
        <h2 className="dashboard-card-title">{title}</h2>
      </div>

      {items.length === 0 ? (
        <p className="dashboard-empty">{emptyLabel}</p>
      ) : (
        <ul className="dashboard-item-list">
          {items.map((item) => (
            <li
              key={`${item.type}-${item.id}`}
              className={`dashboard-item dashboard-item-${variant}`}
            >
              <div>
                <p className="dashboard-item-meta">
                  {TYPE_LABELS[item.type] ?? item.type}
                  {item.status ? ` · ${item.status}` : ''}
                </p>

                <p className="dashboard-item-title">{item.title}</p>
              </div>

              <p className="dashboard-item-deadline">
                {item.deadline ? `Due ${item.deadline}` : 'No deadline'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
