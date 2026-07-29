import { Navigate } from 'react-router-dom';

import { routePaths } from './routePaths';

import { useAuth } from '@/features/auth/hooks/useAuth';

export function HomeRedirect() {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  return <Navigate to={isAuthenticated ? routePaths.dashboard : routePaths.login} replace />;
}
