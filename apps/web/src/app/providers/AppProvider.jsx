import { ApolloProvider } from '@apollo/client';

import { apolloClient } from '../apollo/client';

import { AuthInitializer } from '@/features/auth/components/AuthInitializer';

export function AppProvider({ children }) {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthInitializer />

      {children}
    </ApolloProvider>
  );
}
