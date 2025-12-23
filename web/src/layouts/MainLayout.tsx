import { Outlet, Link, useLocation } from 'react-router-dom';
import './MainLayout.css';

export function MainLayout() {
  const location = useLocation();

  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <div className="main-layout__nav">
          <Link to="/" className="main-layout__logo">
            <h1>Customer Health Platform</h1>
          </Link>

          <nav className="main-layout__menu">
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'nav-link--active' : ''}`}
            >
              Checklists
            </Link>
            <Link
              to="/create"
              className={`nav-link ${location.pathname === '/create' ? 'nav-link--active' : ''}`}
            >
              Create New
            </Link>
          </nav>
        </div>
      </header>

      <main className="main-layout__content">
        <Outlet />
      </main>

      <footer className="main-layout__footer">
        <p>
          Customer Health Platform &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
