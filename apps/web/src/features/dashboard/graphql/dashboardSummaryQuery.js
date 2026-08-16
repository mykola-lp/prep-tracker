import { gql } from '@apollo/client';

export const DASHBOARD_SUMMARY_QUERY = gql`
  query DashboardSummary {
    dashboardSummary {
      totals {
        topics
        questions
        notes
        completedTopics
        completedQuestions
        overdueItems
        reviewItems
      }
      topicsByStatus {
        status
        count
      }
      questionsByStatus {
        status
        count
      }
      overdueItems {
        id
        type
        title
        status
        deadline
      }
      reviewItems {
        id
        type
        title
        status
        deadline
      }
      upcomingDeadlines {
        id
        type
        title
        status
        deadline
      }
    }
  }
`;
