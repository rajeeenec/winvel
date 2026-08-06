import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import './AdminProductsPage.css';

const initialFormState = {
  name: '',
  slug: '',
  sku: '',
  price: '',
  comparePrice: '',
  imageUrl: '',
  description: '',
  categoryId: '',
  isActive: true,
  isFeatured: false,
};

export default function AdminProductsPage() {
  const { currencySymbol } = useSettings();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formValues, setFormValues] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load products/categories data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshProducts = async () => {
    try {
      const data = await api.get('/products');
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  const handleInputChange = (field, value) => {
    setFormValues((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-generate slug when name changes for new products
      if (field === 'name' && !currentProduct) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const handleAddProduct = () => {
    setCurrentProduct(null);
    setFormValues(initialFormState);
    setError('');
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setFormValues({
      name: product.name || '',
      slug: product.slug || '',
      sku: product.sku || '',
      price: product.price || '',
      comparePrice: product.compare_price || '',
      imageUrl: product.image_url || '',
      description: product.description || '',
      categoryId: product.category_id || '',
      isActive: product.is_active === 1 || product.is_active === true,
      isFeatured: product.is_featured === 1 || product.is_featured === true,
    });
    setError('');
    setShowModal(true);
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to deactivate "${product.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/products/${product.id}`);
      await refreshProducts();
    } catch (err) {
      alert(`Deactivation failed: ${err.message}`);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name: formValues.name,
      slug: formValues.slug,
      sku: formValues.sku,
      price: parseFloat(formValues.price),
      comparePrice: formValues.comparePrice ? parseFloat(formValues.comparePrice) : null,
      imageUrl: formValues.imageUrl || null,
      description: formValues.description,
      categoryId: parseInt(formValues.categoryId),
      isActive: formValues.isActive,
      isFeatured: formValues.isFeatured,
    };

    try {
      if (currentProduct) {
        await api.put(`/products/${currentProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      await refreshProducts();
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <button className="btn btn-primary" onClick={handleAddProduct}>
          Add Product
        </button>
      </div>

      <div className="card card-flush">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="font-medium">{product.name}</td>
                <td>{product.sku}</td>
                <td>{product.category_name || '-'}</td>
                <td>
                  {currencySymbol}
                  {product.price}
                </td>
                <td>
                  <span className={`badge ${product.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{product.is_featured ? 'Yes' : 'No'}</td>
                <td>
                  <div className="products-actions-cell">
                    <button
                      className="btn-icon edit-btn"
                      onClick={() => handleEditProduct(product)}
                      title="Edit Product"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon delete-btn"
                      onClick={() => handleDeleteProduct(product)}
                      title="Delete Product"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">{currentProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="modal-body">
                {error && <div className="settings-message error">{error}</div>}

                <div className="form-group">
                  <label htmlFor="name">Product Name *</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formValues.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g. Mountain Sunset Tee"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="slug">Slug *</label>
                    <input
                      type="text"
                      id="slug"
                      required
                      value={formValues.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="e.g. mountain-sunset-tee"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sku">SKU *</label>
                    <input
                      type="text"
                      id="sku"
                      required
                      value={formValues.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      placeholder="e.g. MTN-001"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">Price *</label>
                    <input
                      type="number"
                      id="price"
                      required
                      step="0.01"
                      min="0"
                      value={formValues.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="comparePrice">Compare Price</label>
                    <input
                      type="number"
                      id="comparePrice"
                      step="0.01"
                      min="0"
                      value={formValues.comparePrice}
                      onChange={(e) => handleInputChange('comparePrice', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="categoryId">Category *</label>
                    <select
                      id="categoryId"
                      required
                      value={formValues.categoryId}
                      onChange={(e) => handleInputChange('categoryId', e.target.value)}
                    >
                      <option value="">Select a category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="imageUrl">Image URL</label>
                    <input
                      type="text"
                      id="imageUrl"
                      value={formValues.imageUrl}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      placeholder="e.g. /images/products/mountain-sunset.jpg"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    rows="3"
                    value={formValues.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Tell us about the fabric, fit, design, etc..."
                  />
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formValues.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    />
                    <span>Active (visible in store)</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formValues.isFeatured}
                      onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                    />
                    <span>Featured Product (highlight on home page)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
