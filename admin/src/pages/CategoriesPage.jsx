import { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, Layers, XCircle } from 'lucide-react';
import api from '../services/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sort_order: 0,
    status: true,
  });

  const fetchCategories = () => {
    setLoading(true);
    api.get('/categories')
      .then((data) => {
        const catList = data.data || data.categories || (Array.isArray(data) ? data : []);
        setCategories(catList);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      sort_order: categories.length + 1,
      status: true,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      sort_order: cat.sort_order || 0,
      status: cat.status !== undefined ? Boolean(cat.status) : true,
    });
    setShowAddModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      setShowAddModal(false);
      fetchCategories();
    } catch (err) {
      alert('Error saving category: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert('Error deleting category: ' + err.message);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories Management</h1>
          <p className="page-subtitle">Organize products into navigation categories and taxonomy</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ marginBottom: '1rem', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Showing <strong>{filteredCategories.length}</strong> categories
          </span>
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search categories..."
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
              <th>Category Name</th>
              <th>Slug</th>
              <th>Sort Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Loading categories...
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No categories found. Click "Add New Category" to create one.
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{cat.id}</td>
                  <td style={{ fontWeight: 600 }}>{cat.name}</td>
                  <td style={{ color: 'var(--accent-primary)', fontSize: '0.85rem' }}>{cat.slug}</td>
                  <td>{cat.sort_order}</td>
                  <td>
                    <span className={`badge badge-${cat.status ? 'active' : 'inactive'}`}>
                      {cat.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="btn btn-secondary btn-sm"
                        title="Edit category"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete category"
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

      {/* Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button onClick={() => setShowAddModal(false)} className="modal-close">
                <XCircle size={22} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    setFormData({ ...formData, name, slug: editingCategory ? formData.slug : slug });
                  }}
                  placeholder="e.g. Oversized"
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
                  placeholder="e.g. oversized"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sort Order</label>
                <input
                  type="number"
                  required
                  className="form-control"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows="2"
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description for category..."
                ></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
