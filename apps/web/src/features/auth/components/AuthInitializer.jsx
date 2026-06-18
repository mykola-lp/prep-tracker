import { useInitializeAuth } from '@/features/auth/hooks/useInitializeAuth';

export function AuthInitializer() {
  useInitializeAuth();

  return null;
}
