import { useState } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './UserLayout.css';

export default function UserLayout() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount, wishlistCount } = useCart();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="user-layout">
      {/* Top Announcement Bar */}
      <div className="announcement-bar">
        <div className="container announcement-bar-inner">
          <span className="announcement-item">
            <span className="icon">🚚</span> FREE SHIPPING ON ORDERS ABOVE ₹999
          </span>
          <span className="announcement-item highlight">
            <span className="icon">🔥</span> WINVEL SUMMER SALE - UP TO 40% OFF
          </span>
          <span className="announcement-item">
            <span className="icon">📞</span> SUPPORT: +91 98765 43210
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="user-header">
        <div className="container user-header-inner">
          {/* Logo Brand Section */}
          <Link to="/" className="logo-container">
            <span className="brand-logo">WINVEL</span>
            <span className="brand-sub">WEAR YOUR VIBE</span>
          </Link>

          {/* Navigation Menu */}
          <nav className="user-nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>HOME</NavLink>
            <NavLink to="/shop?category=1" className="nav-item">MEN</NavLink>
            <NavLink to="/shop?category=2" className="nav-item">WOMEN</NavLink>
            <NavLink to="/shop?category=3" className="nav-item">OVERSIZED</NavLink>
            <NavLink to="/shop?category=5" className="nav-item">NEW ARRIVALS</NavLink>
            <NavLink to="/shop?category=4" className="nav-item">COLLECTIONS</NavLink>
            <NavLink to="/shop?sale=true" className="nav-item sale-nav">SALE</NavLink>
          </nav>

          {/* Actions Bar */}
          <div className="user-header-actions">
            {/* Search Bar toggle */}
            <div className="search-container">
              {showSearch ? (
                <form onSubmit={handleSearchSubmit} className="search-form">
                  <input
                    type="text"
                    placeholder="Search t-shirts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="search-input"
                  />
                  <button type="submit" className="search-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </button>
                  <button type="button" className="close-search-btn" onClick={() => setShowSearch(false)}>✕</button>
                </form>
              ) : (
                <button className="action-btn" onClick={() => setShowSearch(true)} title="Search">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="profile-menu-container">
              <button className="action-btn" onClick={() => setShowProfileDropdown(!showProfileDropdown)} title="Account">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </button>
              {showProfileDropdown && (
                <div className="profile-dropdown">
                  {user ? (
                    <>
                      <div className="dropdown-user-info">
                        <span className="dropdown-username">Hi, {user.first_name}</span>
                        <span className="dropdown-email">{user.email}</span>
                      </div>
                      <hr />
                      {isAdmin && <Link to="/admin" className="dropdown-item" onClick={() => setShowProfileDropdown(false)}>Admin Dashboard</Link>}
                      <Link to="/orders" className="dropdown-item" onClick={() => setShowProfileDropdown(false)}>My Orders</Link>
                      <button onClick={() => { logout(); setShowProfileDropdown(false); }} className="dropdown-item logout-btn">Logout</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="dropdown-item" onClick={() => setShowProfileDropdown(false)}>Login</Link>
                      <Link to="/register" className="dropdown-item" onClick={() => setShowProfileDropdown(false)}>Sign Up</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Link */}
            <Link to="/shop" className="action-btn badge-btn" title="Wishlist">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <span className="badge-count">{wishlistCount}</span>
            </Link>

            {/* Cart Link */}
            <Link to="/cart" className="action-btn badge-btn" title="Cart">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              <span className="badge-count">{cartCount}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="user-main">
        <Outlet />
      </main>

      {/* Rich Footer Section */}
      {!isAuthPage && (
        <footer className="user-footer">
        <div className="container footer-grid">
          {/* Column 1: Brand Info */}
          <div className="footer-col brand-col">
            <span className="footer-logo">WINVEL</span>
            <span className="footer-sub">WEAR YOUR VIBE</span>
            <p className="footer-desc">Minimal styles. Premium quality. Made for everyday you.</p>
            <div className="social-links">
              <a href="#" className="social-icon" title="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="social-icon" title="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="social-icon" title="YouTube">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
              <a href="#" className="social-icon" title="Pinterest">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22a8.5 8.5 0 0 0 8-5.5 7.5 7.5 0 0 0-2-8.5 8.5 8.5 0 0 0-10.5 4c0 3 1.5 5 1.5 6a1.5 1.5 0 0 1-1.5 1.5A1.5 1.5 0 0 1 2 18.5a11.5 11.5 0 0 1 15-9.5A10.5 10.5 0 0 1 19 14a8.5 8.5 0 0 1-11 8z"></path></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div className="footer-col">
            <h4 className="footer-title">SHOP</h4>
            <ul className="footer-links">
              <li><Link to="/shop?category=1">Men</Link></li>
              <li><Link to="/shop?category=2">Women</Link></li>
              <li><Link to="/shop?category=3">Oversized</Link></li>
              <li><Link to="/shop?category=4">Basics</Link></li>
              <li><Link to="/shop?category=5">New Arrivals</Link></li>
              <li><Link to="/shop?sale=true">Sale</Link></li>
            </ul>
          </div>

          {/* Column 3: Help */}
          <div className="footer-col">
            <h4 className="footer-title">HELP</h4>
            <ul className="footer-links">
              <li><a href="#">Track Order</a></li>
              <li><a href="#">Returns & Refunds</a></li>
              <li><a href="#">Shipping Info</a></li>
              <li><a href="#">Size Guide</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 4: About */}
          <div className="footer-col">
            <h4 className="footer-title">ABOUT</h4>
            <ul className="footer-links">
              <li><a href="#">About Winvel</a></li>
              <li><a href="#">Our Story</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Store Locator</a></li>
            </ul>
          </div>

          {/* Column 5: About Statement */}
          <div className="footer-col about-statement-col">
            <h4 className="footer-title">ABOUT WINVEL</h4>
            <p className="about-text">
              We believe in minimal design and maximum comfort. Thank you for supporting our small brand!
            </p>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="footer-bottom">
          <div className="container footer-bottom-inner">
            <span className="copyright">© {new Date().getFullYear()} WINVEL. All Rights Reserved.</span>
            <div className="policy-links">
              <a href="#">Privacy Policy</a>
              <span className="separator">|</span>
              <a href="#">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}
