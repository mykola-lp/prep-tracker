export const questionsTypeDefs = [
  `#graphql
  type Question {
    id: ID!
    topicId: ID!
    prompt: String!
    answer: String
    status: String!
    deadline: String
  }

  input CreateQuestionInput {
    topicId: ID!
    prompt: String!
    deadline: String
  }

  input UpdateQuestionInput {
    prompt: String
    answer: String
    status: String
    deadline: String
  }

  extend type Query {
    questions: [Question!]!
    question(id: ID!): Question
  }

  extend type Mutation {
    createQuestion(input: CreateQuestionInput!): Question!
    updateQuestion(id: ID!, input: UpdateQuestionInput!): Question!
    deleteQuestion(id: ID!): Boolean!
  }
`,
];
