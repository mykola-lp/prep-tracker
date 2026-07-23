export const notesTypeDefs = [
  `#graphql
  type Note {
    id: ID!
    topicId: ID
    questionId: ID
    body: String!
    tags: [Tag!]!
  }

  input CreateNoteInput {
    topicId: ID
    questionId: ID
    body: String!
  }

  input UpdateNoteInput {
    body: String!
  }

  extend type Query {
    note(id: ID!): Note
    notes(tagId: ID): [Note!]!
  }

  extend type Mutation {
    createNote(input: CreateNoteInput!): Note!
    updateNote(id: ID!, input: UpdateNoteInput!): Note!
    deleteNote(id: ID!): Boolean!
  }
`,
];
