export const healthTypeDefs = [
  `#graphql
  type Health {
    status: String!
    service: String!
    database: String!
  }

  extend type Query {
    health: Health!
  }
`,
];
