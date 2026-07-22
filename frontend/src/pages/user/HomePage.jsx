import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import './HomePage.css';

export default function HomePage() {
  const { tagline, get, currencySymbol } = useSettings();
  const freeShippingMin = get('store', 'free_shipping_threshold', 50);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-content">
          <h1>{tagline}<br />for Every Style</h1>
          <p>Discover our collection of high-quality graphic tees, plain classics, and limited edition designs.</p>
          <Link to="/shop" className="btn btn-primary btn-lg">Shop Now</Link>
        </div>
      </section>

      <section className="container features">
        <div className="grid grid-3">
          <div className="feature-card">
            <h3>Premium Quality</h3>
            <p>100% cotton, durable prints that last wash after wash.</p>
          </div>
          <div className="feature-card">
            <h3>Free Shipping</h3>
            <p>Free delivery on orders over {currencySymbol}{freeShippingMin}. Fast & reliable.</p>
          </div>
          <div className="feature-card">
            <h3>Easy Returns</h3>
            <p>30-day hassle-free return policy on all orders.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
