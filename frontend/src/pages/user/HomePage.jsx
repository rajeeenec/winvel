import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import './HomePage.css';

export default function HomePage() {
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggleWishlist, isInWishlist } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Load products from DB
  useEffect(() => {
    api.get('/products')
      .then((data) => {
        setDbProducts(data);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Static definition of products to enrich details (color swatches, badges, default display)
  const productMeta = {
    1: {
      tag: 'NEW',
      tagType: 'new',
      colors: [
        { name: 'Black', hex: '#000000' },
        { name: 'Navy', hex: '#1d2a44' },
        { name: 'Olive', hex: '#3b4d3c' }
      ]
    },
    2: {
      tag: 'NEW',
      tagType: 'new',
      colors: [
        { name: 'Sage Green', hex: '#879883' },
        { name: 'Beige', hex: '#d2b48c' },
        { name: 'Charcoal', hex: '#333333' }
      ]
    },
    3: {
      tag: 'NEW',
      tagType: 'new',
      colors: [
        { name: 'White', hex: '#ffffff', border: '#e0e0e0' },
        { name: 'Black', hex: '#000000' },
        { name: 'Gray', hex: '#888888' }
      ]
    },
    4: {
      tag: '-20%',
      tagType: 'discount',
      colors: [
        { name: 'Lavender', hex: '#c8a2c8' },
        { name: 'Pink', hex: '#ffc0cb' },
        { name: 'White', hex: '#ffffff', border: '#e0e0e0' }
      ]
    },
    5: {
      tag: 'NEW',
      tagType: 'new',
      colors: [
        { name: 'Sand Beige', hex: '#e1c699' },
        { name: 'Black', hex: '#000000' },
        { name: 'Olive', hex: '#3b4d3c' }
      ]
    },
    6: {
      tag: 'NEW',
      tagType: 'new',
      colors: [
        { name: 'Deep Teal', hex: '#005a5b' },
        { name: 'Navy', hex: '#1d2a44' },
        { name: 'Black', hex: '#000000' }
      ]
    }
  };

  // Fallback products in case DB is not yet initialized or fails
  const fallbackProducts = [
    { id: 1, name: 'Classic Black Tee', price: 699.00, compare_price: 899.00, image_url: '/images/products/product_black.png' },
    { id: 2, name: 'Sage Green Tee', price: 699.00, compare_price: null, image_url: '/images/products/product_green.png' },
    { id: 3, name: 'Essential White Tee', price: 599.00, compare_price: null, image_url: '/images/products/product_white.png' },
    { id: 4, name: 'Lavender Tee', price: 599.00, compare_price: 749.00, image_url: '/images/products/product_lavender.png' },
    { id: 5, name: 'Sand Beige Tee', price: 699.00, compare_price: null, image_url: '/images/products/product_beige.png' },
    { id: 6, name: 'Deep Teal Tee', price: 699.00, compare_price: 899.00, image_url: '/images/products/product_teal.png' }
  ];

  const displayedProducts = dbProducts.length > 0
    ? dbProducts.slice(0, 6)
    : fallbackProducts;

  // Hero Slides
  const heroSlides = [
    {
      title: 'BASIC FIT. PREMIUM FEEL.',
      subtitle: 'Premium quality t-shirts for your everyday comfort and style.',
      badge: 'NEW COLLECTION',
      image: '/images/hero_slide_1.png',
      menLink: '/shop?category=1',
      womenLink: '/shop?category=2'
    },
    {
      title: 'MINIMAL DESIGNS. MAXIMUM COMFORT.',
      subtitle: 'Elevate your daily wardrobe with our high-density plain tees.',
      badge: 'SUMMER BASICS',
      image: '/images/category_basics.png',
      menLink: '/shop?category=4',
      womenLink: '/shop?category=4'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="home-page-container">
      {/* HERO SECTION */}
      <section className="hero-slider">
        <div className="hero-slide-wrapper">
          <div className="hero-slide-content">
            <div className="hero-text-side">
              <span className="hero-pill-badge">{heroSlides[currentSlide].badge}</span>
              <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: heroSlides[currentSlide].title.replace('. ', '.<br />') }}></h1>
              <p className="hero-description">{heroSlides[currentSlide].subtitle}</p>
              <div className="hero-actions">
                <Link to={heroSlides[currentSlide].menLink} className="hero-btn btn-dark">SHOP MEN</Link>
                <Link to={heroSlides[currentSlide].womenLink} className="hero-btn btn-outline-dark">SHOP WOMEN</Link>
              </div>
            </div>
            <div className="hero-image-side">
              <img src={heroSlides[currentSlide].image} alt="Winvel Collection" className="hero-image" />
              {/* Premium Stamp Badge Overlay */}
              <div className="premium-stamp-container">
                <svg viewBox="0 0 100 100" width="120" height="120" className="premium-stamp">
                  <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                  <text className="stamp-text">
                    <textPath href="#circlePath">
                      PREMIUM QUALITY • WINVEL • ESTD. 2024 •
                    </textPath>
                  </text>
                </svg>
                <div className="stamp-center">WINVEL</div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Controls */}
        <button className="slider-arrow arrow-left" onClick={prevSlide} aria-label="Previous Slide">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <button className="slider-arrow arrow-right" onClick={nextSlide} aria-label="Next Slide">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>

        {/* Slide Dots Indicator */}
        <div className="slider-dots">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              className={`slider-dot ${currentSlide === idx ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* CORE FEATURES STRIP */}
      <section className="features-strip">
        <div className="container features-grid-container">
          <div className="feature-item">
            <span className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            </span>
            <div className="feature-text">
              <h4 className="feature-title-text">FREE SHIPPING</h4>
              <p className="feature-desc-text">On orders above ₹999</p>
            </div>
          </div>
          <div className="feature-divider" />
          <div className="feature-item">
            <span className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
            </span>
            <div className="feature-text">
              <h4 className="feature-title-text">PREMIUM QUALITY</h4>
              <p className="feature-desc-text">Best fabrics & comfort</p>
            </div>
          </div>
          <div className="feature-divider" />
          <div className="feature-item">
            <span className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
            </span>
            <div className="feature-text">
              <h4 className="feature-title-text">EASY RETURNS</h4>
              <p className="feature-desc-text">Hassle free returns</p>
            </div>
          </div>
          <div className="feature-divider" />
          <div className="feature-item">
            <span className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
            </span>
            <div className="feature-text">
              <h4 className="feature-title-text">24/7 SUPPORT</h4>
              <p className="feature-desc-text">We're here to help</p>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="category-section section-padding">
        <div className="container">
          <div className="section-header-center">
            <h2 className="section-main-title">SHOP BY CATEGORY</h2>
            <div className="title-underline" />
          </div>

          <div className="category-grid">
            {/* Category: Men */}
            <div className="category-card">
              <img src="/images/category_men.png" alt="Men Category" className="category-img" />
              <div className="category-overlay">
                <h3 className="category-title">MEN</h3>
                <Link to="/shop?category=1" className="category-btn">SHOP NOW</Link>
              </div>
            </div>

            {/* Category: Women */}
            <div className="category-card">
              <img src="/images/category_women.png" alt="Women Category" className="category-img" />
              <div className="category-overlay">
                <h3 className="category-title">WOMEN</h3>
                <Link to="/shop?category=2" className="category-btn">SHOP NOW</Link>
              </div>
            </div>

            {/* Category: Oversized */}
            <div className="category-card">
              <img src="/images/category_oversized.png" alt="Oversized Category" className="category-img" />
              <div className="category-overlay">
                <h3 className="category-title">OVERSIZED</h3>
                <Link to="/shop?category=3" className="category-btn">SHOP NOW</Link>
              </div>
            </div>

            {/* Category: Basics */}
            <div className="category-card">
              <img src="/images/category_basics.png" alt="Basics Category" className="category-img" />
              <div className="category-overlay">
                <h3 className="category-title">BASICS</h3>
                <Link to="/shop?category=4" className="category-btn">SHOP NOW</Link>
              </div>
            </div>

            {/* Category: New Arrivals */}
            <div className="category-card">
              <img src="/images/category_new.png" alt="New Arrivals Category" className="category-img" />
              <div className="category-overlay">
                <h3 className="category-title">NEW ARRIVALS</h3>
                <Link to="/shop?category=5" className="category-btn">SHOP NOW</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="new-arrivals-section section-padding">
        <div className="container">
          <div className="new-arrivals-header">
            <div className="section-header-left">
              <h2 className="section-main-title">NEW ARRIVALS</h2>
              <div className="title-underline left-aligned" />
            </div>
            <Link to="/shop" className="view-all-link">
              VIEW ALL <span className="arrow">→</span>
            </Link>
          </div>

          <div className="products-grid">
            {displayedProducts.map((product) => {
              const meta = productMeta[product.id] || { tag: 'NEW', tagType: 'new', colors: [] };
              const isWishlisted = isInWishlist(product.id);

              return (
                <div key={product.id} className="product-item-card">
                  {/* Card Media Top */}
                  <div className="product-media-container">
                    {/* Tags */}
                    {meta.tag && (
                      <span className={`product-badge ${meta.tagType}`}>
                        {meta.tag}
                      </span>
                    )}

                    {/* Wishlist button */}
                    <button
                      className={`wishlist-toggle-btn ${isWishlisted ? 'active' : ''}`}
                      onClick={() => toggleWishlist(product)}
                      aria-label="Add to Wishlist"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>

                    {/* Image Link */}
                    <Link to={`/product/${product.id}`} className="product-img-link">
                      <img src={product.image_url} alt={product.name} className="product-card-image" />
                    </Link>

                    {/* Quick Add Overlay */}
                    <Link to={`/product/${product.id}`} className="quick-shop-overlay-btn">
                      QUICK SHOP
                    </Link>
                  </div>

                  {/* Card Details Bottom */}
                  <div className="product-card-details">
                    <h3 className="product-card-name">
                      <Link to={`/product/${product.id}`}>{product.name}</Link>
                    </h3>
                    <div className="product-card-pricing">
                      <span className="current-price">₹{Math.round(product.price)}</span>
                      {product.compare_price && (
                        <span className="compare-at-price">₹{Math.round(product.compare_price)}</span>
                      )}
                    </div>

                    {/* Color Swatch Indicators */}
                    {meta.colors && meta.colors.length > 0 && (
                      <div className="color-swatches">
                        {meta.colors.map((color, colorIdx) => (
                          <button
                            key={colorIdx}
                            className="swatch-btn"
                            style={{
                              backgroundColor: color.hex,
                              border: color.border ? `1px solid ${color.border}` : 'none'
                            }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SUMMER SALE FULL-WIDTH BANNER */}
      <section className="summer-sale-banner">
        <div className="banner-grid-container">
          <div className="banner-text-content">
            <span className="banner-small-tag">WINVEL SUMMER SALE</span>
            <h2 className="banner-promo-heading">UP TO 40% OFF</h2>
            <p className="banner-promo-desc">On selected styles only for a limited time!</p>
            <Link to="/shop?sale=true" className="banner-cta-btn">SHOP THE SALE</Link>
          </div>
          <div className="banner-image-content">
            <img src="/images/sale_banner_models.png" alt="Summer Sale" className="banner-img" />
          </div>
        </div>
      </section>

      {/* WHY CHOOSE WINVEL */}
      <section className="why-choose-section section-padding">
        <div className="container">
          <div className="section-header-center">
            <h2 className="section-main-title">WHY CHOOSE WINVEL?</h2>
            <div className="title-underline" />
          </div>

          <div className="reasons-grid">
            <div className="reason-card">
              <span className="reason-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </span>
              <h3 className="reason-title">PREMIUM FABRIC</h3>
              <p className="reason-desc">High quality cotton for all day comfort</p>
            </div>

            <div className="reason-card">
              <span className="reason-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </span>
              <h3 className="reason-title">DURABLE & LONG LASTING</h3>
              <p className="reason-desc">Built to last with premium stitching</p>
            </div>

            <div className="reason-card">
              <span className="reason-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </span>
              <h3 className="reason-title">COMFORTABLE FIT</h3>
              <p className="reason-desc">Designed for a relaxed and perfect fit</p>
            </div>

            <div className="reason-card">
              <span className="reason-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </span>
              <h3 className="reason-title">MADE FOR YOU</h3>
              <p className="reason-desc">Minimal designs for your everyday vibe</p>
            </div>
          </div>
        </div>
      </section>

      {/* INSTAGRAM SOCIAL FEED */}
      <section className="instagram-feed-section section-padding-bottom">
        <div className="container">
          <div className="section-header-center">
            <h2 className="section-main-title">FOLLOW US @WINVEL.OFFICIAL</h2>
            <div className="title-underline" />
          </div>

          <div className="instagram-grid">
            <div className="instagram-post">
              <img src="/images/products/product_black.png" alt="Winvel Outfit" className="insta-img" />
              <div className="insta-hover-overlay">
                <span className="insta-icon">✕</span>
              </div>
            </div>
            <div className="instagram-post">
              <img src="/images/category_men.png" alt="Winvel Outfit" className="insta-img" />
              <div className="insta-hover-overlay">
                <span className="insta-icon">✕</span>
              </div>
            </div>
            <div className="instagram-post">
              <img src="/images/category_basics.png" alt="Winvel Folded Tees" className="insta-img" />
              <div className="insta-hover-overlay">
                <span className="insta-icon">✕</span>
              </div>
            </div>
            <div className="instagram-post">
              <img src="/images/category_new.png" alt="Winvel Streetwear" className="insta-img" />
              <div className="insta-hover-overlay">
                <span className="insta-icon">✕</span>
              </div>
            </div>
            <div className="instagram-post">
              <img src="/images/category_women.png" alt="Winvel Apparel" className="insta-img" />
              <div className="insta-hover-overlay">
                <span className="insta-icon">✕</span>
              </div>
            </div>
            <div className="instagram-post">
              <img src="/images/products/product_beige.png" alt="Winvel Casual" className="insta-img" />
              <div className="insta-hover-overlay">
                <span className="insta-icon">✕</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JOIN THE CLUB NEWSLETTER */}
      <section className="newsletter-banner-section">
        <div className="container newsletter-box">
          <div className="newsletter-left">
            <span className="mail-icon-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </span>
            <div className="newsletter-text">
              <h3 className="newsletter-heading">JOIN THE WINVEL CLUB</h3>
              <p className="newsletter-tagline">Get exclusive offers, new arrivals and style updates.</p>
            </div>
          </div>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" required className="newsletter-input" />
            <button type="submit" className="newsletter-submit-btn">SUBSCRIBE</button>
          </form>
        </div>
      </section>
    </div>
  );
}
