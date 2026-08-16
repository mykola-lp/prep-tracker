export function SummaryCard({ label, value, hint }) {
  return (
    <article className="dashboard-card dashboard-summary-card">
      <p className="dashboard-card-label">{label}</p>
      <p className="dashboard-card-value">{value}</p>
      {hint ? <p className="dashboard-card-hint">{hint}</p> : null}
    </article>
  );
}
