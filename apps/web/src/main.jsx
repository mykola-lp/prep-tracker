import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { AppProvider } from '@/app/providers/AppProvider';
import { router } from '@/app/router/router';

import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppProvider>
    <RouterProvider router={router} />
  </AppProvider>
);
