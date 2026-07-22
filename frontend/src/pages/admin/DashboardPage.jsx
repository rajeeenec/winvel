import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/products'),
      api.get('/orders').catch(() => []),
      api.get('/users').catch(() => []),
    ]).then(([products, orders, users]) => {
      setStats({
        products: products.length,
        orders: orders.length,
        users: users.length,
      });
    });
  }, []);

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <div className="grid grid-3">
        <div className="card card-center">
          <p className="stat-label">Products</p>
          <p className="stat-value">{stats.products}</p>
        </div>
        <div className="card card-center">
          <p className="stat-label">Orders</p>
          <p className="stat-value">{stats.orders}</p>
        </div>
        <div className="card card-center">
          <p className="stat-label">Users</p>
          <p className="stat-value">{stats.users}</p>
        </div>
      </div>
    </div>
  );
}
