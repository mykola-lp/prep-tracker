export const tagsTypeDefs = [
  `#graphql
  type Tag {
    id: ID!
    name: String!
  }

  input CreateTagInput {
    name: String!
  }

  extend type Query {
    tags: [Tag!]!
  }

  extend type Mutation {
    createTag(input: CreateTagInput!): Tag!
    deleteTag(id: ID!): Boolean!

    addTagToTopic(topicId: ID!, tagId: ID!): Topic!
    removeTagFromTopic(topicId: ID!, tagId: ID!): Topic!

    addTagToQuestion(questionId: ID!, tagId: ID!): Question!
    removeTagFromQuestion(questionId: ID!, tagId: ID!): Question!

    addTagToNote(noteId: ID!, tagId: ID!): Note!
    removeTagFromNote(noteId: ID!, tagId: ID!): Note!
  }
`,
];
