import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import './ShopPage.css';

export default function ShopPage() {
  const { currencySymbol } = useSettings();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products'),
      api.get('/categories'),
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = selectedCategory
    ? products.filter((p) => p.category_id === parseInt(selectedCategory))
    : products;

  if (loading) return <div className="container"><p>Loading products...</p></div>;

  return (
    <div className="container shop-page">
      <h1 className="page-title">Shop T-Shirts</h1>

      <div className="shop-filters">
        <button
          className={`filter-btn ${!selectedCategory ? 'active' : ''}`}
          onClick={() => setSelectedCategory('')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`filter-btn ${selectedCategory === String(cat.id) ? 'active' : ''}`}
            onClick={() => setSelectedCategory(String(cat.id))}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {filtered.map((product) => (
          <Link to={`/product/${product.id}`} key={product.id} className="product-card">
            <div className="product-image">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} />
              ) : (
                <div className="product-placeholder">{product.name[0]}</div>
              )}
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-category">{product.category_name}</p>
              <div className="product-price">
                <span className="price">{currencySymbol}{product.price}</span>
                {product.compare_price && (
                  <span className="compare-price">{currencySymbol}{product.compare_price}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="empty-state">No products found in this category.</p>
      )}
    </div>
  );
}
