import { gql } from 'graphql-tag';

export const topicTypeDefs = gql`
  type Topic {
    id: ID!
    title: String!
    description: String
  }

  extend type Query {
    topics: [Topic!]!
  }
`;
