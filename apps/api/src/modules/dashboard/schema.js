export const dashboardTypeDefs = [
  `#graphql
  type ProgressStatusCount {
    status: ProgressStatus!
    count: Int!
  }

  type UpcomingDeadlineItem {
    id: ID!
    type: String!
    title: String!
    status: ProgressStatus!
    deadline: String!
  }

  type ProgressSummary {
    topicsByStatus: [ProgressStatusCount!]!
    questionsByStatus: [ProgressStatusCount!]!
    upcomingDeadlines: [UpcomingDeadlineItem!]!
  }

  extend type Query {
    progressSummary: ProgressSummary!
  }
`,
];
