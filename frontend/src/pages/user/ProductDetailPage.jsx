import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { currencySymbol } = useSettings();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (!product) return <div className="container"><p>Product not found.</p></div>;

  return (
    <div className="container">
      <div className="grid grid-2 product-detail">
        <div className="card product-detail-image">
          {product.name[0]}
        </div>
        <div>
          <p className="product-detail-category">{product.category_name}</p>
          <h1 className="product-detail-title">{product.name}</h1>
          <div className="product-detail-price-row">
            <span className="product-detail-price">
              {currencySymbol}{product.price}
            </span>
            {product.compare_price && (
              <span className="text-strike">{currencySymbol}{product.compare_price}</span>
            )}
          </div>
          <p className="product-detail-desc">{product.description}</p>

          {product.variants?.length > 0 && (
            <div className="product-detail-variants">
              <h3>Available Sizes</h3>
              <div className="variant-list">
                {product.variants.map((v) => (
                  <span key={v.id} className="btn btn-outline btn-sm variant-tag">
                    {v.size} - {v.color} ({v.stock_quantity} left)
                  </span>
                ))}
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-block">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}
