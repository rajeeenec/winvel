import { useState, useEffect } from 'react';
import { Plus, Search, ShieldCheck, UserCheck, Lock, ToggleLeft, ToggleRight, X, Check, Edit3, AlertCircle } from 'lucide-react';
import api from '../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\s\-()]{7,15}$/;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    roleId: 2,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users?type=staff').catch(() => ({ data: [] })),
        api.get('/roles').catch(() => ({ data: [] })),
      ]);
      const userList = usersRes.data || usersRes || [];
      const roleList = rolesRes.data || rolesRes || [];

      const staffRolesList = (Array.isArray(roleList) ? roleList : [
        { id: 2, name: 'Admin' },
        { id: 3, name: 'Super Admin' },
        { id: 4, name: 'Store Manager' },
      ]).filter((r) => r.name.toLowerCase() !== 'customer');

      setUsers(Array.isArray(userList) ? userList : []);
      setRoles(staffRolesList);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setErrorMsg('');
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      roleId: roles[0]?.id || 2,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setErrorMsg('');
    setFormData({
      name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      email: user.email || '',
      password: '',
      phone: user.phone || '',
      roleId: user.role_id || 2,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Client-side Validation
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    if (!name) {
      setErrorMsg('Please enter a full name');
      return;
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    if (phone && !PHONE_REGEX.test(phone)) {
      setErrorMsg('Please enter a valid phone number (e.g. +91 9876543210)');
      return;
    }

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, {
          name,
          phone,
          roleId: formData.roleId,
        });
      } else {
        await api.post('/users', {
          name,
          email,
          password: formData.password,
          phone,
          roleId: formData.roleId,
        });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save user details');
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = !user.is_active;
    try {
      await api.patch(`/users/${user.id}/status`, { isActive: nextStatus });
      fetchData();
    } catch (err) {
      alert('Error updating user status: ' + err.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    const name = (u.name || `${u.first_name || ''} ${u.last_name || ''}`).toLowerCase();
    const email = (u.email || '').toLowerCase();
    const role = (u.role || '').toLowerCase();
    const query = search.toLowerCase();
    return name.includes(query) || email.includes(query) || role.includes(query);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Users</h1>
          <p className="page-subtitle">Manage system user accounts, assigned roles, and access permissions</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-black">
          <Plus size={16} />
          <span>Add User</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Total System Users</div>
            <div className="value">{users.length}</div>
          </div>
          <div className="metric-icon">
            <UserCheck size={20} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Active Sessions</div>
            <div className="value">{users.filter((u) => u.is_active).length}</div>
          </div>
          <div className="metric-icon">
            <ShieldCheck size={20} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">System Roles</div>
            <div className="value">{roles.length}</div>
          </div>
          <div className="metric-icon">
            <Lock size={20} />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: '1rem', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Showing <strong>{filteredUsers.length}</strong> system users
          </span>
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search users by name, email, or role..."
              style={{ paddingLeft: '2.2rem', width: '100%', borderRadius: '6px', fontSize: '0.83rem' }}
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
              <th>USER NAME</th>
              <th>EMAIL ADDRESS</th>
              <th>PHONE</th>
              <th>ASSIGNED ROLE</th>
              <th>STATUS</th>
              <th>JOINED DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  Loading system user accounts...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  No system users found. Click "Add User" to create one.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const displayName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
                return (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#E5DBCB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                          {displayName[0]}
                        </div>
                        <span>{displayName}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      {user.email}
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      {user.phone || 'N/A'}
                    </td>
                    <td>
                      <span className="badge badge-shipped" style={{ fontWeight: 600 }}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.is_active ? 'badge-active' : 'badge-blocked'}`}>
                        {user.is_active ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="btn btn-secondary btn-sm"
                          title="Edit user details or role"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`btn ${user.is_active ? 'btn-danger' : 'btn-secondary'} btn-sm`}
                          title={user.is_active ? 'Block user account' : 'Activate user account'}
                        >
                          {user.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
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

      {/* Add / Edit User Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingUser ? 'Edit User' : 'Add User'}</h2>
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
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  autoComplete="new-password"
                  disabled={!!editingUser}
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. rahul@winvel.com"
                />
              </div>

              {!editingUser && (
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

                <div className="form-group">
                  <label className="form-label">Assigned Role</label>
                  <select
                    className="form-control"
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-black">
                  <Check size={16} />
                  <span>{editingUser ? 'Save Changes' : 'Create User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
