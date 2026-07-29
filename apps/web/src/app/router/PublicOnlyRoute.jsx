import { Navigate, Outlet } from 'react-router-dom';

import { routePaths } from './routePaths';

import { useAuth } from '@/features/auth/hooks/useAuth';

export function PublicOnlyRoute() {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={routePaths.dashboard} replace />;
  }

  return <Outlet />;
}
