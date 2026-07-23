export const topicTypeDefs = [
  `#graphql
  type Topic {
    id: ID!
    title: String!
    description: String
    status: String!
    deadline: String
    questions: [Question!]!
    notes: [Note!]!
  }

  input CreateTopicInput {
    title: String!
    description: String
    deadline: String
  }

  input UpdateTopicInput {
    title: String
    description: String
    status: String
    deadline: String
  }

  extend type Query {
    topics: [Topic!]!
    topic(id: ID!): Topic
  }

  extend type Mutation {
    createTopic(input: CreateTopicInput!): Topic!
    updateTopic(id: ID!, input: UpdateTopicInput!): Topic!
    deleteTopic(id: ID!): Boolean!
  }
`,
];
