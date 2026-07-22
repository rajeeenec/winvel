import { Outlet, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import StoreLogo from '../components/StoreLogo';
import './UserLayout.css';

export default function UserLayout() {
  const { user, logout, isAdmin } = useAuth();
  const { appName, tagline } = useSettings();

  return (
    <div className="user-layout">
      <header className="user-header">
        <div className="container user-header-inner">
          <Link to="/" className="logo">
            <StoreLogo />
            <span className="logo-text">{appName}</span>
          </Link>

          <nav className="user-nav">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/shop">Shop</NavLink>
            <NavLink to="/cart">Cart</NavLink>
            {user && <NavLink to="/orders">Orders</NavLink>}
          </nav>

          <div className="user-header-actions">
            {user ? (
              <>
                {isAdmin && <Link to="/admin" className="btn btn-outline btn-sm">Admin</Link>}
                <span className="user-greeting">Hi, {user.first_name}</span>
                <button onClick={logout} className="btn btn-outline btn-sm">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="user-main">
        <Outlet />
      </main>

      <footer className="user-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} {appName}. {tagline}.</p>
        </div>
      </footer>
    </div>
  );
}
