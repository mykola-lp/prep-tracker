import { useEffect } from 'react';
import { useApolloClient } from '@apollo/client/react';

import { storage } from '@/lib/storage';
import { ME_QUERY } from '@/features/auth/graphql/meQuery';
import { useAuthStore } from '@/features/auth/store/authStore';

export function useInitializeAuth() {
  const client = useApolloClient();

  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    async function initialize() {
      const token = storage.getToken();

      if (!token) {
        return;
      }

      try {
        const { data } = await client.query({
          query: ME_QUERY,
          fetchPolicy: 'network-only',
        });

        if (!data?.me) {
          logout();
          return;
        }

        setUser(data.me);
      } catch {
        logout();
      }
    }

    initialize();
  }, [client, setUser, logout]);
}
