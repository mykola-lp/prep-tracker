import { useAuthStore } from '@/features/auth/store/authStore';

export function useAuth(selector) {
  return useAuthStore(selector);
}
