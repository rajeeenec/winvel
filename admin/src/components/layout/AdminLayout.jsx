import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { appName } = useSettings();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Products', icon: Package, path: '/products' },
    { label: 'Categories', icon: Tag, path: '/categories' },
    { label: 'Orders', icon: ShoppingBag, path: '/orders' },
    { label: 'Customers', icon: Users, path: '/customers' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ padding: '1.75rem 1.5rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Hanger Icon matching screenshot */}
          <div style={{ color: 'var(--color-text)', display: 'flex', alignItems: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3c0 .8.3 1.5.8 2L3 13h18l-6.8-6A3 3 0 0 0 12 2z" />
              <path d="M3 13v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font)', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--color-text)', lineHeight: 1.1 }}>
              {appName ? appName.toUpperCase() : 'WINVEL'}
            </h2>
            <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '2px' }}>
              Admin Control
            </p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.9rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--color-text)' : '#44403C',
                  backgroundColor: isActive ? 'var(--color-sidebar-active)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--color-sidebar-active-border)' : '3px solid transparent',
                  transition: 'var(--transition)',
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Card */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: '#FAF6F0', border: '1px solid var(--color-border)', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E5DBCB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', color: '#1A1918' }}>
                {user?.first_name ? user.first_name[0] : 'A'}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1A1918', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.first_name || 'Admin'} {user?.last_name || 'User'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#78716C', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.email || 'admin@winvel.com'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn"
              style={{
                width: '100%',
                marginTop: '0.75rem',
                justify: 'center',
                background: '#EFE7DA',
                border: '1px solid #E2D7C5',
                color: '#1A1918',
                fontSize: '0.82rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#57534E', fontSize: '0.85rem' }}>
            <ShieldCheck size={18} color="var(--color-text)" />
            <span>Secure Admin Session Active</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-text)',
                padding: '0.35rem 0.9rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              Environment: Development
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Port: 5174</span>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
