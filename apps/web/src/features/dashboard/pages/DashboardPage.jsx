import { useQuery } from '@apollo/client/react';

import { DASHBOARD_SUMMARY_QUERY } from '../graphql/dashboardSummaryQuery';

import { AttentionList } from '../components/AttentionList';
import { StatusBreakdownList } from '../components/StatusBreakdownList';
import { SummaryCard } from '../components/SummaryCard';

export function DashboardPage() {
  const { data, loading, error } = useQuery(DASHBOARD_SUMMARY_QUERY);

  if (loading) {
    return <p className="dashboard-state">Loading dashboard...</p>;
  }

  if (error) {
    return (
      <div role="alert" className="dashboard-state dashboard-state-error">
        Unable to load dashboard.
      </div>
    );
  }

  const summary = data?.dashboardSummary;

  if (!summary) {
    return <p className="dashboard-state">No dashboard data yet.</p>;
  }

  const {
    totals,
    topicsByStatus,
    questionsByStatus,
    overdueItems,
    reviewItems,
    upcomingDeadlines,
  } = summary;

  return (
    <div className="dashboard-page">
      <header className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Overview</p>

          <h1 className="dashboard-title">Dashboard</h1>

          <p className="dashboard-lead">
            Quick view of your prep progress and what needs attention.
          </p>
        </div>
      </header>

      <section className="dashboard-grid dashboard-grid-summary">
        <SummaryCard
          label="Topics"
          value={totals.topics}
          hint={`${totals.completedTopics} completed`}
        />

        <SummaryCard
          label="Questions"
          value={totals.questions}
          hint={`${totals.completedQuestions} completed`}
        />

        <SummaryCard label="Notes" value={totals.notes} hint="Stored study notes" />

        <SummaryCard
          label="Needs attention"
          value={totals.overdueItems + totals.reviewItems}
          hint="Overdue + reviewing"
        />
      </section>

      <section className="dashboard-grid dashboard-grid-main">
        <div className="dashboard-stack">
          <StatusBreakdownList title="Topics by status" items={topicsByStatus} />
          <StatusBreakdownList title="Questions by status" items={questionsByStatus} />
        </div>

        <div className="dashboard-stack">
          <AttentionList
            title="Overdue items"
            items={overdueItems}
            emptyLabel="No overdue items."
            variant="overdue"
          />

          <AttentionList
            title="Review items"
            items={reviewItems}
            emptyLabel="Nothing currently in review."
            variant="review"
          />

          <AttentionList
            title="Upcoming deadlines"
            items={upcomingDeadlines}
            emptyLabel="No upcoming deadlines."
            variant="upcoming"
          />
        </div>
      </section>
    </div>
  );
}
