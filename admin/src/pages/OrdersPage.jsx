import { useState, useEffect } from 'react';
import { Search, ShoppingBag, Eye, RefreshCw, X, MapPin, Package, CreditCard } from 'lucide-react';
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
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus, order_status: newStatus } : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus, order_status: newStatus });
      }
    } catch {
      alert('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const searchLower = search.toLowerCase();
    const orderNo = o.order_number || '';
    const customer = o.customer_name || '';
    const phone = o.phone || '';
    const matchesSearch =
      orderNo.toLowerCase().includes(searchLower) ||
      customer.toLowerCase().includes(searchLower) ||
      phone.toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter || o.order_status === statusFilter;
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
                placeholder="Search by order #, customer, phone..."
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
                <option value="confirmed">Confirmed</option>
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
              <th>PAYMENT METHOD</th>
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
                  <div style={{ padding: '4rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 58, height: 58, borderRadius: '50%', background: '#F5EDE2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1918', marginBottom: '1.25rem' }}>
                      <ShoppingBag size={24} />
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '0.98rem', color: '#1A1918', marginBottom: '0.35rem' }}>
                      No orders match your filter criteria.
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#78716C' }}>
                      When customers place orders on the store, they will appear here.
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
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {o.phone || o.email || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${o.payment_status === 'paid' ? 'active' : 'pending'}`}>
                      {(o.payment_method || 'cod').toUpperCase()} ({o.payment_status || 'pending'})
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{o.total_amount}</td>
                  <td>
                    <select
                      className="form-control"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto', borderRadius: '4px', fontWeight: 600 }}
                      value={o.status || o.order_status || 'pending'}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
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
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="modal-content" style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <h2 className="modal-title" style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Order {selectedOrder.order_number}</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Placed on {new Date(selectedOrder.created_at || Date.now()).toLocaleString()}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="modal-close" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Delivery Address Card */}
              <div className="card" style={{ padding: '1rem', background: '#FAF6F0', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                  <MapPin size={16} /> Delivery Address
                </div>
                {selectedOrder.address ? (
                  <div style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 600 }}>{selectedOrder.address.full_name}</div>
                    <div>📞 Phone: {selectedOrder.address.phone}</div>
                    <div>{selectedOrder.address.address_line1}{selectedOrder.address.address_line2 ? `, ${selectedOrder.address.address_line2}` : ''}</div>
                    <div>{selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.postal_code}</div>
                    <div>{selectedOrder.address.country || 'India'}</div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.88rem' }}>
                    <div style={{ fontWeight: 600 }}>{selectedOrder.customer_name || 'Customer'}</div>
                    <div>Phone: {selectedOrder.phone || 'N/A'}</div>
                    <div>Email: {selectedOrder.email || 'N/A'}</div>
                  </div>
                )}
              </div>

              {/* Payment & Order Status Card */}
              <div className="card" style={{ padding: '1rem', background: '#FAF6F0', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                  <CreditCard size={16} /> Payment & Status Info
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <div>Payment Method: <strong>{(selectedOrder.payment_method || 'cod').toUpperCase()}</strong></div>
                  <div>Payment Status: <strong>{(selectedOrder.payment_status || 'pending').toUpperCase()}</strong></div>
                  <div>Total Amount: <strong>₹{selectedOrder.total_amount}</strong></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>Order Status:</span>
                    <select
                      className="form-control"
                      style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem', borderRadius: '4px', fontWeight: 600 }}
                      value={selectedOrder.status || selectedOrder.order_status || 'pending'}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Purchased Items List */}
              <div className="card" style={{ padding: '1rem', background: '#FAF6F0', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
                  <Package size={16} /> Ordered Items ({selectedOrder.items ? selectedOrder.items.length : 0})
                </div>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid #E2D9CF' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.product_name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '4px' }} />
                          ) : (
                            <div style={{ width: 44, height: 44, background: '#e0e0e0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>Item</div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.product_name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                              Size: {item.size || item.size_name || 'N/A'}{item.color || item.color_name ? ` | Color: ${item.color || item.color_name}` : ''}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.88rem' }}>
                          <div>₹{item.unit_price} × {item.quantity}</div>
                          <div style={{ fontWeight: 700 }}>₹{item.total_price || (item.unit_price * item.quantity)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>No items detail recorded</div>
                )}
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #eee', textAlign: 'right' }}>
              <button onClick={() => setSelectedOrder(null)} className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
