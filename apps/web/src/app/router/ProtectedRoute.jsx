import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { routePaths } from './routePaths';

import { useAuth } from '@/features/auth/hooks/useAuth';

export function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={routePaths.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
