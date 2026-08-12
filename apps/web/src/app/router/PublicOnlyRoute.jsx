import { Navigate, Outlet } from 'react-router-dom';

import { routePaths } from './routePaths';

import { useAuth } from '@/features/auth/hooks/useAuth';

export function PublicOnlyRoute() {
  const authStatus = useAuth((state) => state.authStatus);

  if (authStatus === 'checking') {
    return null;
  }

  if (authStatus === 'authenticated') {
    return <Navigate to={routePaths.dashboard} replace />;
  }

  return <Outlet />;
}
