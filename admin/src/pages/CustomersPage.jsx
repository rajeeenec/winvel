import { useState, useEffect } from 'react';
import { Search, Users, Shield } from 'lucide-react';
import api from '../services/api';

export default function CustomersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users')
      .then((data) => {
        const userList = data.data || data.users || (Array.isArray(data) ? data : []);
        setUsers(userList);
      })
      .catch(() => {
        // Fallback sample users
        setUsers([
          { id: 1, first_name: 'Admin', last_name: 'User', email: 'admin@winvel.com', role: 'Admin', status: 'active', created_at: '2026-09-01' },
          { id: 2, first_name: 'Rahul', last_name: 'Sharma', email: 'rahul@gmail.com', role: 'Customer', status: 'active', created_at: '2026-09-01' },
          { id: 3, first_name: 'Priya', last_name: 'Patel', email: 'priya@gmail.com', role: 'Customer', status: 'active', created_at: '2026-09-02' },
          { id: 4, first_name: 'Anand', last_name: 'Verma', email: 'anand@gmail.com', role: 'Customer', status: 'active', created_at: '2026-09-02' },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers Directory</h1>
          <p className="page-subtitle">View and manage registered customer accounts and admin users</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by customer name or email..."
              style={{ paddingLeft: '2.5rem', width: '100%' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Registered Users: <strong>{filteredUsers.length}</strong>
          </span>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Account Role</th>
              <th>Status</th>
              <th>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Loading customer accounts...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No customer records found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.first_name} {u.last_name || ''}</td>
                  <td style={{ color: 'var(--accent-primary)' }}>{u.email}</td>
                  <td>
                    <span className={`badge badge-${u.role === 'Admin' ? 'shipped' : 'active'}`}>
                      {u.role || 'Customer'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${u.status === 'active' ? 'active' : 'inactive'}`}>
                      {u.status || 'active'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
