import { useQuery } from '@apollo/client/react';

import { DASHBOARD_SUMMARY_QUERY } from '../graphql/dashboardSummaryQuery';

import { buildDashboardViewModel } from '../view/dashboardViewModel';

import { SummaryCard } from '../components/SummaryCard';
import { StatusBreakdownList } from '../components/StatusBreakdownList';
import { AttentionList } from '../components/AttentionList';

import styles from './dashboard.module.css';

export function DashboardPage() {
  const { data, loading, error } = useQuery(DASHBOARD_SUMMARY_QUERY);

  if (loading) {
    return (
      <section className={styles.page}>
        <div className={styles.stateCard}>Loading dashboard...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.page}>
        <div className={`${styles.stateCard} ${styles.stateCardError}`} role="alert">
          Unable to load dashboard.
        </div>
      </section>
    );
  }

  const {
    totals,
    topicsByStatus,
    questionsByStatus,
    overdueItems,
    reviewItems,
    upcomingDeadlines,
    attentionCount,
  } = buildDashboardViewModel(data?.dashboardSummary);

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Dashboard</p>

          <h1 className={styles.title}>Quick prep overview</h1>

          <p className={styles.lead}>
            See the current state of your topics, questions, deadlines, and items that need
            attention at a glance.
          </p>
        </div>
      </header>

      <section className={styles.summaryGrid} aria-label="Summary metrics">
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

        <SummaryCard label="Notes" value={totals.notes} hint="Captured notes" />

        <SummaryCard
          label="Needs attention"
          value={attentionCount}
          hint={`${totals.overdueItems} overdue, ${totals.reviewItems} in review`}
        />
      </section>

      <div className={styles.grid}>
        <div className={styles.stack}>
          <StatusBreakdownList title="Topics by status" items={topicsByStatus} />
          <StatusBreakdownList title="Questions by status" items={questionsByStatus} />
        </div>

        <div className={styles.stack}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionKicker}>Attention</p>
                <h2 className={styles.sectionTitle}>Overdue items</h2>
              </div>

              <p className={styles.sectionLead}>{overdueItems.length} items</p>
            </div>

            <AttentionList
              title="Overdue"
              items={overdueItems}
              emptyLabel="No overdue items."
              variant="overdue"
            />
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionKicker}>Review</p>
                <h2 className={styles.sectionTitle}>Items in review</h2>
              </div>

              <p className={styles.sectionLead}>{reviewItems.length} items</p>
            </div>

            <AttentionList
              title="Review"
              items={reviewItems}
              emptyLabel="Nothing currently in review."
              variant="review"
            />
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionKicker}>Schedule</p>
                <h2 className={styles.sectionTitle}>Upcoming deadlines</h2>
              </div>

              <p className={styles.sectionLead}>{upcomingDeadlines.length} items</p>
            </div>

            <AttentionList
              title="Upcoming"
              items={upcomingDeadlines}
              emptyLabel="No upcoming deadlines."
              variant="upcoming"
            />
          </section>
        </div>
      </div>
    </section>
  );
}
