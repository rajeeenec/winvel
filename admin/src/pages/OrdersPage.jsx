import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag, Eye, RefreshCw, X, MapPin, Package, CreditCard, ListFilter } from 'lucide-react';
import api from '../services/api';
import DateRangePicker from '../components/common/DateRangePicker';

const DEFAULT_MASTER_STATUSES = [
  { id: 1, code: 'ORDER_PLACED', name: 'Order Placed' },
  { id: 2, code: 'PAYMENT_STATUS', name: 'Payment Status' },
  { id: 3, code: 'CONFIRMED', name: 'Confirmed' },
  { id: 4, code: 'PACKING_IN_PROGRESS', name: 'Packing in Progress' },
  { id: 5, code: 'READY_FOR_PICKUP', name: 'Ready for Pickup' },
  { id: 6, code: 'OUT_FOR_DELIVERY', name: 'Out for Delivery' },
  { id: 7, code: 'DELIVERED', name: 'Delivered' },
  { id: 8, code: 'COMPLETED', name: 'Completed' },
  { id: 9, code: 'CANCELED', name: 'Canceled' },
  { id: 10, code: 'RETURN_PLACED', name: 'Return Placed' },
];

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isStatusView = searchParams.get('view') === 'status';

  const [orders, setOrders] = useState([]);
  const [masterStatuses, setMasterStatuses] = useState(DEFAULT_MASTER_STATUSES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);

  const [activeFilters, setActiveFilters] = useState({
    search: '',
    statusFilter: 'all',
    dateRange: null,
  });

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
    api.get('/order-statuses')
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setMasterStatuses(res.data);
        }
      })
      .catch(() => setMasterStatuses(DEFAULT_MASTER_STATUSES));
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

  const handleApplyFilters = () => {
    setActiveFilters({
      search,
      statusFilter,
      dateRange,
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setDateRange(null);
    setActiveFilters({
      search: '',
      statusFilter: 'all',
      dateRange: null,
    });
  };

  const handleSelectLeftStatus = (stCode) => {
    const codeLower = stCode.toLowerCase();
    setStatusFilter(codeLower);
    setActiveFilters((prev) => ({
      ...prev,
      statusFilter: codeLower,
    }));
  };

  const getStatusCount = (stCode) => {
    if (stCode === 'all') return orders.length;
    const normKey = stCode.toLowerCase().replace(/[\s_-]+/g, '');
    return orders.filter((o) => {
      const st = (o.status || o.order_status || '').toLowerCase().replace(/[\s_-]+/g, '');
      if (normKey === 'orderplaced') {
        return st === 'orderplaced' || st === 'pending' || st === 'placed';
      }
      return st === normKey;
    }).length;
  };

  const filteredOrders = orders.filter((o) => {
    const searchLower = activeFilters.search.toLowerCase();
    const orderNo = o.order_number || '';
    const customer = o.customer_name || '';
    const phone = o.phone || '';
    const matchesSearch =
      !searchLower ||
      orderNo.toLowerCase().includes(searchLower) ||
      customer.toLowerCase().includes(searchLower) ||
      phone.toLowerCase().includes(searchLower);

    const matchesStatus = (() => {
      if (activeFilters.statusFilter === 'all') return true;
      const orderSt = (o.status || o.order_status || '').toLowerCase().replace(/[\s_-]+/g, '');
      const filterSt = activeFilters.statusFilter.toLowerCase().replace(/[\s_-]+/g, '');
      if (filterSt === 'orderplaced') {
        return orderSt === 'orderplaced' || orderSt === 'pending' || orderSt === 'placed';
      }
      return orderSt === filterSt;
    })();
    
    const matchesDate = (() => {
      if (!activeFilters.dateRange || !activeFilters.dateRange.startDate || !activeFilters.dateRange.endDate) return true;
      const orderTime = new Date(o.created_at || o.placed_at || Date.now()).getTime();
      const s = new Date(activeFilters.dateRange.startDate).setHours(0, 0, 0, 0);
      const e = new Date(activeFilters.dateRange.endDate).setHours(23, 59, 59, 999);
      return orderTime >= s && orderTime <= e;
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const filterBarJSX = (
    <div className="card" style={{ marginBottom: '1rem', padding: '0.75rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
          Showing <strong>{filteredOrders.length}</strong> orders
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* 1. Date Range Picker (Leftmost) */}
          <DateRangePicker
            startDate={dateRange?.startDate}
            endDate={dateRange?.endDate}
            onApply={(range) => setDateRange(range)}
            align="left"
          />

          {/* 2. Status Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--color-text)' }}>Status:</span>
            <select
              className="form-control"
              style={{ borderRadius: '6px', minWidth: 130, cursor: 'pointer', fontSize: '0.83rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {masterStatuses.length > 0 ? (
                masterStatuses.map((st) => (
                  <option key={st.id || st.code} value={st.code.toLowerCase()}>
                    {st.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
            </select>
          </div>

          {/* 3. Search Bar */}
          <div style={{ position: 'relative', width: 240 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by order #, customer..."
              style={{ paddingLeft: '2.2rem', width: '100%', borderRadius: '6px', fontSize: '0.83rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* 4. Apply Button */}
          <button
            type="button"
            onClick={handleApplyFilters}
            className="btn btn-black"
            style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: 600 }}
          >
            Apply
          </button>

          {/* 5. Clear Button */}
          <button
            type="button"
            onClick={handleClearFilters}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: 600 }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );

  const tableJSX = (
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
                    value={(o.status || o.order_status || 'pending').toLowerCase()}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  >
                    {masterStatuses.length > 0 ? (
                      masterStatuses.map((st) => (
                        <option key={st.id || st.code} value={st.code.toLowerCase()}>
                          {st.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </>
                    )}
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
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isStatusView ? 'Order Status Management' : 'Orders Management'}</h1>
          <p className="page-subtitle">Track, update, and manage customer purchases and order fulfillment</p>
        </div>
        <button onClick={fetchOrders} className="btn btn-black">
          <RefreshCw size={16} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {isStatusView ? (
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '1.25rem', alignItems: 'start' }}>
          {/* Left Side: Order Status Navigation Panel */}
          <div
            className="card"
            style={{
              padding: '1rem 0.75rem',
              borderRadius: '10px',
              background: '#FAF6F0',
              border: '1px solid #E2D7C5',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              position: 'sticky',
              top: '1rem',
            }}
          >
            <div style={{ padding: '0 0.5rem 0.75rem', borderBottom: '1px solid #E2D7C5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ListFilter size={16} color="#1A1918" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1A1918' }}>
                Order Statuses
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.75rem' }}>
              {/* All Orders Item */}
              <button
                type="button"
                onClick={() => handleSelectLeftStatus('all')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.83rem',
                  fontWeight: activeFilters.statusFilter === 'all' ? 700 : 500,
                  color: activeFilters.statusFilter === 'all' ? '#FFFFFF' : '#44403C',
                  backgroundColor: activeFilters.statusFilter === 'all' ? '#1A1918' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ShoppingBag size={16} color={activeFilters.statusFilter === 'all' ? '#FFFFFF' : '#78716C'} />
                  <span>All Orders</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '12px', background: activeFilters.statusFilter === 'all' ? '#FFFFFF' : '#EFE7DA', color: activeFilters.statusFilter === 'all' ? '#1A1918' : '#44403C' }}>
                  {orders.length}
                </span>
              </button>

              <div style={{ height: '1px', background: '#E2D7C5', margin: '0.35rem 0' }} />

              {/* Master Status List */}
              {masterStatuses.map((st) => {
                const count = getStatusCount(st.code);
                const isActive = activeFilters.statusFilter.toLowerCase() === st.code.toLowerCase();

                return (
                  <button
                    key={st.id || st.code}
                    type="button"
                    onClick={() => handleSelectLeftStatus(st.code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.81rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#FFFFFF' : '#44403C',
                      backgroundColor: isActive ? '#1A1918' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusBadgeColor(st.code), flexShrink: 0 }} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{st.name}</span>
                    </div>
                    <span style={{ fontSize: '0.73rem', fontWeight: 600, padding: '0.1rem 0.45rem', borderRadius: '10px', background: isActive ? '#FFFFFF' : '#EFE7DA', color: isActive ? '#1A1918' : '#78716C' }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Area: Filter Bar + Table */}
          <div>
            {filterBarJSX}
            {tableJSX}
          </div>
        </div>
      ) : (
        <>
          {filterBarJSX}
          {tableJSX}
        </>
      )}

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
                      value={(selectedOrder.status || selectedOrder.order_status || 'pending').toLowerCase()}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    >
                      {masterStatuses.map((st) => (
                        <option key={st.id || st.code} value={st.code.toLowerCase()}>
                          {st.name}
                        </option>
                      ))}
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

function getStatusBadgeColor(code) {
  const norm = String(code || '').toLowerCase().replace(/[\s_-]+/g, '');
  switch (norm) {
    case 'orderplaced':
    case 'pending':
      return '#3B82F6';
    case 'paymentstatus':
      return '#F59E0B';
    case 'confirmed':
      return '#6366F1';
    case 'packinginprogress':
      return '#8B5CF6';
    case 'readyforpickup':
      return '#14B8A6';
    case 'outfordelivery':
      return '#F59E0B';
    case 'delivered':
    case 'completed':
      return '#10B981';
    case 'canceled':
    case 'cancelled':
      return '#F43F5E';
    case 'returnplaced':
      return '#F97316';
    default:
      return '#6B7280';
  }
}
