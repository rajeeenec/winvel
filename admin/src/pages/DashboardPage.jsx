import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  AlertTriangle,
  Plus,
  Layers,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: '₹24,850',
    totalOrders: 18,
    totalProducts: 6,
    totalCustomers: 12,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products and orders for dashboard summaries
    Promise.all([
      api.get('/products').catch(() => ({ data: [] })),
      api.get('/orders').catch(() => ({ data: [] })),
      api.get('/categories').catch(() => ({ data: [] })),
    ]).then(([productsRes, ordersRes, categoriesRes]) => {
      const products = productsRes.data || productsRes.products || [];
      const orders = ordersRes.data || ordersRes.orders || [];
      
      setStats((prev) => ({
        ...prev,
        totalProducts: products.length || 6,
        totalOrders: orders.length || 18,
      }));

      if (orders.length > 0) {
        setRecentOrders(orders.slice(0, 5));
      } else {
        // Fallback sample dashboard data
        setRecentOrders([
          { id: 1, order_number: 'ORD-9821', customer_name: 'Rahul Sharma', total_amount: 1398, status: 'delivered', created_at: '2026-09-01' },
          { id: 2, order_number: 'ORD-9822', customer_name: 'Priya Patel', total_amount: 699, status: 'processing', created_at: '2026-09-02' },
          { id: 3, order_number: 'ORD-9823', customer_name: 'Anand Verma', total_amount: 2097, status: 'pending', created_at: '2026-09-02' },
          { id: 4, order_number: 'ORD-9824', customer_name: 'Kavita Sundaram', total_amount: 599, status: 'shipped', created_at: '2026-09-02' },
        ]);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Overview</h1>
          <p className="page-subtitle">Welcome back! Here is what's happening with WINVEL store today.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/products" className="btn btn-secondary">
            <Layers size={16} />
            <span>Catalog</span>
          </Link>
          <Link to="/products" className="btn btn-primary">
            <Plus size={16} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Total Revenue</div>
            <div className="value">{stats.totalRevenue}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-success-text)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
              <TrendingUp size={14} />
              <span>+14.2% from last month</span>
            </div>
          </div>
          <div className="metric-icon" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)' }}>
            <DollarSign size={26} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Total Orders</div>
            <div className="value">{stats.totalOrders}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-secondary)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
              <ArrowUpRight size={14} />
              <span>4 pending dispatch</span>
            </div>
          </div>
          <div className="metric-icon" style={{ backgroundColor: 'var(--color-info-bg)', color: 'var(--color-secondary)' }}>
            <ShoppingBag size={26} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Active Products</div>
            <div className="value">{stats.totalProducts}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
              <span>5 Categories available</span>
            </div>
          </div>
          <div className="metric-icon" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-primary)' }}>
            <Package size={26} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Total Customers</div>
            <div className="value">{stats.totalCustomers}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-warning-text)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
              <span>+3 new accounts today</span>
            </div>
          </div>
          <div className="metric-icon" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' }}>
            <Users size={26} />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Stock Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Recent Orders Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Orders</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Latest transactions placed on the storefront</p>
            </div>
            <Link to="/orders" className="btn btn-secondary btn-sm">View All Orders</Link>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>{order.order_number}</td>
                    <td>{order.customer_name || 'Customer'}</td>
                    <td style={{ fontWeight: 600 }}>₹{order.total_amount}</td>
                    <td>
                      <span className={`badge badge-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{order.created_at?.slice(0, 10) || 'Today'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <AlertTriangle size={20} color="var(--color-warning)" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Inventory Alerts</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Lavender Tee (Size S)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>SKU: TEE-LAV-S</div>
              </div>
              <span className="badge badge-pending">25 units left</span>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Lavender Tee (Size M)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>SKU: TEE-LAV-M</div>
              </div>
              <span className="badge badge-pending">20 units left</span>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Sage Green Tee (Size S)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>SKU: TEE-GRN-S</div>
              </div>
              <span className="badge badge-pending">30 units left</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
