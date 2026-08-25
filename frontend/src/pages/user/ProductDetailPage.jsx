import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useCart } from '../../context/CartContext';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { currencySymbol } = useSettings();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((data) => {
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert('Please select a size/color variant.');
      return;
    }
    addToCart(product, selectedVariant, 1);
    alert(`${product.name} (${selectedVariant.size} - ${selectedVariant.color}) added to cart!`);
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

          {product.variants?.length > 0 && (
            <div className="product-detail-variants">
              <h3>Available Sizes / Colors</h3>
              <div className="variant-list">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={`btn btn-sm variant-tag-btn ${selectedVariant?.id === v.id ? 'active' : ''}`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    {v.size} - {v.color} ({v.stock_quantity} left)
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
    </div>
  );
}
