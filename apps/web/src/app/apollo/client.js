import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';

import { authLink } from './authLink';

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_API_URL || '/api/graphql',
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
