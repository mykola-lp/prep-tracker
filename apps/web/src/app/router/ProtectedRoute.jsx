import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { routePaths } from './routePaths';

import { useAuth } from '@/features/auth/hooks/useAuth';

export function ProtectedRoute() {
  const location = useLocation();
  const authStatus = useAuth((state) => state.authStatus);

  if (authStatus === 'checking') {
    return null;
  }

  if (authStatus !== 'authenticated') {
    return <Navigate to={routePaths.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
