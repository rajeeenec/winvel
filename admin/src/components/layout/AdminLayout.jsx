import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Users,
  UserCheck,
  UserCog,
  Building2,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { appName } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const isUserMgmtChildActive = ['/users', '/customers', '/vendors'].includes(location.pathname);
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(isUserMgmtChildActive);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Products', icon: Package, path: '/products' },
    { label: 'Categories', icon: Tag, path: '/categories' },
    { label: 'Orders', icon: ShoppingBag, path: '/orders' },
    {
      label: 'User Management',
      icon: UserCog,
      isParent: true,
      children: [
        { label: 'Users', icon: UserCheck, path: '/users' },
        { label: 'Customers', icon: Users, path: '/customers' },
        { label: 'Vendors', icon: Building2, path: '/vendors' },
      ],
    },
    { label: 'Roles', icon: ShieldCheck, path: '/roles' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ padding: '1.25rem 1.15rem 1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Hanger Icon matching screenshot */}
          <div style={{ color: 'var(--color-text)', display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3c0 .8.3 1.5.8 2L3 13h18l-6.8-6A3 3 0 0 0 12 2z" />
              <path d="M3 13v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font)', fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--color-text)', lineHeight: 1.1 }}>
              {appName ? appName.toUpperCase() : 'WINVEL'}
            </h2>
            <p style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '1px' }}>
              Admin Control
            </p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
          {navItems.map((item) => {
            if (item.isParent) {
              const ParentIcon = item.icon;
              const isChildActive = ['/users', '/customers', '/vendors'].includes(location.pathname);

              return (
                <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsUserMgmtOpen(!isUserMgmtOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.86rem',
                      fontWeight: isChildActive ? 600 : 500,
                      color: isChildActive ? 'var(--color-text)' : '#44403C',
                      backgroundColor: isChildActive ? 'var(--color-sidebar-active)' : 'transparent',
                      borderLeft: isChildActive ? '3px solid var(--color-sidebar-active-border)' : '3px solid transparent',
                      transition: 'var(--transition)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <ParentIcon size={17} />
                      <span>{item.label}</span>
                    </div>
                    {isUserMgmtOpen ? <ChevronDown size={15} color="var(--color-text-muted)" /> : <ChevronRight size={15} color="var(--color-text-muted)" />}
                  </button>

                  {/* Collapsible Sub-menu Items */}
                  {isUserMgmtOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingLeft: '1.25rem' }}>
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            style={({ isActive }) => ({
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.65rem',
                              padding: '0.45rem 0.75rem',
                              borderRadius: '5px',
                              fontSize: '0.82rem',
                              fontWeight: isActive ? 600 : 400,
                              color: isActive ? 'var(--color-text)' : '#57534E',
                              backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                              transition: 'var(--transition)',
                            })}
                          >
                            <ChildIcon size={15} />
                            <span>{child.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--color-text)' : '#44403C',
                  backgroundColor: isActive ? 'var(--color-sidebar-active)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--color-sidebar-active-border)' : '3px solid transparent',
                  transition: 'var(--transition)',
                })}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Card */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ padding: '0.65rem 0.75rem', borderRadius: '8px', background: '#FAF6F0', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#E5DBCB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: '#1A1918' }}>
                {user?.name ? user.name[0] : user?.first_name ? user.first_name[0] : 'A'}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1A1918', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.name || `${user?.first_name || 'Admin'} ${user?.last_name || ''}`}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#78716C', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.email || 'admin@winvel.com'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn"
              style={{
                width: '100%',
                marginTop: '0.5rem',
                justify: 'center',
                background: '#EFE7DA',
                border: '1px solid #E2D7C5',
                color: '#1A1918',
                fontSize: '0.78rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '5px',
                fontWeight: 600,
              }}
            >
              <LogOut size={14} />
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
