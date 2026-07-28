export const topicTypeDefs = [
  `#graphql
  type Topic {
    id: ID!
    title: String!
    description: String
    status: ProgressStatus!
    deadline: String
    questions: [Question!]!
    notes: [Note!]!
    tags: [Tag!]!
  }

  input CreateTopicInput {
    title: String!
    description: String
    deadline: String
  }

  input UpdateTopicInput {
    title: String
    description: String
    status: ProgressStatus
    deadline: String
  }

  extend type Query {
    topic(id: ID!): Topic
    topics(tagId: ID, status: ProgressStatus): [Topic!]!
  }

  extend type Mutation {
    createTopic(input: CreateTopicInput!): Topic!
    updateTopic(id: ID!, input: UpdateTopicInput!): Topic!
    deleteTopic(id: ID!): Boolean!
  }
`,
];
