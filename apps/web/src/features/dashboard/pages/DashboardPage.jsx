import { useAuthStore } from '@/features/auth/store/authStore';

export function DashboardPage() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div>
      <h1>Dashboard</h1>

      <button onClick={logout}>Logout</button>
    </div>
  );
}
