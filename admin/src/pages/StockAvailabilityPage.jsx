import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  Boxes,
  DollarSign,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Plus,
  Edit2,
  X,
  Check,
} from 'lucide-react';
import api from '../services/api';

export default function StockAvailabilityPage() {
  const navigate = useNavigate();

  const [availabilityData, setAvailabilityData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [stockSearch, setStockSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Quick Edit Variant Stock Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [variantStockInputs, setVariantStockInputs] = useState({});
  const [savingStock, setSavingStock] = useState(false);

  const fetchAvailabilityData = async () => {
    setLoading(true);
    try {
      const [availRes, catRes] = await Promise.all([
        api.get('/inventory/availability').catch(() => ({ data: [] })),
        api.get('/categories').catch(() => ({ data: [] })),
      ]);

      const data = availRes.data || availRes || [];
      const catList = catRes.data || catRes.categories || (Array.isArray(catRes) ? catRes : []);

      setAvailabilityData(Array.isArray(data) ? data : []);
      setCategories(Array.isArray(catList) ? catList : []);
    } catch (err) {
      console.error('Failed to fetch stock availability data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailabilityData();
  }, []);

  const handleOpenEditStock = (product) => {
    setEditingProduct(product);
    const initialInputs = {};
    if (product.variants) {
      product.variants.forEach((v) => {
        initialInputs[v.id] = v.stock_quantity;
      });
    }
    setVariantStockInputs(initialInputs);
  };

  const handleSaveVariantStock = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingStock(true);
    try {
      for (const v of editingProduct.variants) {
        const newQty = variantStockInputs[v.id];
        if (newQty !== undefined && parseInt(newQty) !== v.stock_quantity) {
          await api.put(`/inventory/variants/${v.id}/stock`, {
            stock_quantity: parseInt(newQty),
          });
        }
      }
      setEditingProduct(null);
      fetchAvailabilityData();
    } catch (err) {
      alert('Failed to update stock quantity: ' + (err.message || 'Server error'));
    } finally {
      setSavingStock(false);
    }
  };

  // Filter & Sort Logic
  const filteredAvailability = availabilityData
    .filter((prod) => {
      const q = stockSearch.toLowerCase();
      const matchesSearch =
        (prod.name || '').toLowerCase().includes(q) ||
        (prod.sku || '').toLowerCase().includes(q) ||
        (prod.category_name || '').toLowerCase().includes(q);

      const matchesCat = categoryFilter ? String(prod.category_id) === String(categoryFilter) : true;

      let matchesStatus = true;
      if (statusFilter === 'in_stock') {
        matchesStatus = prod.total_stock > 5;
      } else if (statusFilter === 'low_stock') {
        matchesStatus = prod.total_stock > 0 && prod.total_stock <= 5;
      } else if (statusFilter === 'out_of_stock') {
        matchesStatus = prod.total_stock === 0;
      }

      return matchesSearch && matchesCat && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stock_desc') return b.total_stock - a.total_stock;
      if (sortBy === 'stock_asc') return a.total_stock - b.total_stock;
      if (sortBy === 'price_desc') return b.base_price - a.base_price;
      if (sortBy === 'price_asc') return a.base_price - b.base_price;
      return 0;
    });

  const totalProductsCount = availabilityData.length;
  const totalStockUnitsAvailable = availabilityData.reduce((sum, p) => sum + (p.total_stock || 0), 0);
  const totalLowStockProducts = availabilityData.filter((p) => p.total_stock > 0 && p.total_stock <= 5).length;
  const totalOutOfStockProducts = availabilityData.filter((p) => p.total_stock === 0).length;
  const totalWarehouseStockValue = availabilityData.reduce((sum, p) => sum + (p.total_stock_value || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h1 className="page-title">Stock Availability</h1>
          <p className="page-subtitle">
            Product-wise available stock quantities, size variant breakdown, and stock valuation
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchAvailabilityData} className="btn btn-secondary" title="Refresh Stock Availability">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button onClick={() => navigate('/inventory')} className="btn btn-black">
            <Plus size={16} />
            <span>Add Inventory Receipt</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Total Products</div>
            <div className="value">{totalProductsCount} Items</div>
          </div>
          <div className="metric-icon" style={{ background: '#F5F5F4', color: '#1C1917' }}>
            <Package size={20} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Total Available Units</div>
            <div className="value">{totalStockUnitsAvailable.toLocaleString('en-IN')} units</div>
          </div>
          <div className="metric-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
            <Boxes size={20} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Low Stock Items</div>
            <div className="value" style={{ color: totalLowStockProducts > 0 ? '#D97706' : '#1C1917' }}>
              {totalLowStockProducts} Products
            </div>
          </div>
          <div className="metric-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Out of Stock</div>
            <div className="value" style={{ color: totalOutOfStockProducts > 0 ? '#DC2626' : '#1C1917' }}>
              {totalOutOfStockProducts} Products
            </div>
          </div>
          <div className="metric-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <AlertCircle size={20} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Stock Valuation</div>
            <div className="value">
              ₹{totalWarehouseStockValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="metric-icon" style={{ background: '#FAF6F0', color: '#1C1917' }}>
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* Search, Category & Status Filter Bar */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 280 }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Search product name, SKU..."
                style={{ paddingLeft: '2.2rem', width: '100%', borderRadius: '6px', fontSize: '0.83rem' }}
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
              />
            </div>

            <select
              className="form-control"
              style={{ width: 170, fontSize: '0.83rem', borderRadius: '6px' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="form-control"
              style={{ width: 160, fontSize: '0.83rem', borderRadius: '6px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort: Name (A-Z)</option>
              <option value="stock_desc">Sort: Stock High → Low</option>
              <option value="stock_asc">Sort: Stock Low → High</option>
              <option value="price_desc">Sort: Price High → Low</option>
              <option value="price_asc">Sort: Price Low → High</option>
            </select>
          </div>

          {/* Status Filter Toggle Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#F5F5F4', padding: '0.25rem', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: statusFilter === 'all' ? 700 : 500,
                borderRadius: '6px',
                border: 'none',
                background: statusFilter === 'all' ? '#FFFFFF' : 'transparent',
                color: statusFilter === 'all' ? '#1C1917' : '#78716C',
                cursor: 'pointer',
                boxShadow: statusFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              All ({availabilityData.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('in_stock')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: statusFilter === 'in_stock' ? 700 : 500,
                borderRadius: '6px',
                border: 'none',
                background: statusFilter === 'in_stock' ? '#ECFDF5' : 'transparent',
                color: statusFilter === 'in_stock' ? '#047857' : '#78716C',
                cursor: 'pointer',
              }}
            >
              In Stock ({availabilityData.filter((p) => p.total_stock > 5).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('low_stock')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: statusFilter === 'low_stock' ? 700 : 500,
                borderRadius: '6px',
                border: 'none',
                background: statusFilter === 'low_stock' ? '#FEF3C7' : 'transparent',
                color: statusFilter === 'low_stock' ? '#B45309' : '#78716C',
                cursor: 'pointer',
              }}
            >
              Low Stock ({availabilityData.filter((p) => p.total_stock > 0 && p.total_stock <= 5).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('out_of_stock')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: statusFilter === 'out_of_stock' ? 700 : 500,
                borderRadius: '6px',
                border: 'none',
                background: statusFilter === 'out_of_stock' ? '#FEE2E2' : 'transparent',
                color: statusFilter === 'out_of_stock' ? '#B91C1C' : '#78716C',
                cursor: 'pointer',
              }}
            >
              Out of Stock ({availabilityData.filter((p) => p.total_stock === 0).length})
            </button>
          </div>
        </div>
      </div>

      {/* Product Wise Stock Availability Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>PRODUCT DETAILS & SKU</th>
              <th>CATEGORY</th>
              <th>BASE PRICE</th>
              <th>TOTAL AVAILABLE STOCK</th>
              <th>VARIANT WISE BREAKDOWN (SIZES & QTY)</th>
              <th>STOCK VALUATION</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  Loading product stock availability...
                </td>
              </tr>
            ) : filteredAvailability.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  No product stock availability matching filters.
                </td>
              </tr>
            ) : (
              filteredAvailability.map((product) => {
                const isOutOfStock = product.total_stock === 0;
                const isLowStock = product.total_stock > 0 && product.total_stock <= 5;

                return (
                  <tr key={product.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '6px',
                            background: '#F5F5F4',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justify: 'center',
                            border: '1px solid var(--color-border)',
                            flexShrink: 0,
                          }}
                        >
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Package size={20} color="#9CA3AF" />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.9rem' }}>
                            {product.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                            SKU: {product.sku || `SKU-${product.id}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge" style={{ background: '#FAF6F0', border: '1px solid #E5DBCB', color: '#44403C' }}>
                        {product.category_name || 'General'}
                      </span>
                    </td>

                    <td style={{ fontWeight: 600 }}>
                      ₹{product.base_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          className={`badge ${
                            isOutOfStock ? 'badge-cancelled' : isLowStock ? 'badge-pending' : 'badge-active'
                          }`}
                          style={{
                            fontSize: '0.86rem',
                            fontWeight: 800,
                            padding: '0.35rem 0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          {isOutOfStock ? (
                            <AlertCircle size={14} />
                          ) : isLowStock ? (
                            <AlertTriangle size={14} />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          <span>{product.total_stock} Units</span>
                        </span>
                      </div>
                      {product.total_received > 0 && (
                        <div style={{ fontSize: '0.72rem', color: '#78716C', marginTop: '2px' }}>
                          Total Received: {product.total_received} units
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', maxWidth: 300 }}>
                        {product.variants && product.variants.length > 0 ? (
                          product.variants.map((v) => {
                            const vLow = v.stock_quantity > 0 && v.stock_quantity <= v.low_stock_threshold;
                            const vOut = v.stock_quantity === 0;

                            return (
                              <span
                                key={v.id}
                                style={{
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '4px',
                                  border: vOut ? '1px solid #FCA5A5' : vLow ? '1px solid #FCD34D' : '1px solid #E2E8F0',
                                  background: vOut ? '#FEF2F2' : vLow ? '#FFFBEB' : '#F8FAFC',
                                  color: vOut ? '#DC2626' : vLow ? '#D97706' : '#334155',
                                }}
                              >
                                {v.size}: <strong>{v.stock_quantity}</strong>
                              </span>
                            );
                          })
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>No size variants</span>
                        )}
                      </div>
                    </td>

                    <td style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                      ₹{product.total_stock_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditStock(product)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          title="Update Variant Quantities"
                        >
                          <Edit2 size={13} />
                          <span>Edit Stock</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/inventory')}
                          className="btn btn-black btn-sm"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          title="Add Vendor Inventory Receipt"
                        >
                          <Plus size={13} />
                          <span>Receive Stock</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* QUICK EDIT VARIANT STOCK MODAL */}
      {editingProduct && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{
              maxWidth: 580,
              width: '92vw',
              padding: '1.5rem',
            }}
          >
            <div className="modal-header" style={{ marginBottom: '1rem' }}>
              <div>
                <h2 className="modal-title" style={{ fontSize: '1.2rem' }}>
                  Update Stock Level - {editingProduct.name}
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  SKU: {editingProduct.sku || `SKU-${editingProduct.id}`} | Category: {editingProduct.category_name || 'General'}
                </p>
              </div>
              <button onClick={() => setEditingProduct(null)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveVariantStock}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.86rem', marginBottom: '0.75rem' }}>
                  Adjust Variant Stock Quantities
                </label>

                {editingProduct.variants && editingProduct.variants.length > 0 ? (
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                    <table className="data-table" style={{ fontSize: '0.85rem' }}>
                      <thead style={{ background: '#FAF6F0' }}>
                        <tr>
                          <th>SIZE / VARIANT</th>
                          <th>SKU</th>
                          <th style={{ width: 130 }}>AVAILABLE QTY</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editingProduct.variants.map((v) => (
                          <tr key={v.id}>
                            <td style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                              Size {v.size} {v.color ? `(${v.color})` : ''}
                            </td>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                              {v.sku}
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                required
                                className="form-control"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.88rem', fontWeight: 700 }}
                                value={variantStockInputs[v.id] ?? v.stock_quantity}
                                onChange={(e) =>
                                  setVariantStockInputs({
                                    ...variantStockInputs,
                                    [v.id]: e.target.value,
                                  })
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '1rem', background: '#FAF6F0', borderRadius: '6px', textAlign: 'center', fontSize: '0.85rem' }}>
                    No variants defined for this product.
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="btn btn-secondary"
                  disabled={savingStock}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-black" disabled={savingStock}>
                  {savingStock ? 'Saving...' : 'Save Stock Levels'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
