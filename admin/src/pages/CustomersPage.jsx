import { useState, useEffect } from 'react';
import { Plus, Search, Users, ShoppingBag, DollarSign, Key, ToggleLeft, ToggleRight, X, Check, Edit3, AlertCircle } from 'lucide-react';
import api from '../services/api';
import UpdatePasswordModal from '../components/UpdatePasswordModal';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\s\-()]{7,15}$/;

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [passwordModalCustomer, setPasswordModalCustomer] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users?type=customer');
      const list = res.data || res || [];
      setCustomers(Array.isArray(list) ? list : []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setErrorMsg('');
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);
    setErrorMsg('');
    setFormData({
      name: customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
      email: customer.email || '',
      password: '',
      phone: customer.phone || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    if (!name) {
      setErrorMsg('Please enter customer full name');
      return;
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    if (!editingCustomer && (!formData.password || formData.password.length < 6)) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    if (phone && !PHONE_REGEX.test(phone)) {
      setErrorMsg('Please enter a valid phone number (e.g. +91 9876543210)');
      return;
    }

    try {
      if (editingCustomer) {
        await api.put(`/users/${editingCustomer.id}`, {
          name,
          phone,
        });
      } else {
        await api.post('/users', {
          name,
          email,
          password: formData.password,
          phone,
          roleId: 1, // Customer role
        });
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save customer details');
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = !user.is_active;
    try {
      await api.patch(`/users/${user.id}/status`, { isActive: nextStatus });
      fetchCustomers();
    } catch (err) {
      alert('Error updating customer status: ' + err.message);
    }
  };

  const filteredCustomers = customers.filter((u) => {
    const fullName = (u.name || `${u.first_name || ''} ${u.last_name || ''}`).toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = (u.phone || '').toLowerCase();
    const query = search.toLowerCase();
    return fullName.includes(query) || email.includes(query) || phone.includes(query);
  });

  const totalSpentAll = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const totalOrdersAll = customers.reduce((sum, c) => sum + (c.order_count || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Shopping Customers</h1>
          <p className="page-subtitle">Manage registered storefront customers, purchase history, and account statuses</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-black">
          <Plus size={16} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Registered Customers</div>
            <div className="value">{customers.length}</div>
          </div>
          <div className="metric-icon">
            <Users size={20} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Total Orders Placed</div>
            <div className="value">{totalOrdersAll}</div>
          </div>
          <div className="metric-icon">
            <ShoppingBag size={20} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Customer Revenue</div>
            <div className="value">₹{totalSpentAll.toLocaleString('en-IN')}</div>
          </div>
          <div className="metric-icon">
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: '1rem', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Showing <strong>{filteredCustomers.length}</strong> shopping customers
          </span>
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search customers..."
              style={{ paddingLeft: '2.2rem', width: '100%', fontSize: '0.83rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>CUSTOMER NAME</th>
              <th>EMAIL ADDRESS</th>
              <th>PHONE</th>
              <th>ORDERS</th>
              <th>TOTAL SPENT</th>
              <th>STATUS</th>
              <th>JOINED DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading customer accounts...
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No customer records found. Click "Add Customer" to create one.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((u) => {
                const displayName = u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Customer';
                return (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>#{u.id}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#E5DBCB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                          {displayName[0]}
                        </div>
                        <span>{displayName}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.email}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.phone || 'N/A'}</td>
                    <td>
                      <span className="badge badge-shipped" style={{ fontWeight: 600 }}>
                        {u.order_count ?? 0}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                      ₹{u.total_spent.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-active' : 'badge-blocked'}`}>
                        {u.is_active ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="btn btn-secondary btn-sm"
                          title="Edit customer details"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setPasswordModalCustomer(u)}
                          className="btn btn-secondary btn-sm"
                          title="Update customer password"
                        >
                          <Key size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`btn ${u.is_active ? 'btn-danger' : 'btn-secondary'} btn-sm`}
                          title={u.is_active ? 'Block customer account' : 'Activate customer account'}
                        >
                          {u.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} autoComplete="off">
              {errorMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '1rem', border: '1px solid #FCA5A5' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Priya Sundaram"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  autoComplete="new-password"
                  disabled={!!editingCustomer}
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. priya@gmail.com"
                />
              </div>

              {!editingCustomer && (
                <div className="form-group">
                  <label className="form-label">Temporary Password</label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    className="form-control"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  autoComplete="off"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-black">
                  <Check size={16} />
                  <span>{editingCustomer ? 'Save Changes' : 'Create Customer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Update Password Modal */}
      <UpdatePasswordModal
        isOpen={!!passwordModalCustomer}
        user={passwordModalCustomer}
        onClose={() => setPasswordModalCustomer(null)}
        onSuccess={fetchCustomers}
      />
    </div>
  );
}
