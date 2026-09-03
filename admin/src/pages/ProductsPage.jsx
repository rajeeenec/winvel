import { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, CheckCircle, XCircle, Package } from 'lucide-react';
import api from '../services/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_description: '',
    description: '',
    brand: 'WINVEL',
    base_price: '',
    status: 'active',
    featured: false,
    is_new: true,
  });

  const fetchProducts = () => {
    setLoading(true);
    api.get('/products')
      .then((data) => {
        const productList = data.data || data.products || (Array.isArray(data) ? data : []);
        setProducts(productList);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      short_description: '',
      description: '',
      brand: 'WINVEL',
      base_price: '',
      status: 'active',
      featured: false,
      is_new: true,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      short_description: product.short_description || '',
      description: product.description || '',
      brand: product.brand || 'WINVEL',
      base_price: product.base_price || '',
      status: product.status || 'active',
      featured: product.featured || false,
      is_new: product.is_new || false,
    });
    setShowAddModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setShowAddModal(false);
      fetchProducts();
    } catch (err) {
      alert('Error saving product: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Error deleting product: ' + err.message);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.slug && p.slug.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products Management</h1>
          <p className="page-subtitle">View, edit, and manage all clothing items in your store</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ marginBottom: '1rem', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Showing <strong>{filteredProducts.length}</strong> catalog items
          </span>
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              style={{ paddingLeft: '2.2rem', width: '100%', fontSize: '0.83rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Brand</th>
              <th>Base Price</th>
              <th>Status</th>
              <th>Flags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Loading products catalog...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No products found. Click "Add New Product" to create one.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{p.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.slug}</div>
                  </td>
                  <td>{p.brand || 'WINVEL'}</td>
                  <td style={{ fontWeight: 600 }}>₹{p.base_price}</td>
                  <td>
                    <span className={`badge badge-${p.status || 'active'}`}>
                      {p.status || 'active'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {p.featured && <span className="badge badge-shipped">Featured</span>}
                      {p.is_new && <span className="badge badge-active">New</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="btn btn-secondary btn-sm"
                        title="Edit product"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowAddModal(false)} className="modal-close">
                <XCircle size={22} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    setFormData({ ...formData, name, slug: editingProduct ? formData.slug : slug });
                  }}
                  placeholder="e.g. Vintage Oversized Tee"
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL Slug</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. vintage-oversized-tee"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Base Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="form-control"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    placeholder="699.00"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Short Description</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Premium combed cotton t-shirt"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Description</label>
                <textarea
                  rows="3"
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed product information..."
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span>Featured Product</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_new}
                    onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                  />
                  <span>Mark as New Arrival</span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
