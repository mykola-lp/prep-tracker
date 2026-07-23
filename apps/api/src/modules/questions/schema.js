export const questionsTypeDefs = [
  `#graphql
  type Question {
    id: ID!
    topicId: ID!
    prompt: String!
    answer: String
    status: String!
    deadline: String
    notes: [Note!]!
    tags: [Tag!]!
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
    question(id: ID!): Question
    questions(tagId: ID, status: String): [Question!]!
  }

  extend type Mutation {
    createQuestion(input: CreateQuestionInput!): Question!
    updateQuestion(id: ID!, input: UpdateQuestionInput!): Question!
    deleteQuestion(id: ID!): Boolean!
  }
`,
];
