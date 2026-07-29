import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '@/components/AppLayout';

import { HomeRedirect } from './HomeRedirect';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { routePaths } from './routePaths';

import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { HealthPage } from '@/features/health/pages/HealthPage';
import { NotesPage } from '@/features/notes/pages/NotesPage';
import { QuestionsPage } from '@/features/questions/pages/QuestionsPage';
import { TopicsPage } from '@/features/topics/pages/TopicsPage';

export const router = createBrowserRouter([
  {
    path: routePaths.home,
    element: <HomeRedirect />,
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: routePaths.login,
        element: <LoginPage />,
      },
    ],
  },
  {
    path: routePaths.health,
    element: <HealthPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: routePaths.dashboard,
            element: <DashboardPage />,
          },
          {
            path: routePaths.topics,
            element: <TopicsPage />,
          },
          {
            path: routePaths.questions,
            element: <QuestionsPage />,
          },
          {
            path: routePaths.notes,
            element: <NotesPage />,
          },
        ],
      },
    ],
  },
]);
