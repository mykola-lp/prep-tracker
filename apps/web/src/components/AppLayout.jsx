import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { routePaths } from '@/app/router/routePaths';
import { useAuthStore } from '@/features/auth/store/authStore';

const navItems = [
  { to: routePaths.dashboard, label: 'Dashboard' },
  { to: routePaths.topics, label: 'Topics' },
  { to: routePaths.questions, label: 'Questions' },
  { to: routePaths.notes, label: 'Notes' },
];

export function AppLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    navigate(routePaths.login);
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-brand">
          <span className="app-brand-mark">PT</span>
          <span className="app-brand-name">Prep Tracker</span>
        </div>

        <nav className="app-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="app-nav-link">
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="app-main-shell">
        <header className="app-header">
          <div>
            <p className="app-header-kicker">Workspace</p>
            <p className="app-header-user">{user?.email}</p>
          </div>

          <button className="app-logout-button" type="button" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
