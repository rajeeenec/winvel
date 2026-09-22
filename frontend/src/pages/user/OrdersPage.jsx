import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

const statusBadge = {
  pending: 'badge-warning',
  confirmed: 'badge-info',
  processing: 'badge-info',
  shipped: 'badge-info',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const { currencySymbol } = useSettings();
  const [orders, setOrders] = useState([]);
  const [statusMasters, setStatusMasters] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        api.get('/orders'),
        api.get('/order-statuses?active=true').catch(() => ({ data: [] })),
      ])
        .then(([resOrders, resStatuses]) => {
          const list = Array.isArray(resOrders) ? resOrders : (resOrders.data || []);
          setOrders(list);

          const statusMap = {};
          const statusList = resStatuses.data || resStatuses || [];
          if (Array.isArray(statusList)) {
            statusList.forEach((s) => {
              if (s.code) statusMap[s.code.toLowerCase()] = s;
              if (s.name) statusMap[s.name.toLowerCase()] = s;
            });
          }
          setStatusMasters(statusMap);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;
  if (loading) return <div className="container" style={{ padding: '3rem 1rem' }}><p>Loading orders...</p></div>;

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <h1 className="page-title">My Orders</h1>

      {orders.length === 0 ? (
        <div className="card card-center" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="text-muted" style={{ fontSize: '1.1rem', fontWeight: 600 }}>You haven't placed any orders yet.</p>
          <Link to="/shop" className="btn btn-black" style={{ marginTop: '1rem', display: 'inline-block' }}>Start Shopping</Link>
        </div>
      ) : (
        <div className="card card-flush">
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>Order #</th>
                <th style={{ padding: '0.75rem' }}>Date</th>
                <th style={{ padding: '0.75rem' }}>Payment</th>
                <th style={{ padding: '0.75rem' }}>Total</th>
                <th style={{ padding: '0.75rem' }}>Status & Updates</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const rawStatus = (order.order_status || order.status || 'pending').toLowerCase();
                const master = statusMasters[rawStatus];

                // Respect show_to_customer setting
                const displayStatusName = master
                  ? (master.show_to_customer ? master.name : 'Processing')
                  : rawStatus.replace(/_/g, ' ');

                const customerMsg = master && master.show_to_customer ? master.customer_label_msg : null;

                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>{order.order_number}</td>
                    <td style={{ padding: '0.75rem' }}>{new Date(order.created_at || Date.now()).toLocaleDateString()}</td>
                    <td style={{ padding: '0.75rem', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.85rem' }}>
                      {order.payment_method || 'COD'}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>{currencySymbol}{order.total_amount || order.total}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span
                        className={`badge ${statusBadge[rawStatus] || 'badge-info'}`}
                        style={{ textTransform: 'uppercase', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        {displayStatusName}
                      </span>
                      {customerMsg && (
                        <div style={{ fontSize: '0.78rem', color: '#555', marginTop: '0.35rem', fontStyle: 'italic' }}>
                          💬 {customerMsg}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
