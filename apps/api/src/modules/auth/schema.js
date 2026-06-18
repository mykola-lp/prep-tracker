export const authTypeDefs = [
  `#graphql
  type User {
    id: ID!
    email: String!
    displayName: String
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  input RegisterInput {
    email: String!
    password: String!
    displayName: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  extend type Query {
    me: User
  }

  extend type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
  }
`,
];
