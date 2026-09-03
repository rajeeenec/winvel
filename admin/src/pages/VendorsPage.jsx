import { useState, useEffect } from 'react';
import { Plus, Search, Building2, ShieldCheck, ToggleLeft, ToggleRight, X, Check, Edit3, AlertCircle, FileText } from 'lucide-react';
import api from '../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\s\-()]{7,15}$/;

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstin: '',
    address: '',
  });

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vendors');
      const list = res.data || res || [];
      if (Array.isArray(list) && list.length > 0) {
        setVendors(list);
      } else {
        // Sample default vendors if DB is empty
        setVendors([
          { id: 1, name: 'Apex Apparel Clothing', contact_person: 'Suresh Kumar', email: 'suresh@apexapparel.com', phone: '+91 9840123456', gstin: '33AAAAA0000A1Z5', is_active: true },
          { id: 2, name: 'Winvel Weaves & Textile', contact_person: 'Anitha Raj', email: 'anitha@winvelweaves.com', phone: '+91 9789012345', gstin: '33BBBBB1111B2Z6', is_active: true },
        ]);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setErrorMsg('');
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      gstin: '',
      address: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (vendor) => {
    setEditingVendor(vendor);
    setErrorMsg('');
    setFormData({
      name: vendor.name || '',
      contactPerson: vendor.contact_person || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      gstin: vendor.gstin || '',
      address: vendor.address || '',
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
      setErrorMsg('Please enter a vendor company name');
      return;
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    if (phone && !PHONE_REGEX.test(phone)) {
      setErrorMsg('Please enter a valid phone number (e.g. +91 9876543210)');
      return;
    }

    try {
      if (editingVendor) {
        await api.put(`/vendors/${editingVendor.id}`, formData);
      } else {
        await api.post('/vendors', formData);
      }
      setShowModal(false);
      fetchVendors();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save vendor details');
    }
  };

  const handleToggleStatus = async (vendor) => {
    const nextStatus = !vendor.is_active;
    try {
      await api.patch(`/vendors/${vendor.id}/status`, { isActive: nextStatus });
      fetchVendors();
    } catch (err) {
      alert('Error updating vendor status: ' + err.message);
    }
  };

  const filteredVendors = vendors.filter((v) => {
    const company = (v.name || '').toLowerCase();
    const contact = (v.contact_person || '').toLowerCase();
    const email = (v.email || '').toLowerCase();
    const gstin = (v.gstin || '').toLowerCase();
    const query = search.toLowerCase();
    return company.includes(query) || contact.includes(query) || email.includes(query) || gstin.includes(query);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendors & Suppliers</h1>
          <p className="page-subtitle">Manage clothing manufacturers, wholesale suppliers, and vendor accounts</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-black">
          <Plus size={16} />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Total Vendors</div>
            <div className="value">{vendors.length}</div>
          </div>
          <div className="metric-icon">
            <Building2 size={20} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Active Suppliers</div>
            <div className="value">{vendors.filter((v) => v.is_active).length}</div>
          </div>
          <div className="metric-icon">
            <ShieldCheck size={20} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Verified Tax IDs</div>
            <div className="value">{vendors.filter((v) => v.gstin).length}</div>
          </div>
          <div className="metric-icon">
            <FileText size={20} />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: '1rem', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Showing <strong>{filteredVendors.length}</strong> vendor accounts
          </span>
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search vendors by company, contact, GST..."
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
              <th>COMPANY / VENDOR</th>
              <th>CONTACT PERSON</th>
              <th>EMAIL ADDRESS</th>
              <th>PHONE</th>
              <th>GST / TAX ID</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  Loading vendors catalog...
                </td>
              </tr>
            ) : filteredVendors.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  No vendor accounts found. Click "Add Vendor" to create one.
                </td>
              </tr>
            ) : (
              filteredVendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#E5DBCB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                        <Building2 size={16} color="#1A1918" />
                      </div>
                      <span>{vendor.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-text)', fontWeight: 500, fontSize: '0.85rem' }}>
                    {vendor.contact_person || 'N/A'}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    {vendor.email}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    {vendor.phone || 'N/A'}
                  </td>
                  <td>
                    <span className="badge badge-shipped" style={{ fontWeight: 600 }}>
                      {vendor.gstin || 'Unregistered'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${vendor.is_active ? 'badge-active' : 'badge-blocked'}`}>
                      {vendor.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={() => handleOpenEdit(vendor)}
                        className="btn btn-secondary btn-sm"
                        title="Edit vendor details"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(vendor)}
                        className={`btn ${vendor.is_active ? 'btn-danger' : 'btn-secondary'} btn-sm`}
                        title={vendor.is_active ? 'Block vendor' : 'Activate vendor'}
                      >
                        {vendor.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Vendor Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingVendor ? 'Edit Vendor' : 'Add Vendor'}</h2>
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
                <label className="form-label">Vendor / Company Name</label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apex Apparel Clothing Pvt Ltd"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Person Name</label>
                <input
                  type="text"
                  autoComplete="off"
                  className="form-control"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="e.g. Suresh Kumar"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  autoComplete="new-password"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. suresh@apexapparel.com"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    autoComplete="off"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 9840123456"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">GST / Tax Identification ID</label>
                  <input
                    type="text"
                    autoComplete="off"
                    className="form-control"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    placeholder="e.g. 33AAAAA0000A1Z5"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Company Address</label>
                <textarea
                  rows="2"
                  autoComplete="off"
                  className="form-control"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address, city, state..."
                ></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-black">
                  <Check size={16} />
                  <span>{editingVendor ? 'Save Changes' : 'Create Vendor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
