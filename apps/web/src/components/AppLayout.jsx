import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { routePaths } from '@/app/router/routePaths';
import { useAuthStore } from '@/features/auth/store/authStore';

import styles from './AppLayout.module.css';

const navItems = [
  { to: routePaths.dashboard, label: 'Dashboard' },
  { to: routePaths.topics, label: 'Topics' },
  { to: routePaths.questions, label: 'Questions' },
  { to: routePaths.notes, label: 'Notes' },
];

export function AppLayout({ children = null }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    navigate(routePaths.login);
  }

  function getNavLinkClassName({ isActive }) {
    return isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>PT</span>
          <span className={styles.brandName}>Prep Tracker</span>
        </div>

        <nav className={styles.nav} aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={getNavLinkClassName}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <div>
            <p className={styles.headerKicker}>Workspace</p>
            <p className={styles.headerUser}>{user?.email}</p>
          </div>

          <button className={styles.logoutButton} type="button" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <main className={styles.content}>{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
