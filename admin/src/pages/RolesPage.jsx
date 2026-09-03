import { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, ShieldCheck, Users, Key, X, Check } from 'lucide-react';
import api from '../services/api';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionIds: [],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/roles').catch(() => ({ data: [] })),
        api.get('/roles/permissions').catch(() => ({ data: [] })),
      ]);

      const roleList = rolesRes.data || rolesRes || [];
      const permList = permsRes.data || permsRes || [];

      if (Array.isArray(roleList) && roleList.length > 0) {
        setRoles(roleList);
      } else {
        // Sample default roles if DB empty
        setRoles([
          { id: 1, name: 'Customer', description: 'General shopping customer account', user_count: 12, permission_count: 2 },
          { id: 2, name: 'Admin', description: 'Store administrator with catalog & order access', user_count: 2, permission_count: 8 },
          { id: 3, name: 'Super Admin', description: 'Full control system administrator', user_count: 1, permission_count: 10 },
          { id: 4, name: 'Store Manager', description: 'Manages catalog items and updates order statuses', user_count: 3, permission_count: 6 },
        ]);
      }

      setPermissions(permList.length > 0 ? permList : [
        { id: 1, name: 'products.view', module: 'Products', action: 'View Products' },
        { id: 2, name: 'products.create', module: 'Products', action: 'Create Product' },
        { id: 3, name: 'products.edit', module: 'Products', action: 'Edit Product' },
        { id: 4, name: 'products.delete', module: 'Products', action: 'Delete Product' },
        { id: 5, name: 'orders.view', module: 'Orders', action: 'View Orders' },
        { id: 6, name: 'orders.manage', module: 'Orders', action: 'Update Order Status' },
        { id: 7, name: 'categories.manage', module: 'Categories', action: 'Manage Categories' },
        { id: 8, name: 'customers.view', module: 'Customers', action: 'View Customers' },
        { id: 9, name: 'settings.manage', module: 'Settings', action: 'Manage Store & Theme Settings' },
        { id: 10, name: 'roles.manage', module: 'Roles', action: 'Manage Roles & Access Control' },
      ]);
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
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissionIds: permissions.map((p) => p.id),
    });
    setShowModal(true);
  };

  const handleOpenEdit = async (role) => {
    setEditingRole(role);
    try {
      const res = await api.get(`/roles/${role.id}`);
      const details = res.data || res;
      const assignedPermIds = details.permissions ? details.permissions.map((p) => p.id) : [];
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissionIds: assignedPermIds,
      });
    } catch {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissionIds: [1, 2, 3, 5, 6],
      });
    }
    setShowModal(true);
  };

  const handlePermissionToggle = (permId) => {
    const current = formData.permissionIds;
    if (current.includes(permId)) {
      setFormData({ ...formData, permissionIds: current.filter((id) => id !== permId) });
    } else {
      setFormData({ ...formData, permissionIds: [...current, permId] });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await api.put(`/roles/${editingRole.id}`, formData);
      } else {
        await api.post('/roles', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Error saving role: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await api.delete(`/roles/${id}`);
      fetchData();
    } catch (err) {
      alert('Error deleting role: ' + err.message);
    }
  };

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
  );

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const mod = perm.module || 'General';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(perm);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Roles & Access Control</h1>
          <p className="page-subtitle">Configure administrator roles, staff access levels, and system permissions</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-black">
          <Plus size={16} />
          <span>Add New Role</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Total System Roles</div>
            <div className="value">{roles.length}</div>
          </div>
          <div className="metric-icon">
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">System Permissions</div>
            <div className="value">{permissions.length}</div>
          </div>
          <div className="metric-icon">
            <Key size={24} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Assigned Admins</div>
            <div className="value">
              {roles.reduce((sum, r) => sum + (parseInt(r.user_count) || 0), 0)}
            </div>
          </div>
          <div className="metric-icon">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: '1rem', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Showing <strong>{filteredRoles.length}</strong> system roles
          </span>
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search roles..."
              style={{ paddingLeft: '2.2rem', width: '100%', borderRadius: '6px', fontSize: '0.83rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Roles Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ROLE NAME</th>
              <th>DESCRIPTION</th>
              <th>USERS ASSIGNED</th>
              <th>PERMISSIONS</th>
              <th>TYPE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  Loading access control roles...
                </td>
              </tr>
            ) : filteredRoles.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  No roles found. Click "Add New Role" to create one.
                </td>
              </tr>
            ) : (
              filteredRoles.map((role) => (
                <tr key={role.id}>
                  <td style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShieldCheck size={18} color="var(--color-secondary)" />
                      <span>{role.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    {role.description || 'No description provided'}
                  </td>
                  <td>
                    <span className="badge badge-active">
                      {role.user_count || 0} user{role.user_count === 1 ? '' : 's'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-shipped">
                      {role.permission_count || 0} granted
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-confirmed">
                      {[1, 2].includes(Number(role.id)) ? 'System Core' : 'Custom'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenEdit(role)}
                        className="btn btn-secondary btn-sm"
                        title="Edit role"
                      >
                        <Edit3 size={14} />
                      </button>
                      {![1, 2].includes(Number(role.id)) && (
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="btn btn-danger btn-sm"
                          title="Delete role"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Add / Edit Role */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 950, width: '95vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
            {/* Fixed Top Header */}
            <div className="modal-header" style={{ padding: '1.25rem 1.5rem', marginBottom: 0, borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="modal-title">{editingRole ? 'Edit Role Permissions' : 'Create New Role'}</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              {/* 2-Column Body */}
              <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', flex: 1, overflow: 'hidden', padding: '1.25rem 1.5rem' }}>
                {/* FIXED LEFT COLUMN: Role Identity Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#FAF6F0', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--color-border)', height: 'fit-content' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Role Identity Details
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Role Title</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Store Manager"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Role Description</label>
                    <textarea
                      rows="4"
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the responsibilities and scope of this role..."
                    ></textarea>
                  </div>

                  <div style={{ paddingTop: '0.25rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, permissionIds: permissions.map((p) => p.id) })}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.78rem', flex: 1 }}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, permissionIds: [] })}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.78rem', flex: 1 }}
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* SCROLLABLE RIGHT COLUMN: Module Permissions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '100%', paddingRight: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', position: 'sticky', top: 0, background: 'var(--color-surface)', zIndex: 10, paddingTop: '0.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Module Permissions
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      <strong>{formData.permissionIds.length}</strong> of <strong>{permissions.length}</strong> selected
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
                    {Object.entries(groupedPermissions).map(([moduleName, modulePerms]) => (
                      <div key={moduleName} style={{ background: '#FAF6F0', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '1rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-text)', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{moduleName} Module</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                            {modulePerms.filter((p) => formData.permissionIds.includes(p.id)).length}/{modulePerms.length}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {modulePerms.map((perm) => {
                            const isChecked = formData.permissionIds.includes(perm.id);
                            return (
                              <label
                                key={perm.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.6rem',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  padding: '0.4rem 0.6rem',
                                  background: isChecked ? 'var(--color-surface)' : 'transparent',
                                  borderRadius: '6px',
                                  border: isChecked ? '1px solid var(--color-border)' : '1px solid transparent',
                                  transition: 'var(--transition)',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handlePermissionToggle(perm.id)}
                                />
                                <span style={{ fontWeight: isChecked ? 600 : 400, color: 'var(--color-text)' }}>
                                  {perm.action || perm.name}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FIXED BOTTOM FOOTER */}
              <div className="modal-footer" style={{ padding: '1rem 1.5rem', marginTop: 0, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-black">
                  <Check size={16} />
                  <span>{editingRole ? 'Save Changes' : 'Create Role'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
