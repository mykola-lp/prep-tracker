import { createBrowserRouter } from 'react-router-dom';

import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { HealthPage } from '@/features/health/pages/HealthPage';

export const router = createBrowserRouter([
  {
    path: '*',
    element: <div>ROUTER WORKS</div>,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/health',
    element: <HealthPage />,
  },
]);
