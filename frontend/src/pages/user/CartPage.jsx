import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CartPage.css';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleCheckout = () => {
    alert('Thank you for your order! Your mock purchase is successful.');
    clearCart();
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 999;
  const shippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const total = subtotal + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="container cart-page-empty">
        <h1 className="page-title">Shopping Cart</h1>
        <div className="empty-cart-card">
          <span className="empty-cart-icon">🛒</span>
          <h2>Your cart is empty</h2>
          <p className="text-muted">Looks like you haven't added any products to your cart yet.</p>
          <Link to="/shop" className="btn btn-primary shop-now-btn">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1 className="page-title">Shopping Cart</h1>

      <div className="cart-grid">
        {/* Left Side: Items List */}
        <div className="cart-items-list">
          {cart.map((item) => (
            <div key={`${item.product.id}-${item.variant.id}`} className="cart-item-card">
              <div className="cart-item-image">
                <img src={item.product.image_url} alt={item.product.name} />
              </div>
              <div className="cart-item-details">
                <h3 className="cart-item-name">
                  <Link to={`/product/${item.product.id}`}>{item.product.name}</Link>
                </h3>
                <p className="cart-item-variant">
                  Size: <strong>{item.variant.size}</strong> | Color: <strong>{item.variant.color}</strong>
                </p>
                <div className="cart-item-price">₹{Math.round(item.product.price)}</div>
              </div>
              <div className="cart-item-quantity">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => updateQuantity(item.product.id, item.variant.id, item.quantity - 1)}
                >
                  -
                </button>
                <span className="qty-val">{item.quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => updateQuantity(item.product.id, item.variant.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <div className="cart-item-subtotal">
                ₹{Math.round(item.product.price * item.quantity)}
              </div>
              <button
                type="button"
                className="cart-item-remove-btn"
                onClick={() => removeFromCart(item.product.id, item.variant.id)}
                title="Remove Item"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Right Side: Order Summary */}
        <div className="cart-summary">
          <div className="summary-card">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{Math.round(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
            </div>
            {shippingCost > 0 && (
              <div className="shipping-notice">
                Add <strong>₹{freeShippingThreshold - subtotal}</strong> more for FREE shipping!
              </div>
            )}
            <hr />
            <div className="summary-row total-row">
              <span>Total</span>
              <span>₹{Math.round(total)}</span>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-block checkout-btn"
              onClick={handleCheckout}
            >
              PROCEED TO CHECKOUT
            </button>
            <Link to="/shop" className="continue-link">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
