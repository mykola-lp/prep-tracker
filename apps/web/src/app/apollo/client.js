import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';

import { authLink } from './authLink';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

const httpLink = new HttpLink({
  uri: `${apiBaseUrl.replace(/\/$/, '')}/graphql`,
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
