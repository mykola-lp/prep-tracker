import { authTypeDefs } from '../modules/auth/schema.js';
import { dashboardTypeDefs } from '../modules/dashboard/schema.js';
import { healthTypeDefs } from '../modules/health/schema.js';
import { notesTypeDefs } from '../modules/notes/schema.js';
import { questionsTypeDefs } from '../modules/questions/schema.js';
import { topicTypeDefs } from '../modules/topics/schema.js';

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const rootTypeDefs = `#graphql
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

export const typeDefs = [
  rootTypeDefs,

  ...authTypeDefs,
  ...dashboardTypeDefs,
  ...healthTypeDefs,
  notesTypeDefs,
  questionsTypeDefs,
  topicTypeDefs,
];
