import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currencySymbol } = useSettings();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [selectedFit, setSelectedFit] = useState('Regular');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((data) => {
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
        if (data.fitting_options && data.fitting_options.length > 0) {
          setSelectedFit(data.fitting_options[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const hasFitOptions = product && product.has_fitting !== false && Array.isArray(product.fitting_options) && product.fitting_options.length > 0;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.warning('Select Size & Color', 'Please select a size or variant option.');
      return;
    }
    const fitChoice = hasFitOptions ? selectedFit : null;
    const fitDesc = fitChoice ? `${fitChoice} Fit` : '';
    const variantDesc = [selectedVariant.size, selectedVariant.color].filter(Boolean).join(' - ');
    const desc = [fitDesc, variantDesc].filter(Boolean).join(' | ');

    addToCart(product, selectedVariant, 1, fitChoice);
    toast.cart(product.name, desc, () => navigate('/cart'), product.image_url);
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (!product) return <div className="container"><p>Product not found.</p></div>;

  return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <div className="grid grid-2 product-detail">
        <div className="product-detail-image-card">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="product-detail-img" />
          ) : (
            <div className="product-placeholder">{product.name[0]}</div>
          )}
        </div>
        <div className="product-detail-info">
          <p className="product-detail-category">{product.category_name || 'T-Shirts'}</p>
          <h1 className="product-detail-title">{product.name}</h1>
          <div className="product-detail-price-row">
            <span className="product-detail-price">
              ₹{Math.round(product.price)}
            </span>
            {product.compare_price && (
              <span className="text-strike">₹{Math.round(product.compare_price)}</span>
            )}
          </div>
          <p className="product-detail-desc">{product.description}</p>

          {/* Fitting Selection (Category Based) */}
          {hasFitOptions && (
            <div className="product-detail-variants" style={{ marginBottom: '1.25rem' }}>
              <div className="variant-header-row">
                <h3>Fitting Option</h3>
              </div>
              <div className="variant-list">
                {product.fitting_options.map((fit) => (
                  <button
                    key={fit}
                    type="button"
                    className={`btn btn-sm variant-tag-btn ${selectedFit === fit ? 'active' : ''}`}
                    onClick={() => setSelectedFit(fit)}
                  >
                    {fit} Fit
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.variants?.length > 0 && (
            <div className="product-detail-variants">
              <div className="variant-header-row">
                <h3>Available Sizes</h3>
                <button
                  type="button"
                  className="size-chart-btn"
                  onClick={() => setShowSizeChart(true)}
                >
                  📐 Size Chart
                </button>
              </div>
              <div className="variant-list">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={`btn btn-sm variant-tag-btn ${selectedVariant?.id === v.id ? 'active' : ''}`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    {[v.size, v.color].filter(Boolean).join(' - ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-block add-to-cart-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className="size-chart-modal-overlay" onClick={() => setShowSizeChart(false)}>
          <div className="size-chart-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="size-chart-modal-header">
              <h2>Size Guide</h2>
              <button
                type="button"
                className="size-chart-modal-close"
                onClick={() => setShowSizeChart(false)}
              >
                ✕
              </button>
            </div>

            {product.size_chart_url ? (
              <div className="size-chart-image-wrap">
                <img
                  src={product.size_chart_url}
                  alt={`${product.name} Size Chart`}
                  className="size-chart-img"
                />
              </div>
            ) : null}

            <div style={{ marginTop: product.size_chart_url ? '1.5rem' : '0' }}>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                Standard Clothing Measurements (in Inches):
              </p>
              <table className="size-chart-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest (in)</th>
                    <th>Length (in)</th>
                    <th>Shoulder (in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>XS</strong></td>
                    <td>36"</td>
                    <td>26"</td>
                    <td>16.5"</td>
                  </tr>
                  <tr>
                    <td><strong>S</strong></td>
                    <td>38"</td>
                    <td>27"</td>
                    <td>17.5"</td>
                  </tr>
                  <tr>
                    <td><strong>M</strong></td>
                    <td>40"</td>
                    <td>28"</td>
                    <td>18.5"</td>
                  </tr>
                  <tr>
                    <td><strong>L</strong></td>
                    <td>42"</td>
                    <td>29"</td>
                    <td>19.5"</td>
                  </tr>
                  <tr>
                    <td><strong>XL</strong></td>
                    <td>44"</td>
                    <td>30"</td>
                    <td>20.5"</td>
                  </tr>
                  <tr>
                    <td><strong>XXL</strong></td>
                    <td>46"</td>
                    <td>31"</td>
                    <td>21.5"</td>
                  </tr>
                  <tr>
                    <td><strong>3XL</strong></td>
                    <td>48"</td>
                    <td>32"</td>
                    <td>22.5"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
