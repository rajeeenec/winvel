import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import defaultLogo from '../../assets/logo.jpg';
import fullLogo from '../../assets/full_logo.jpg';
import {
  Menu,
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  ListFilter,
  Users,
  UserCheck,
  UserCog,
  Building2,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Boxes,
  Boxes as InventoryIcon,
  Sliders,
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { appName, logoUrl } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const currentFullPath = location.pathname + location.search;

  const isOrderMgmtChildActive = ['/orders'].includes(location.pathname);
  const isStockMgmtChildActive = ['/inventory'].includes(location.pathname);
  const isUserMgmtChildActive = ['/users', '/customers', '/vendors'].includes(location.pathname);
  const isMastersChildActive = ['/masters/order-statuses'].includes(location.pathname);

  const [isOrderMgmtOpen, setIsOrderMgmtOpen] = useState(isOrderMgmtChildActive);
  const [isStockMgmtOpen, setIsStockMgmtOpen] = useState(isStockMgmtChildActive);
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(isUserMgmtChildActive);
  const [isMastersOpen, setIsMastersOpen] = useState(isMastersChildActive);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Products', icon: Package, path: '/products' },
    { label: 'Categories', icon: Tag, path: '/categories' },
    {
      label: 'Order Management',
      icon: ShoppingBag,
      isParent: true,
      key: 'orders',
      isOpen: isOrderMgmtOpen,
      setIsOpen: setIsOrderMgmtOpen,
      children: [
        { label: 'Orders', icon: ShoppingBag, path: '/orders' },
        { label: 'Order Status', icon: ListFilter, path: '/orders?view=status' },
      ],
    },
    {
      label: 'Stock Management',
      icon: Boxes,
      isParent: true,
      key: 'stock',
      isOpen: isStockMgmtOpen,
      setIsOpen: setIsStockMgmtOpen,
      children: [
        { label: 'Inventory', icon: InventoryIcon, path: '/inventory' },
        { label: 'Stock Availability', icon: Package, path: '/stock-availability' },
      ],
    },
    {
      label: 'User Management',
      icon: UserCog,
      isParent: true,
      key: 'users',
      isOpen: isUserMgmtOpen,
      setIsOpen: setIsUserMgmtOpen,
      children: [
        { label: 'Users', icon: UserCheck, path: '/users' },
        { label: 'Customers', icon: Users, path: '/customers' },
        { label: 'Vendors', icon: Building2, path: '/vendors' },
      ],
    },
    {
      label: 'Masters',
      icon: Sliders,
      isParent: true,
      key: 'masters',
      isOpen: isMastersOpen,
      setIsOpen: setIsMastersOpen,
      children: [
        { label: 'Order Status Master', icon: Sliders, path: '/masters/order-statuses' },
      ],
    },
    { label: 'Roles', icon: ShieldCheck, path: '/roles' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header / Logo area */}
        <div
          style={{
            padding: isSidebarCollapsed ? '0.25rem' : '0.5rem 0.75rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: isSidebarCollapsed ? '64px' : '85px',
            overflow: 'hidden',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {isSidebarCollapsed ? (
            <img
              src={logoUrl && logoUrl !== '/logo.png' ? logoUrl : defaultLogo}
              alt="Logo Icon"
              style={{ height: '46px', width: 'auto', maxWidth: '54px', objectFit: 'contain', cursor: 'pointer' }}
              onClick={() => setIsSidebarCollapsed(false)}
              onError={(e) => { e.target.onerror = null; e.target.src = defaultLogo; }}
              title={appName || 'WINVEEL'}
            />
          ) : (
            <img
              src={fullLogo}
              alt={appName || 'WINVEEL Logo'}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
              onError={(e) => { e.target.onerror = null; e.target.src = defaultLogo; }}
            />
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: isSidebarCollapsed ? '1rem 0.35rem' : '1rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', overflowX: 'hidden' }}>
          {navItems.map((item) => {
            if (item.isParent) {
              const ParentIcon = item.icon;
              const childPaths = item.children.map((c) => c.path);
              const isChildActive = childPaths.some((p) => p.split('?')[0] === location.pathname);

              if (isSidebarCollapsed) {
                return (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                      type="button"
                      title={item.label}
                      onClick={() => {
                        setIsSidebarCollapsed(false);
                        item.setIsOpen(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        borderRadius: '6px',
                        color: isChildActive ? 'var(--color-text)' : '#44403C',
                        backgroundColor: isChildActive ? 'var(--color-sidebar-active)' : 'transparent',
                        borderLeft: isChildActive ? '3px solid var(--color-sidebar-active-border)' : '3px solid transparent',
                        transition: 'var(--transition)',
                      }}
                    >
                      <ParentIcon size={18} />
                    </button>
                  </div>
                );
              }

              return (
                <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => item.setIsOpen(!item.isOpen)}
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
                      <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                    </div>
                    {item.isOpen ? <ChevronDown size={15} color="var(--color-text-muted)" /> : <ChevronRight size={15} color="var(--color-text-muted)" />}
                  </button>

                  {/* Collapsible Sub-menu Items */}
                  {item.isOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingLeft: '1.25rem' }}>
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isStatusView = location.search.includes('view=status');
                        const isSubActive =
                          child.path === '/orders?view=status'
                            ? isStatusView
                            : child.path === '/orders'
                              ? location.pathname === '/orders' && !isStatusView
                              : currentFullPath === child.path || location.pathname === child.path;

                        return (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.65rem',
                              padding: '0.45rem 0.75rem',
                              borderRadius: '5px',
                              fontSize: '0.82rem',
                              fontWeight: isSubActive ? 600 : 400,
                              color: isSubActive ? 'var(--color-text)' : '#57534E',
                              backgroundColor: isSubActive ? 'var(--color-accent)' : 'transparent',
                              transition: 'var(--transition)',
                            }}
                          >
                            <ChildIcon size={15} />
                            <span style={{ whiteSpace: 'nowrap' }}>{child.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const Icon = item.icon;

            if (isSidebarCollapsed) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  title={item.label}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    margin: '0 auto',
                    borderRadius: '6px',
                    color: isActive ? 'var(--color-text)' : '#44403C',
                    backgroundColor: isActive ? 'var(--color-sidebar-active)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--color-sidebar-active-border)' : '3px solid transparent',
                    transition: 'var(--transition)',
                  })}
                >
                  <Icon size={18} />
                </NavLink>
              );
            }

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
                <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Card */}
        {isSidebarCollapsed ? (
          <div style={{ padding: '0.75rem 0.25rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#E5DBCB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                color: '#1A1918',
              }}
              title={user?.name || user?.email || 'Admin User'}
            >
              {user?.name ? user.name[0] : user?.first_name ? user.first_name[0] : 'A'}
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.45rem',
                borderRadius: '6px',
                background: '#EFE7DA',
                border: '1px solid #E2D7C5',
                color: '#1A1918',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
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
                    {user?.email || 'admin@winveel.com'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn"
                style={{
                  width: '100%',
                  marginTop: '0.5rem',
                  justifyContent: 'center',
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
        )}
      </aside>

      {/* Main Content Area */}
      <div className={`admin-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.4rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <Menu size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#57534E', fontSize: '0.85rem' }}>
              <ShieldCheck size={18} color="var(--color-text)" />
              <span>Secure Admin Session Active</span>
            </div>
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
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Port: 3001</span>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
