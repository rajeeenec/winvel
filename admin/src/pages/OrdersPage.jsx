import { useState, useEffect } from 'react';
import { Search, ShoppingBag, Eye, RefreshCw, X } from 'lucide-react';
import api from '../services/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders')
      .then((data) => {
        const orderList = data.data || data.orders || (Array.isArray(data) ? data : []);
        setOrders(orderList);
      })
      .catch(() => {
        setOrders([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch {
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.order_number && o.order_number.toLowerCase().includes(search.toLowerCase())) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders Management</h1>
          <p className="page-subtitle">Track, update, and manage customer purchases and order fulfillment</p>
        </div>
        <button onClick={fetchOrders} className="btn btn-black">
          <RefreshCw size={16} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1rem', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Showing <strong>{filteredOrders.length}</strong> orders
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative', width: 280 }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search by order # or customer..."
                style={{ paddingLeft: '2.2rem', width: '100%', borderRadius: '6px', fontSize: '0.83rem' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--color-text)' }}>Status:</span>
              <select
                className="form-control"
                style={{ borderRadius: '6px', minWidth: 130, cursor: 'pointer', fontSize: '0.83rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ORDER NUMBER</th>
              <th>CUSTOMER</th>
              <th>PAYMENT</th>
              <th>TOTAL AMOUNT</th>
              <th>ORDER STATUS</th>
              <th>DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  Loading customer orders...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: 0 }}>
                  {/* Empty state matching screenshot */}
                  <div style={{ padding: '4rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 58, height: 58, borderRadius: '50%', background: '#F5EDE2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1918', marginBottom: '1.25rem' }}>
                      <ShoppingBag size={24} />
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '0.98rem', color: '#1A1918', marginBottom: '0.35rem' }}>
                      No orders match your filter criteria.
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#78716C' }}>
                      Try adjusting your search or filter.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700, color: 'var(--color-text)' }}>{o.order_number}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{o.customer_name || 'Store Customer'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{o.email || o.phone || 'N/A'}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${o.payment_status === 'paid' ? 'active' : 'pending'}`}>
                      {o.payment_method ? o.payment_method.toUpperCase() : 'ONLINE'} ({o.payment_status || 'paid'})
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{o.total_amount}</td>
                  <td>
                    <select
                      className="form-control"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto', borderRadius: '4px' }}
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {o.created_at ? new Date(o.created_at).toLocaleDateString() : 'Today'}
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye size={14} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Order {selectedOrder.order_number}</h2>
              <button onClick={() => setSelectedOrder(null)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card" style={{ padding: '1rem', background: '#FAF6F0' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>Customer Details</div>
                <div style={{ fontSize: '0.9rem' }}>Name: {selectedOrder.customer_name || 'Customer'}</div>
                <div style={{ fontSize: '0.9rem' }}>Email: {selectedOrder.email || 'N/A'}</div>
                <div style={{ fontSize: '0.9rem' }}>Phone: {selectedOrder.phone || 'N/A'}</div>
              </div>

              <div className="card" style={{ padding: '1rem', background: '#FAF6F0' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>Payment & Status</div>
                <div style={{ fontSize: '0.9rem' }}>Total: <strong>₹{selectedOrder.total_amount}</strong></div>
                <div style={{ fontSize: '0.9rem' }}>Method: {selectedOrder.payment_method}</div>
                <div style={{ fontSize: '0.9rem' }}>Current Status: <span className={`badge badge-${selectedOrder.status}`}>{selectedOrder.status}</span></div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setSelectedOrder(null)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
