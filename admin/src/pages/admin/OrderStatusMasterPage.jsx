import { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Mail,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  ArrowUpDown,
  Tag,
  Code,
  MessageSquare,
  Palette,
  Hash,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';

const COLOR_OPTIONS = [
  { label: 'Blue', value: 'blue', bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  { label: 'Amber', value: 'amber', bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  { label: 'Indigo', value: 'indigo', bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' },
  { label: 'Purple', value: 'purple', bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' },
  { label: 'Teal', value: 'teal', bg: '#ccfbf1', text: '#115e59', border: '#99f6e4' },
  { label: 'Emerald', value: 'emerald', bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  { label: 'Rose', value: 'rose', bg: '#ffe4e6', text: '#9f1239', border: '#fecdd3' },
  { label: 'Orange', value: 'orange', bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' },
];

export default function OrderStatusMasterPage() {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    customer_label_msg: '',
    show_to_customer: true,
    send_email: false,
    badge_color: 'blue',
    sort_order: 1,
    status: true,
  });

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/order-statuses');
      setStatuses(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch order statuses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingStatus(item);
      setFormData({
        code: item.code || '',
        name: item.name || '',
        customer_label_msg: item.customer_label_msg || '',
        show_to_customer: item.show_to_customer !== undefined ? item.show_to_customer : true,
        send_email: item.send_email !== undefined ? item.send_email : false,
        badge_color: item.badge_color || 'blue',
        sort_order: item.sort_order || 1,
        status: item.status !== undefined ? item.status : true,
      });
    } else {
      setEditingStatus(null);
      setFormData({
        code: '',
        name: '',
        customer_label_msg: '',
        show_to_customer: true,
        send_email: false,
        badge_color: 'blue',
        sort_order: (statuses.length + 1) * 10,
        status: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      setSaving(true);
      if (editingStatus) {
        await api.put(`/order-statuses/${editingStatus.id}`, formData);
      } else {
        await api.post('/order-statuses', formData);
      }
      setIsModalOpen(false);
      fetchStatuses();
    } catch (err) {
      alert(err.message || 'Failed to save order status');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order status?')) return;
    try {
      await api.delete(`/order-statuses/${id}`);
      fetchStatuses();
    } catch (err) {
      alert(err.message || 'Failed to delete status');
    }
  };

  const filteredStatuses = statuses.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.code?.toLowerCase().includes(search.toLowerCase()) ||
      s.customer_label_msg?.toLowerCase().includes(search.toLowerCase())
  );

  const getBadgeStyle = (colorKey) => {
    const matched = COLOR_OPTIONS.find((c) => c.value === colorKey);
    if (matched) {
      return { backgroundColor: matched.bg, color: matched.text, border: `1px solid ${matched.border}` };
    }
    return { backgroundColor: '#e2e8f0', color: '#334155', border: '1px solid #cbd5e1' };
  };

  return (
    <div style={{ padding: '1.75rem 2.25rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#000000',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <Sliders size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', margin: 0 }}>
                Order Status Master
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                Configure workflow statuses, customer visibility, custom message labels, and email notification triggers.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={fetchStatuses}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '10px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.65rem 1.35rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#000000',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
              transition: 'transform 0.15s ease, boxShadow 0.15s ease',
            }}
          >
            <Plus size={18} />
            Add Status
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          padding: '1.1rem 1.35rem',
          borderRadius: '14px',
          border: '1px solid var(--color-border)',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ position: 'relative', flex: 1, maxWidth: '440px' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.95rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by status name, code, or customer label..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.95rem 0.6rem 2.6rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontSize: '0.875rem',
              outline: 'none',
              backgroundColor: '#f8fafc',
              transition: 'border 0.2s ease, background 0.2s ease',
            }}
          />
        </div>

        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={15} color="#000000" /> Total Statuses: <strong>{filteredStatuses.length}</strong>
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: '0.9rem 1.35rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <AlertCircle size={19} />
          {error}
        </div>
      )}

      {/* Table Container */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: '14px',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr
              style={{
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid var(--color-border)',
                color: '#64748b',
                fontWeight: 700,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              <th style={{ padding: '1rem 1.35rem' }}>Sort</th>
              <th style={{ padding: '1rem 1.35rem' }}>Short Code</th>
              <th style={{ padding: '1rem 1.35rem' }}>Status Name</th>
              <th style={{ padding: '1rem 1.35rem' }}>Customer Label Message</th>
              <th style={{ padding: '1rem 1.35rem', textAlign: 'center' }}>Customer Visibility</th>
              <th style={{ padding: '1rem 1.35rem', textAlign: 'center' }}>Send Email</th>
              <th style={{ padding: '1rem 1.35rem', textAlign: 'center' }}>Record Status</th>
              <th style={{ padding: '1rem 1.35rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: '3.5rem', textAlign: 'center', color: '#94a3b8', fontWeight: 500 }}>
                  Loading order status master data...
                </td>
              </tr>
            ) : filteredStatuses.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '3.5rem', textAlign: 'center', color: '#94a3b8' }}>
                  No order status records match your query.
                </td>
              </tr>
            ) : (
              filteredStatuses.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <td style={{ padding: '1rem 1.35rem', fontWeight: 700, color: '#64748b' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <ArrowUpDown size={13} color="#94a3b8" /> {item.sort_order}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.35rem' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {item.code}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.35rem' }}>
                    <span
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        display: 'inline-block',
                        ...getBadgeStyle(item.badge_color),
                      }}
                    >
                      {item.name}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.35rem', color: '#475569', maxWidth: '340px', lineHeight: 1.4 }}>
                    {item.customer_label_msg ? (
                      item.customer_label_msg
                    ) : (
                      <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>None</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.35rem', textAlign: 'center' }}>
                    {item.show_to_customer ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: '#dcfce7',
                          color: '#15803d',
                          border: '1px solid #bbf7d0',
                        }}
                      >
                        <Eye size={13} /> Visible
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <EyeOff size={13} /> Hidden
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.35rem', textAlign: 'center' }}>
                    {item.send_email ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: '#e0e7ff',
                          color: '#4338ca',
                          border: '1px solid #c7d2fe',
                        }}
                      >
                        <Mail size={13} /> Yes
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: '#f8fafc',
                          color: '#94a3b8',
                          border: '1px solid #f1f5f9',
                        }}
                      >
                        No
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.35rem', textAlign: 'center' }}>
                    {item.status ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: '#dcfce7',
                          color: '#15803d',
                          border: '1px solid #bbf7d0',
                        }}
                      >
                        <Check size={13} /> Active
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: '#fee2e2',
                          color: '#991b1b',
                          border: '1px solid #fecdd3',
                        }}
                      >
                        <X size={13} /> Inactive
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.35rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenModal(item)}
                        style={{
                          padding: '0.45rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                          color: '#334155',
                          transition: 'all 0.15s ease',
                        }}
                        title="Edit Status"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        style={{
                          padding: '0.45rem',
                          borderRadius: '8px',
                          border: '1px solid #fecdd3',
                          backgroundColor: '#fff1f2',
                          cursor: 'pointer',
                          color: '#e11d48',
                          transition: 'all 0.15s ease',
                        }}
                        title="Delete Status"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Ultra-Streamlined Wider & Compact Height Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              width: '100%',
              maxWidth: '720px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.9)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#fafafa',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Tag size={17} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {editingStatus ? 'Edit Order Status' : 'Add New Order Status'}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '1px 0 0' }}>
                    Configure workflow status options & customer communication preferences.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form - Compact 2-Column Grid Layout */}
            <form onSubmit={handleSave} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
              {/* Row 1: Status Name & Short Code side-by-side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    <Tag size={13} color="#000000" />
                    Status Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Packing in Progress"
                    value={formData.name}
                    onChange={(e) => {
                      const nameVal = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        name: nameVal,
                        code: prev.code ? prev.code : nameVal.toUpperCase().replace(/[^A-Z0-9_]+/g, '_'),
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '0.875rem',
                      outline: 'none',
                      backgroundColor: '#f8fafc',
                      fontWeight: 600,
                      color: '#0f172a',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    <Code size={13} color="#000000" />
                    Short Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PACKING_IN_PROGRESS"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]+/g, '_') })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      outline: 'none',
                      backgroundColor: '#f8fafc',
                      color: '#1e293b',
                      boxSizing: 'border-box',
                      letterSpacing: '0.03em',
                    }}
                  />
                </div>
              </div>

              {/* Row 2: Customer Display Label Message */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  <MessageSquare size={13} color="#000000" />
                  Customer Display Label Message
                </label>
                <input
                  type="text"
                  placeholder="e.g. Your items are being packed with care."
                  value={formData.customer_label_msg}
                  onChange={(e) => setFormData({ ...formData, customer_label_msg: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '0.85rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Row 3: Badge Color Theme & Sort Order side-by-side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    <Palette size={13} color="#000000" />
                    Badge Color Theme
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {COLOR_OPTIONS.map((c) => {
                      const isSelected = formData.badge_color === c.value;
                      return (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, badge_color: c.value })}
                          style={{
                            padding: '0.25rem 0.55rem',
                            borderRadius: '9999px',
                            border: isSelected ? '2px solid #000000' : `1px solid ${c.border}`,
                            backgroundColor: c.bg,
                            color: c.text,
                            fontSize: '0.725rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                            transition: 'all 0.12s ease',
                          }}
                        >
                          {isSelected && <Check size={10} strokeWidth={3} />}
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    <Hash size={13} color="#000000" />
                    Sort Order Sequence
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      outline: 'none',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Row 4: Toggles side-by-side (3 Columns) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', paddingTop: '0.3rem' }}>
                {/* Toggle 1: Show to Customer */}
                <div
                  onClick={() => setFormData({ ...formData, show_to_customer: !formData.show_to_customer })}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: '10px',
                    border: formData.show_to_customer ? '1.5px solid #bbf7d0' : '1.5px solid #e2e8f0',
                    backgroundColor: formData.show_to_customer ? '#f0fdf4' : '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        backgroundColor: formData.show_to_customer ? '#dcfce7' : '#e2e8f0',
                        color: formData.show_to_customer ? '#166534' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {formData.show_to_customer ? <Eye size={14} /> : <EyeOff size={14} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                        Customer Visible
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        Tracking view
                      </div>
                    </div>
                  </div>

                  {/* Switch Pill */}
                  <div
                    style={{
                      width: '34px',
                      height: '18px',
                      borderRadius: '999px',
                      backgroundColor: formData.show_to_customer ? '#16a34a' : '#cbd5e1',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        transform: formData.show_to_customer ? 'translateX(16px)' : 'translateX(0px)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Toggle 2: Send Email */}
                <div
                  onClick={() => setFormData({ ...formData, send_email: !formData.send_email })}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: '10px',
                    border: formData.send_email ? '1.5px solid #c7d2fe' : '1.5px solid #e2e8f0',
                    backgroundColor: formData.send_email ? '#f5f3ff' : '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        backgroundColor: formData.send_email ? '#e0e7ff' : '#e2e8f0',
                        color: formData.send_email ? '#4338ca' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Mail size={14} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                        Send Email
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        Notify customer
                      </div>
                    </div>
                  </div>

                  {/* Switch Pill */}
                  <div
                    style={{
                      width: '34px',
                      height: '18px',
                      borderRadius: '999px',
                      backgroundColor: formData.send_email ? '#4f46e5' : '#cbd5e1',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        transform: formData.send_email ? 'translateX(16px)' : 'translateX(0px)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Toggle 3: Record Status Active / Inactive */}
                <div
                  onClick={() => setFormData({ ...formData, status: !formData.status })}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: '10px',
                    border: formData.status ? '1.5px solid #bbf7d0' : '1.5px solid #fecdd3',
                    backgroundColor: formData.status ? '#f0fdf4' : '#fff1f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        backgroundColor: formData.status ? '#dcfce7' : '#fee2e2',
                        color: formData.status ? '#166534' : '#991b1b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {formData.status ? <Check size={14} /> : <X size={14} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                        {formData.status ? 'Active' : 'Inactive'}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        Master status
                      </div>
                    </div>
                  </div>

                  {/* Switch Pill */}
                  <div
                    style={{
                      width: '34px',
                      height: '18px',
                      borderRadius: '999px',
                      backgroundColor: formData.status ? '#16a34a' : '#ef4444',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        transform: formData.status ? 'translateX(16px)' : 'translateX(0px)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '0.35rem',
                  paddingTop: '0.9rem',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.5rem 1.15rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.5rem 1.35rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {saving ? (
                    'Saving Changes...'
                  ) : editingStatus ? (
                    <>
                      <Check size={15} /> Update Status
                    </>
                  ) : (
                    <>
                      <Plus size={15} /> Create Status
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
