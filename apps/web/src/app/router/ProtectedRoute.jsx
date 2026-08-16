import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { routePaths } from './routePaths';

import { ScreenState } from '@/components/ScreenState';

import { useAuth } from '@/features/auth/hooks/useAuth';

export function ProtectedRoute() {
  const location = useLocation();
  const authStatus = useAuth((state) => state.authStatus);

  if (authStatus === 'checking') {
    return (
      <ScreenState
        layout="full"
        tone="loading"
        title="Loading your workspace..."
        message="Checking your session before opening the dashboard."
      />
    );
  }

  if (authStatus !== 'authenticated') {
    return <Navigate to={routePaths.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
