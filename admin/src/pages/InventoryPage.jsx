import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Boxes, Calendar, DollarSign, Eye, X, Check, Trash2, AlertCircle, Building2, Package, Tag, ArrowRight } from 'lucide-react';
import api from '../services/api';

function SearchableProductSelect({ products, value, onChange, autoFocusRef }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedProduct = products.find((p) => p.id === parseInt(value));

  useEffect(() => {
    if (selectedProduct) {
      setSearchTerm(`${selectedProduct.name} (${selectedProduct.sku || `SKU-${selectedProduct.id}`})`);
    } else if (!value) {
      setSearchTerm('');
    }
  }, [value, selectedProduct]);

  const filtered = products.filter((p) => {
    const query = searchTerm.toLowerCase();
    const name = (p.name || '').toLowerCase();
    const sku = (p.sku || `SKU-${p.id}`).toLowerCase();
    return name.includes(query) || sku.includes(query);
  });

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        ref={autoFocusRef}
        type="text"
        className="form-control"
        style={{ padding: '0.45rem 0.6rem', fontSize: '0.83rem', width: '100%', fontWeight: selectedProduct ? 600 : 400 }}
        placeholder="Type name or SKU..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      />
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1200,
            maxHeight: 220,
            overflowY: 'auto',
            background: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
            marginTop: '3px',
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '0.65rem 0.75rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              No products matching "{searchTerm}"
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                onMouseDown={() => {
                  onChange(p.id);
                  setSearchTerm(`${p.name} (${p.sku || `SKU-${p.id}`})`);
                  setIsOpen(false);
                }}
                style={{
                  padding: '0.55rem 0.75rem',
                  borderBottom: '1px solid #F5F5F4',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  background: parseInt(value) === p.id ? '#FAF6F0' : 'transparent',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#1C1917' }}>{p.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#78716C', fontFamily: 'monospace' }}>
                    SKU: {p.sku || `SKU-${p.id}`}
                  </div>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#44403C' }}>
                  ₹{p.base_price}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  const [batches, setBatches] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Refs for auto-focusing new rows
  const rowInputRefs = useRef([]);

  // Form State for Add Inventory
  const [formData, setFormData] = useState({
    vendorId: '',
    receivedDate: new Date().toISOString().split('T')[0],
    notes: '',
    items: [],
  });

  // Drawer State for Batch Details
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [batchesRes, vendorsRes, productsRes] = await Promise.all([
        api.get('/inventory').catch(() => ({ data: [] })),
        api.get('/vendors').catch(() => ({ data: [] })),
        api.get('/products').catch(() => ({ data: [] })),
      ]);

      const batchList = batchesRes.data || batchesRes || [];
      const vendorList = vendorsRes.data || vendorsRes || [];
      const productList = productsRes.data || productsRes.products || (Array.isArray(productsRes) ? productsRes : []);

      setBatches(Array.isArray(batchList) ? batchList : []);
      setVendors(Array.isArray(vendorList) ? vendorList : []);
      setProducts(Array.isArray(productList) ? productList : []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const generateRandomBatchNo = () => {
    return `BATCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleOpenAddModal = () => {
    setErrorMsg('');
    const defaultBatchNo = generateRandomBatchNo();
    const firstProd = products[0];

    setFormData({
      vendorId: vendors[0]?.id || '',
      receivedDate: new Date().toISOString().split('T')[0],
      notes: '',
      items: [
        {
          productId: firstProd?.id || '',
          sku: firstProd?.sku || '',
          batchNo: defaultBatchNo,
          quantity: 10,
          unitCost: firstProd?.base_price ? (firstProd.base_price * 0.6).toFixed(2) : 350,
        },
      ],
    });
    setShowAddModal(true);
  };

  const handleAddItemRowAndFocus = () => {
    const firstProd = products[0];
    const newBatchNo = generateRandomBatchNo();

    setFormData((prev) => {
      const nextItems = [
        ...prev.items,
        {
          productId: firstProd?.id || '',
          sku: firstProd?.sku || '',
          batchNo: newBatchNo,
          quantity: 10,
          unitCost: firstProd?.base_price ? (firstProd.base_price * 0.6).toFixed(2) : '',
        },
      ];
      return { ...prev, items: nextItems };
    });

    setTimeout(() => {
      const lastIndex = formData.items.length;
      if (rowInputRefs.current[lastIndex]) {
        rowInputRefs.current[lastIndex].focus();
      }
    }, 60);
  };

  const handleRemoveItemRow = (index) => {
    if (formData.items.length <= 1) return;
    const updated = formData.items.filter((_, idx) => idx !== index);
    setFormData({ ...formData, items: updated });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;

    if (field === 'productId') {
      const prod = products.find((p) => p.id === parseInt(value));
      if (prod) {
        updated[index].sku = prod.sku || `SKU-${prod.id}`;
        if (!updated[index].unitCost) {
          updated[index].unitCost = (prod.base_price * 0.6).toFixed(2);
        }
      }
    }

    setFormData({ ...formData, items: updated });
  };

  const handleSaveBatch = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.vendorId) {
      setErrorMsg('Please select a vendor for this inventory batch');
      return;
    }

    if (formData.items.length === 0) {
      setErrorMsg('At least one product line item is required');
      return;
    }

    for (let i = 0; i < formData.items.length; i++) {
      const it = formData.items[i];
      if (!it.productId) {
        setErrorMsg(`Row #${i + 1}: Please select a product`);
        return;
      }
      if (!it.batchNo || !it.batchNo.trim()) {
        setErrorMsg(`Row #${i + 1}: Batch No / Lot Code is required`);
        return;
      }
      if (!it.quantity || parseInt(it.quantity) <= 0) {
        setErrorMsg(`Row #${i + 1}: Quantity must be greater than 0`);
        return;
      }
      if (it.unitCost === '' || parseFloat(it.unitCost) < 0) {
        setErrorMsg(`Row #${i + 1}: Please enter a unit cost price`);
        return;
      }
    }

    try {
      await api.post('/inventory', {
        vendorId: parseInt(formData.vendorId),
        batchNumber: `REC-${Date.now().toString().slice(-6)}`,
        receivedDate: formData.receivedDate,
        notes: formData.notes,
        items: formData.items.map((it) => ({
          productId: parseInt(it.productId),
          sku: it.sku,
          batchNo: it.batchNo,
          quantity: parseInt(it.quantity),
          unitCost: parseFloat(it.unitCost),
        })),
      });

      setShowAddModal(false);
      fetchInitialData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save inventory batch');
    }
  };

  const handleViewBatchDetails = async (batchId) => {
    setDrawerLoading(true);
    setSelectedBatch(null);
    try {
      const res = await api.get(`/inventory/${batchId}`);
      const detail = res.data || res;
      setSelectedBatch(detail);
    } catch {
      alert('Failed to load batch details');
    } finally {
      setDrawerLoading(false);
    }
  };

  // Calculations
  const filteredBatches = batches.filter((b) => {
    const batchNo = (b.batch_number || '').toLowerCase();
    const vendor = (b.vendor_name || '').toLowerCase();
    const query = search.toLowerCase();
    return batchNo.includes(query) || vendor.includes(query);
  });

  const totalBatchesCount = batches.length;
  const totalUnitsReceived = batches.reduce((sum, b) => sum + (b.total_items || 0), 0);
  const totalInvestmentAmount = batches.reduce((sum, b) => sum + (b.total_amount || 0), 0);

  const batchFormTotalQty = formData.items.reduce((sum, it) => sum + (parseInt(it.quantity) || 0), 0);
  const batchFormTotalVal = formData.items.reduce((sum, it) => sum + ((parseInt(it.quantity) || 0) * (parseFloat(it.unitCost) || 0)), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory & Stock Batches</h1>
          <p className="page-subtitle">Track incoming vendor shipments, batch items, costs, and warehouse stock receipts</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-black">
          <Plus size={16} />
          <span>Add Inventory</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Total Stock Batches</div>
            <div className="value">{totalBatchesCount}</div>
          </div>
          <div className="metric-icon">
            <Boxes size={20} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Total Stock Received</div>
            <div className="value">{totalUnitsReceived.toLocaleString('en-IN')} units</div>
          </div>
          <div className="metric-icon">
            <Package size={20} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="label">Inventory Investment</div>
            <div className="value">₹{totalInvestmentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="metric-icon">
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: '1rem', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Showing <strong>{filteredBatches.length}</strong> stock inventory batches
          </span>
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by receipt, vendor..."
              style={{ paddingLeft: '2.2rem', width: '100%', borderRadius: '6px', fontSize: '0.83rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>RECEIPT NO</th>
              <th>VENDOR / SUPPLIER</th>
              <th>RECEIVED DATE & TIME</th>
              <th>BATCHES & TOTAL UNITS</th>
              <th>BATCH AMOUNT</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  Loading inventory batches...
                </td>
              </tr>
            ) : filteredBatches.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  No inventory batches recorded. Click "Add Inventory" to enter a new stock receipt.
                </td>
              </tr>
            ) : (
              filteredBatches.map((batch) => (
                <tr key={batch.id} style={{ cursor: 'pointer' }} onClick={() => handleViewBatchDetails(batch.id)}>
                  <td style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                    <span className="badge badge-shipped" style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem' }}>
                      #{batch.batch_number}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                      <Building2 size={15} color="var(--color-text-muted)" />
                      <span>{batch.vendor_name || 'Direct Procurement'}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.83rem' }}>
                    {batch.created_at ? (
                      <>
                        <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                          {new Date(batch.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#78716C' }}>
                          {new Date(batch.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </div>
                      </>
                    ) : batch.received_date ? (
                      new Date(batch.received_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                      {batch.batch_count || 1} Batch{(batch.batch_count || 1) === 1 ? '' : 'es'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {batch.total_items} units
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                    ₹{batch.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span className="badge badge-active" style={{ textTransform: 'capitalize' }}>
                      {batch.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewBatchDetails(batch.id);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Eye size={14} />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Inventory Batch Modal (Expanded Width & Height) */}
      {showAddModal && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{
              maxWidth: 1040,
              width: '94vw',
              height: '86vh',
              maxHeight: 760,
              display: 'flex',
              flexDirection: 'column',
              padding: '1.75rem',
            }}
          >
            <div className="modal-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h2 className="modal-title" style={{ fontSize: '1.25rem' }}>Add Inventory Stock Receipt</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Search product, enter batch details, and press <strong>Enter</strong> in the Unit Cost field to quickly add next row
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                {errorMsg && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '1rem', border: '1px solid #FCA5A5' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Top Vendor & Receipt Date */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>Select Vendor / Supplier</label>
                    <select
                      required
                      className="form-control"
                      style={{ fontSize: '0.88rem', padding: '0.55rem 0.75rem' }}
                      value={formData.vendorId}
                      onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                    >
                      <option value="">-- Choose Vendor --</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>Received Date</label>
                    <input
                      type="date"
                      required
                      className="form-control"
                      style={{ fontSize: '0.88rem', padding: '0.55rem 0.75rem' }}
                      value={formData.receivedDate}
                      onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Line Items Entry Table */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <label className="form-label" style={{ marginBottom: 0, fontWeight: 700, fontSize: '0.9rem' }}>
                      Received Line Items & Batch Numbers ({formData.items.length})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItemRowAndFocus}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', fontWeight: 600 }}
                    >
                      <Plus size={15} />
                      <span>+ Add Row Item (or press Enter in Cost)</span>
                    </button>
                  </div>

                  <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'visible' }}>
                    <table className="data-table" style={{ fontSize: '0.83rem', width: '100%' }}>
                      <thead style={{ background: '#FAF6F0' }}>
                        <tr>
                          <th style={{ width: '32%', padding: '0.75rem' }}>PRODUCT (SEARCH NAME / SKU)</th>
                          <th style={{ width: '24%', padding: '0.75rem' }}>BATCH NO / LOT CODE</th>
                          <th style={{ width: '14%', padding: '0.75rem' }}>QUANTITY</th>
                          <th style={{ width: '15%', padding: '0.75rem' }}>UNIT COST (₹)</th>
                          <th style={{ width: '11%', padding: '0.75rem' }}>SUBTOTAL</th>
                          <th style={{ width: '4%', padding: '0.75rem', textAlign: 'center' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((rowItem, idx) => {
                          const subtotal = (parseInt(rowItem.quantity) || 0) * (parseFloat(rowItem.unitCost) || 0);
                          return (
                            <tr key={idx}>
                              <td style={{ padding: '0.6rem 0.75rem' }}>
                                <SearchableProductSelect
                                  autoFocusRef={(el) => (rowInputRefs.current[idx] = el)}
                                  products={products}
                                  value={rowItem.productId}
                                  onChange={(prodId) => handleItemChange(idx, 'productId', prodId)}
                                />
                              </td>
                              <td style={{ padding: '0.6rem 0.75rem' }}>
                                <input
                                  type="text"
                                  required
                                  className="form-control"
                                  style={{ padding: '0.45rem 0.6rem', fontSize: '0.83rem', fontFamily: 'monospace', fontWeight: 600, width: '100%' }}
                                  value={rowItem.batchNo}
                                  onChange={(e) => handleItemChange(idx, 'batchNo', e.target.value.toUpperCase())}
                                  placeholder="e.g. BATCH-2026-001"
                                />
                              </td>
                              <td style={{ padding: '0.6rem 0.75rem' }}>
                                <input
                                  type="number"
                                  min="1"
                                  required
                                  className="form-control"
                                  style={{ padding: '0.45rem 0.6rem', fontSize: '0.83rem', width: '100%' }}
                                  value={rowItem.quantity}
                                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                />
                              </td>
                              <td style={{ padding: '0.6rem 0.75rem' }}>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  required
                                  className="form-control"
                                  style={{ padding: '0.45rem 0.6rem', fontSize: '0.83rem', width: '100%' }}
                                  value={rowItem.unitCost}
                                  onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddItemRowAndFocus();
                                    }
                                  }}
                                  placeholder="Cost price (Enter = Add Row)"
                                />
                              </td>
                              <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: 'var(--color-text)', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td style={{ padding: '0.6rem 0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItemRow(idx)}
                                  disabled={formData.items.length <= 1}
                                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: formData.items.length <= 1 ? 'not-allowed' : 'pointer', opacity: formData.items.length <= 1 ? 0.3 : 1, padding: '0.2rem' }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary Banner */}
                <div style={{ background: '#FAF6F0', border: '1px solid var(--color-border)', padding: '0.85rem 1.25rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                  <span>Total Items Received: <strong>{batchFormTotalQty} units</strong></span>
                  <span>Total Batch Value: <strong style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>₹{batchFormTotalVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary" style={{ padding: '0.55rem 1.25rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-black" style={{ padding: '0.55rem 1.25rem' }}>
                  <Check size={16} />
                  <span>Save Inventory Batch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Side Drawer (Slide-Over Panel) for Full Batch Details */}
      {(selectedBatch || drawerLoading) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'stretch',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(3px)',
            transition: 'all 0.3s ease',
          }}
          onClick={() => setSelectedBatch(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 720,
              height: '100%',
              marginLeft: 'auto',
              marginRight: 0,
              background: '#FAF8F5',
              boxShadow: '-8px 0 36px rgba(0,0,0,0.22)',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.75rem',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {drawerLoading ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                Loading batch details...
              </div>
            ) : selectedBatch && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <span className="badge badge-shipped" style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      #{selectedBatch.batch_number}
                    </span>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', marginTop: '0.2rem' }}>
                      Batch Receipt Details
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedBatch(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '0.25rem' }}
                  >
                    <X size={22} />
                  </button>
                </div>

                {/* Vendor Overview Card */}
                <div style={{ background: '#FAF6F0', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '0.6rem' }}>
                    Vendor & Receipt Information
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E5DBCB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      <Building2 size={18} color="#1A1918" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                        {selectedBatch.vendor_name || 'Direct Procurement'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                        Contact: {selectedBatch.vendor_contact || 'N/A'} ({selectedBatch.vendor_phone || 'N/A'})
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                        Email: {selectedBatch.vendor_email || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingTop: '0.6rem', borderTop: '1px border-dashed var(--color-border)', fontSize: '0.83rem' }}>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)' }}>Received Date & Time:</span>{' '}
                      <strong>
                        {selectedBatch.created_at
                          ? `${new Date(selectedBatch.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, ${new Date(selectedBatch.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`
                          : new Date(selectedBatch.received_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)' }}>GSTIN / Tax ID:</span>{' '}
                      <strong>{selectedBatch.vendor_gstin || 'N/A'}</strong>
                    </div>
                  </div>
                </div>

                {/* Line Items Breakdown Table */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '0.6rem' }}>
                    Itemized Product Breakdown ({selectedBatch.items ? selectedBatch.items.length : 0})
                  </div>

                  <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', background: '#FFFFFF' }}>
                    <table className="data-table" style={{ fontSize: '0.82rem' }}>
                      <thead style={{ background: '#FAF6F0' }}>
                        <tr>
                          <th>PRODUCT & SKU</th>
                          <th>BATCH NO</th>
                          <th>QTY</th>
                          <th>COST (₹)</th>
                          <th>TOTAL (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBatch.items && selectedBatch.items.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{item.product_name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                                SKU: {item.sku || 'N/A'}
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-shipped" style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.75rem' }}>
                                {item.batch_no || 'N/A'}
                              </span>
                            </td>
                            <td style={{ fontWeight: 600 }}>{item.quantity}</td>
                            <td>₹{item.unit_cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                              ₹{item.total_cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Batch Investment Financial Summary */}
                <div style={{ marginTop: 'auto', background: '#1A1918', color: '#FFFFFF', padding: '1.15rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A8A29E', marginBottom: '0.5rem' }}>
                    Batch Summary
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.86rem' }}>
                    <span style={{ color: '#D6D3D1' }}>Total Stock Units Received:</span>
                    <strong style={{ color: '#FFFFFF' }}>{selectedBatch.total_items} units</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, paddingTop: '0.5rem', borderTop: '1px solid #292524' }}>
                    <span>Total Batch Investment:</span>
                    <span style={{ color: '#F59E0B' }}>₹{selectedBatch.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
