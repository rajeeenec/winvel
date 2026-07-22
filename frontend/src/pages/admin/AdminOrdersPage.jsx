import { useEffect, useState } from 'react';
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

export default function AdminOrdersPage() {
  const { currencySymbol } = useSettings();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="page-title">Orders</h1>

      {orders.length === 0 ? (
        <div className="card card-center">
          <p className="text-muted">No orders yet.</p>
        </div>
      ) : (
        <div className="card card-flush">
          <table className="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="font-medium">{order.order_number}</td>
                  <td>{order.first_name} {order.last_name}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>{currencySymbol}{order.total}</td>
                  <td>
                    <span className={`badge ${statusBadge[order.status] || 'badge-info'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
