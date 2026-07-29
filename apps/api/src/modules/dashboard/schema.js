export const dashboardTypeDefs = [
  `#graphql
  type ProgressStatusCount {
    status: ProgressStatus!
    count: Int!
  }

  type DashboardTotals {
    topics: Int!
    questions: Int!
    notes: Int!
    completedTopics: Int!
    completedQuestions: Int!
    overdueItems: Int!
    reviewItems: Int!
  }

  type DashboardItem {
    id: ID!
    type: String!
    title: String!
    status: ProgressStatus!
    deadline: String
  }

  type UpcomingDeadlineItem {
    id: ID!
    type: String!
    title: String!
    status: ProgressStatus!
    deadline: String!
  }

  type DashboardSummary {
    totals: DashboardTotals!
    topicsByStatus: [ProgressStatusCount!]!
    questionsByStatus: [ProgressStatusCount!]!
    overdueItems: [DashboardItem!]!
    reviewItems: [DashboardItem!]!
    upcomingDeadlines: [DashboardItem!]!
  }

  type ProgressSummary {
    topicsByStatus: [ProgressStatusCount!]!
    questionsByStatus: [ProgressStatusCount!]!
    upcomingDeadlines: [UpcomingDeadlineItem!]!
  }

  extend type Query {
    dashboardSummary: DashboardSummary!
    progressSummary: ProgressSummary!
  }
`,
];
