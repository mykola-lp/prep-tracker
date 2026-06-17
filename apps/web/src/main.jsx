import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { AppProvider } from '@/app/providers/AppProvider';
import { router } from '@/app/router/router';

import App from './App.jsx';

import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppProvider>
    <RouterProvider router={router} />
  </AppProvider>
);
