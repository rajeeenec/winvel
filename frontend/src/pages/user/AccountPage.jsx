import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import api from '../../services/api';
import './AccountPage.css';

export default function AccountPage() {
  const { user, logout, updateProfile } = useAuth();
  const { wishlist, removeFromWishlist, addToCart } = useCart();
  const { currencySymbol } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'account';

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setSavingProfile(true);
    try {
      if (updateProfile) {
        await updateProfile({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
        });
      }
      alert('Profile details updated successfully!');
      setEditProfileModal(false);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };
  const [profileData, setProfileData] = useState({
    name: user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Rajkumar S',
    email: user?.email || 'rajkumar.s@example.com',
    phone: user?.phone || '+91 98765 43210',
  });

  // Mock addresses state
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      name: user?.name || 'Rajkumar S',
      street: 'Flat 402, Sunshine Apartments, MG Road',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
      phone: '+91 98765 43210',
      isDefault: true,
    },
  ]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Rajkumar S',
        email: user.email || 'rajkumar.s@example.com',
        phone: user.phone || '+91 98765 43210',
      });
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = () => {
    setLoadingOrders(true);
    api.get('/orders')
      .then((res) => {
        const list = Array.isArray(res) ? res : (res.data || []);
        setOrders(list);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  };

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sampleRecentOrders = [
    {
      id: 102458,
      order_number: '#WINVL-102458',
      date: '20 May 2026',
      itemsCount: 1,
      total: 748.00,
      status: 'Delivered',
      deliveryInfo: 'Delivered on 24 May 2026',
      image: '/images/category_men.png',
    },
    {
      id: 102357,
      order_number: '#WINVL-102357',
      date: '10 May 2026',
      itemsCount: 2,
      total: 1298.00,
      status: 'Shipped',
      deliveryInfo: 'Expected by 14 May 2026',
      image: '/images/category_oversized.png',
    },
    {
      id: 102256,
      order_number: '#WINVL-102256',
      date: '02 May 2026',
      itemsCount: 1,
      total: 599.00,
      status: 'Processing',
      deliveryInfo: 'Order is being processed',
      image: '/images/category_basics.png',
    },
  ];

  const displayOrders = orders.length > 0
    ? orders.map((o) => ({
        id: o.id,
        order_number: o.order_number || `#WINVL-${o.id}`,
        date: new Date(o.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        itemsCount: o.items_count || 1,
        total: o.total || o.base_price || 699,
        status: o.status || 'Processing',
        deliveryInfo: o.status === 'delivered' ? 'Delivered successfully' : 'Processing your shipment',
        image: o.image_url || '/images/category_basics.png',
      }))
    : sampleRecentOrders;

  const sampleWishlist = [
    { id: 1, name: 'WINVEL Oversized T-Shirt - Black', price: 699, image_url: '/images/category_men.png', size: 'L', color: 'Black' },
    { id: 2, name: 'WINVEL Polo T-Shirt - Beige', price: 899, image_url: '/images/category_oversized.png', size: 'M', color: 'Beige' },
    { id: 3, name: 'WINVEL Hoodie - Grey', price: 1299, image_url: '/images/category_women.png', size: 'L', color: 'Grey' },
    { id: 4, name: 'WINVEL Signature Cap - Black', price: 499, image_url: '/images/category_basics.png', size: 'Free Size', color: 'Black' },
  ];

  const displayWishlist = wishlist.length > 0 ? wishlist : sampleWishlist;

  const userInitials = (profileData.name || 'R')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="account-container">
      <div className="container account-layout">
        {/* Sidebar */}
        <aside className="account-sidebar">
          <div className="sidebar-header">MY ACCOUNT</div>
          <nav className="sidebar-menu">
            <button
              type="button"
              className={`sidebar-item ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => handleTabChange('account')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>My Account</span>
            </button>

            <button
              type="button"
              className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => handleTabChange('orders')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              <span>My Orders</span>
            </button>

            <button
              type="button"
              className={`sidebar-item ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => handleTabChange('wishlist')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <span>Wishlist</span>
            </button>

            <button
              type="button"
              className={`sidebar-item ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => handleTabChange('addresses')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>Addresses</span>
            </button>

            <button
              type="button"
              className={`sidebar-item ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => handleTabChange('payments')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              <span>Payment Methods</span>
            </button>

            <button
              type="button"
              className={`sidebar-item ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => handleTabChange('reviews')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <span>Reviews</span>
            </button>

            <button
              type="button"
              className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => handleTabChange('notifications')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <span>Notifications</span>
            </button>

            <button
              type="button"
              className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleTabChange('settings')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              <span>Account Settings</span>
            </button>

            <button
              type="button"
              className={`sidebar-item ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => handleTabChange('privacy')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>Privacy & Security</span>
            </button>

            <button
              type="button"
              className="sidebar-item logout-item"
              onClick={handleLogout}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              <span>Logout</span>
            </button>
          </nav>

          {/* Need Help Sidebar Card */}
          <div className="sidebar-help-card">
            <div className="help-icon">🎧</div>
            <div className="help-title">Need Help?</div>
            <div className="help-desc">We're here to help you. Contact our support team anytime.</div>
            <button type="button" className="btn btn-black help-btn">Contact Support</button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="account-main">
          {/* TAB 1: MY ACCOUNT OVERVIEW */}
          {activeTab === 'account' && (
            <div className="tab-content">
              <div className="page-header-row">
                <div>
                  <h1 className="main-heading">My Account</h1>
                  <p className="sub-heading">Manage your profile, orders and preferences</p>
                </div>
              </div>

              {/* Profile Card */}
              <div className="profile-banner-card">
                <div className="profile-left">
                  <div className="avatar-circle">{userInitials}</div>
                  <div className="profile-details">
                    <h2 className="user-name">{profileData.name}</h2>
                    <p className="user-email">{profileData.email}</p>
                    <p className="user-phone">{profileData.phone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary edit-profile-btn"
                  onClick={() => setEditProfileModal(true)}
                >
                  ✏️ Edit Profile
                </button>
              </div>

              {/* Quick Action Grid */}
              <div className="quick-actions-grid">
                <div className="action-card" onClick={() => handleTabChange('orders')}>
                  <div className="action-icon-box">📦</div>
                  <div className="action-card-info">
                    <h4>My Orders</h4>
                    <p>Track, return or buy again</p>
                  </div>
                  <span className="card-arrow">&gt;</span>
                </div>

                <div className="action-card" onClick={() => handleTabChange('wishlist')}>
                  <div className="action-icon-box">🤍</div>
                  <div className="action-card-info">
                    <h4>Wishlist</h4>
                    <p>View and manage your wishlist</p>
                  </div>
                  <span className="card-arrow">&gt;</span>
                </div>

                <div className="action-card" onClick={() => handleTabChange('addresses')}>
                  <div className="action-icon-box">📍</div>
                  <div className="action-card-info">
                    <h4>Addresses</h4>
                    <p>Manage your saved addresses</p>
                  </div>
                  <span className="card-arrow">&gt;</span>
                </div>

                <div className="action-card" onClick={() => handleTabChange('payments')}>
                  <div className="action-icon-box">💳</div>
                  <div className="action-card-info">
                    <h4>Payment Methods</h4>
                    <p>Add or manage your payment methods</p>
                  </div>
                  <span className="card-arrow">&gt;</span>
                </div>

                <div className="action-card" onClick={() => handleTabChange('settings')}>
                  <div className="action-icon-box">⚙️</div>
                  <div className="action-card-info">
                    <h4>Account Settings</h4>
                    <p>Update your account preferences</p>
                  </div>
                  <span className="card-arrow">&gt;</span>
                </div>
              </div>

              {/* Recent Orders Section */}
              <div className="recent-orders-section">
                <div className="section-title-row">
                  <h3>Recent Orders</h3>
                  <button type="button" className="link-btn" onClick={() => handleTabChange('orders')}>
                    View All Orders &gt;
                  </button>
                </div>

                <div className="orders-list">
                  {displayOrders.map((ord) => (
                    <div key={ord.id} className="order-item-card">
                      <div className="order-left-info">
                        <img src={ord.image} alt="Product" className="order-thumb" />
                        <div>
                          <div className="order-no">Order <strong>{ord.order_number}</strong></div>
                          <div className="order-meta">{ord.date}</div>
                          <div className="order-meta">{ord.itemsCount} Item{ord.itemsCount > 1 ? 's' : ''} • ₹{ord.total}</div>
                        </div>
                      </div>

                      <div className="order-status-col">
                        <span className={`status-pill pill-${(ord.status || 'processing').toLowerCase()}`}>
                          {ord.status}
                        </span>
                        <div className="delivery-info">{ord.deliveryInfo}</div>
                      </div>

                      <div className="order-price-col">
                        <span className="order-total-price">₹{ord.total.toFixed(2)}</span>
                        <span className="card-arrow">&gt;</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Need Help Banner */}
              <div className="help-banner-wide">
                <div className="help-left">
                  <span className="help-headset">🎧</span>
                  <div>
                    <h4>Need Help?</h4>
                    <p>We're here to help you. Contact our support team anytime.</p>
                  </div>
                </div>
                <button type="button" className="btn btn-black">Contact Support</button>
              </div>
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="tab-content">
              <div className="page-header-row">
                <div>
                  <h1 className="main-heading">My Orders</h1>
                  <p className="sub-heading">Check status, track shipment, or buy items again</p>
                </div>
              </div>

              <div className="orders-list">
                {displayOrders.map((ord) => (
                  <div key={ord.id} className="order-item-card">
                    <div className="order-left-info">
                      <img src={ord.image} alt="Product" className="order-thumb" />
                      <div>
                        <div className="order-no">Order <strong>{ord.order_number}</strong></div>
                        <div className="order-meta">{ord.date}</div>
                        <div className="order-meta">{ord.itemsCount} Item{ord.itemsCount > 1 ? 's' : ''} • ₹{ord.total}</div>
                      </div>
                    </div>

                    <div className="order-status-col">
                      <span className={`status-pill pill-${(ord.status || 'processing').toLowerCase()}`}>
                        {ord.status}
                      </span>
                      <div className="delivery-info">{ord.deliveryInfo}</div>
                    </div>

                    <div className="order-price-col">
                      <span className="order-total-price">₹{ord.total.toFixed(2)}</span>
                      <span className="card-arrow">&gt;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="tab-content">
              <div className="page-header-row header-with-actions">
                <div>
                  <h1 className="main-heading">My Wishlist</h1>
                  <p className="sub-heading">Your saved items</p>
                </div>
                <div className="header-action-buttons">
                  <button type="button" className="btn btn-outline-sm">🔗 Share Wishlist</button>
                  <button type="button" className="btn btn-black-sm">🛍️ Move All to Bag</button>
                </div>
              </div>

              <div className="wishlist-controls-bar">
                <span className="item-count">{displayWishlist.length} Items</span>
                <div className="wishlist-filter-right">
                  <select className="wishlist-select">
                    <option>Sort by: Recently Added</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                  <button type="button" className="btn btn-outline-sm">Filter</button>
                </div>
              </div>

              <div className="wishlist-grid">
                {displayWishlist.map((item) => (
                  <div key={item.id} className="wishlist-card">
                    <div className="wishlist-img-wrap">
                      <img src={item.image_url} alt={item.name} />
                      <button type="button" className="remove-heart-btn" title="Remove from wishlist">
                        ✕
                      </button>
                      <span className="heart-badge">❤️</span>
                    </div>

                    <div className="wishlist-card-details">
                      <h4 className="wishlist-item-title">{item.name}</h4>
                      <div className="wishlist-price">₹{item.price}</div>
                      <div className="wishlist-meta">Size: {item.size || 'L'} • {item.color || 'Black'}</div>
                      <button
                        type="button"
                        className="btn btn-bag-btn"
                        onClick={() => addToCart(item, { id: 1, size: item.size || 'L', color: item.color || 'Black' })}
                      >
                        🛍️ Add to Bag
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendation Grid */}
              <div className="recommendations-section">
                <div className="section-title-row">
                  <h3>You may also like</h3>
                  <button type="button" className="link-btn" onClick={() => navigate('/shop')}>
                    View All &gt;
                  </button>
                </div>

                <div className="recommend-grid">
                  <div className="recommend-card">
                    <img src="/images/category_basics.png" alt="Classic White Tee" />
                    <h5>WINVEL Classic T-Shirt - White</h5>
                    <div className="price">₹699.00</div>
                  </div>
                  <div className="recommend-card">
                    <img src="/images/category_men.png" alt="Sweatshirt Black" />
                    <h5>WINVEL Sweatshirt - Black</h5>
                    <div className="price">₹1,199.00</div>
                  </div>
                  <div className="recommend-card">
                    <img src="/images/category_oversized.png" alt="Minimal Tee" />
                    <h5>WINVEL Minimal T-Shirt - Beige</h5>
                    <div className="price">₹699.00</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="tab-content">
              <div className="page-header-row header-with-actions">
                <div>
                  <h1 className="main-heading">Saved Addresses</h1>
                  <p className="sub-heading">Manage your delivery addresses for fast checkout</p>
                </div>
                <button type="button" className="btn btn-black-sm">+ Add New Address</button>
              </div>

              <div className="addresses-grid">
                {addresses.map((addr) => (
                  <div key={addr.id} className="address-card">
                    <div className="addr-header">
                      <span className="addr-tag">{addr.type}</span>
                      {addr.isDefault && <span className="default-pill">Default</span>}
                    </div>
                    <h4 className="addr-name">{addr.name}</h4>
                    <p className="addr-text">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="addr-phone">Phone: {addr.phone}</p>

                    <div className="addr-actions">
                      <button type="button" className="link-btn">Edit</button>
                      <button type="button" className="link-btn danger-link">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PAYMENT METHODS */}
          {activeTab === 'payments' && (
            <div className="tab-content">
              <div className="page-header-row header-with-actions">
                <div>
                  <h1 className="main-heading">Payment Methods</h1>
                  <p className="sub-heading">Manage your saved cards & UPI handles</p>
                </div>
                <button type="button" className="btn btn-black-sm">+ Add Payment Method</button>
              </div>

              <div className="payment-cards-wrap">
                <div className="payment-card-box">
                  <div className="card-brand">💳 Visa Ending in 4242</div>
                  <p className="card-exp">Expires 12/28</p>
                  <span className="default-pill">Primary Method</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS & OTHER TABS */}
          {['settings', 'reviews', 'notifications', 'privacy'].includes(activeTab) && (
            <div className="tab-content">
              <div className="page-header-row">
                <div>
                  <h1 className="main-heading" style={{ textTransform: 'capitalize' }}>
                    {activeTab === 'settings' ? 'Account Settings' : activeTab}
                  </h1>
                  <p className="sub-heading">Update your preferences & profile details</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="settings-form-card">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-black" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Edit Profile Modal */}
      {editProfileModal && (
        <div className="modal-overlay" onClick={() => setEditProfileModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button type="button" className="close-btn" onClick={() => setEditProfileModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-control"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditProfileModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-black" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
