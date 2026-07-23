import { authResolvers } from '../modules/auth/resolvers.js';
import { dashboardResolvers } from '../modules/dashboard/resolvers.js';
import { healthResolvers } from '../modules/health/resolvers.js';
import { notesResolvers } from '../modules/notes/resolvers.js';
import { questionsResolvers } from '../modules/questions/resolvers.js';
import { topicResolvers } from '../modules/topics/resolvers.js';
import { tagsResolvers } from '../modules/tags/resolvers.js';

// @todo: replace custom merge - npm install @graphql-tools/merge
export function mergeResolvers(definitions) {
  const merged = {};

  for (const resolverMap of definitions) {
    for (const typeName in resolverMap) {
      if (!merged[typeName]) {
        merged[typeName] = {};
      }

      Object.assign(merged[typeName], resolverMap[typeName]);
    }
  }

  return merged;
}

// Resolvers define how to fetch the types defined in your schema.
export const resolvers = mergeResolvers([
  authResolvers,
  dashboardResolvers,
  healthResolvers,
  notesResolvers,
  questionsResolvers,
  topicResolvers,
  tagsResolvers,
]);
