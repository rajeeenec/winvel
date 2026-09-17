import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import './CartPage.css';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState('cart'); // 'cart' | 'checkout'
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'razorpay'
  const [placingOrder, setPlacingOrder] = useState(false);
  const [mockRazorpayOrder, setMockRazorpayOrder] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Read saved addresses from localStorage
  const savedAddresses = (() => {
    try {
      const saved = localStorage.getItem('winvel_addresses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();

  const [shippingAddress, setShippingAddress] = useState({
    full_name: user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Rajkumar S',
    phone: user?.phone || '9876543210',
    address_line1: savedAddresses[0]?.street || 'Flat 402, Sunshine Apartments, MG Road',
    address_line2: 'Near Central Bank',
    city: savedAddresses[0]?.city || 'Chennai',
    state: savedAddresses[0]?.state || 'Tamil Nadu',
    postal_code: savedAddresses[0]?.pincode || '600001',
    country: 'India',
  });

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 999;
  const shippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const total = subtotal + shippingCost;

  const handleSelectSavedAddress = (addr) => {
    setShippingAddress({
      full_name: addr.name || shippingAddress.full_name,
      phone: addr.phone || shippingAddress.phone,
      address_line1: addr.street || '',
      address_line2: '',
      city: addr.city || 'Chennai',
      state: addr.state || 'Tamil Nadu',
      postal_code: addr.pincode || '600001',
      country: 'India',
    });
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      toast.warning('Account Login Required', 'Please log in to your account to place an order.');
      navigate('/login?redirect=/cart');
      return;
    }
    setStep('checkout');
  };

  const handlePlaceOrder = async (e) => {
    e?.preventDefault();
    if (
      !shippingAddress.full_name.trim() ||
      !shippingAddress.phone.trim() ||
      !shippingAddress.address_line1.trim() ||
      !shippingAddress.city.trim() ||
      !shippingAddress.postal_code.trim()
    ) {
      toast.warning('Incomplete Address', 'Please fill in all required delivery address fields (Name, Phone, Address, City, Pincode).');
      return;
    }

    setPlacingOrder(true);
    try {
      const formattedItems = cart.map((item) => ({
        product_id: item.product.id,
        variant_id: item.variant?.id,
        product_name: item.product.name,
        size: item.variant?.size,
        color: item.variant?.color,
        quantity: item.quantity,
        unit_price: item.product.price,
        image_url: item.product.image_url,
      }));

      const orderData = await api.post('/orders', {
        items: formattedItems,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
      });

      if (paymentMethod === 'cod') {
        clearCart();
        toast.success('Order Placed Successfully!', `Order Number: ${orderData.order_number}`);
        navigate('/account?tab=orders');
      } else if (paymentMethod === 'razorpay') {
        const loaded = await loadRazorpayScript();

        if (orderData.is_mock || !loaded || !window.Razorpay) {
          // Open mock Razorpay test modal
          setMockRazorpayOrder(orderData);
        } else {
          try {
            const options = {
              key: orderData.razorpay_key_id,
              amount: orderData.total_amount * 100,
              currency: 'INR',
              name: 'WINVEL',
              description: `Order ${orderData.order_number}`,
              order_id: orderData.razorpay_order_id,
              handler: async (response) => {
                await verifyRazorpayPayment({
                  order_id: orderData.order_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  order_number: orderData.order_number,
                });
              },
              prefill: {
                name: shippingAddress.full_name,
                contact: shippingAddress.phone,
                email: user?.email || '',
              },
              theme: {
                color: '#000000',
              },
            };
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
              toast.error('Payment Failed', response.error.description);
            });
            rzp.open();
          } catch {
            setMockRazorpayOrder(orderData);
          }
        }
      }
    } catch (err) {
      toast.error('Order Placement Failed', err.message || 'Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const verifyRazorpayPayment = async ({ order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, order_number }) => {
    try {
      await api.post('/orders/verify-payment', {
        order_id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
      clearCart();
      toast.success('Payment Successful!', `Order #${order_number} has been placed.`);
      setMockRazorpayOrder(null);
      navigate('/account?tab=orders');
    } catch (err) {
      toast.error('Payment Verification Failed', err.message);
    }
  };

  const handleSimulateMockPayment = () => {
    if (!mockRazorpayOrder) return;
    verifyRazorpayPayment({
      order_id: mockRazorpayOrder.order_id,
      razorpay_order_id: mockRazorpayOrder.razorpay_order_id,
      razorpay_payment_id: `pay_mock_${Date.now()}`,
      razorpay_signature: 'mock_sig_verified_123',
      order_number: mockRazorpayOrder.order_number,
    });
  };

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>
          {step === 'checkout' ? 'Complete Your Order' : 'Shopping Cart'}
        </h1>
        {step === 'checkout' && (
          <button
            type="button"
            className="btn btn-outline-sm"
            onClick={() => setStep('cart')}
            style={{ padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            ← Back to Cart Items
          </button>
        )}
      </div>

      <div className="cart-grid">
        {/* Left Side: Cart Items or Checkout Address & Payment Form */}
        {step === 'cart' ? (
          <div className="cart-items-list">
            {cart.map((item) => (
              <div key={`${item.product.id}-${item.variant.id}-${item.fitting || 'default'}`} className="cart-item-card">
                <div className="cart-item-image">
                  <img src={item.product.image_url} alt={item.product.name} />
                </div>
                <div className="cart-item-details">
                  <h3 className="cart-item-name">
                    <Link to={`/product/${item.product.id}`}>{item.product.name}</Link>
                  </h3>
                  <p className="cart-item-variant">
                    {item.fitting && (
                      <>Fit: <strong>{item.fitting} Fit</strong> | </>
                    )}
                    Size: <strong>{item.variant.size}</strong>{item.variant.color ? <> | Color: <strong>{item.variant.color}</strong></> : ''}
                  </p>
                  <div className="cart-item-price">₹{Math.round(item.product.price)}</div>
                </div>
                <div className="cart-item-quantity">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => updateQuantity(item.product.id, item.variant.id, item.quantity - 1, item.fitting)}
                  >
                    -
                  </button>
                  <span className="qty-val">{item.quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => updateQuantity(item.product.id, item.variant.id, item.quantity + 1, item.fitting)}
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
                  onClick={() => removeFromCart(item.product.id, item.variant.id, item.fitting)}
                  title="Remove Item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {/* Step 1: Delivery Address */}
            <div className="checkout-section-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div className="checkout-section-title" style={{ margin: 0 }}>
                  📍 1. DELIVERY ADDRESS
                </div>
                <button
                  type="button"
                  className="btn btn-black"
                  onClick={() => setShowAddressModal(true)}
                  style={{ fontSize: '0.8rem', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  + Add / Edit Address
                </button>
              </div>

              {/* Display selected shipping address in a card */}
              {shippingAddress.full_name && shippingAddress.address_line1 ? (
                <div className="card" style={{ padding: '16px', background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111' }}>{shippingAddress.full_name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '4px' }}>📞 {shippingAddress.phone}</div>
                      <div style={{ fontSize: '0.85rem', color: '#444', marginTop: '6px', lineHeight: 1.4 }}>
                        {shippingAddress.address_line1}{shippingAddress.address_line2 ? `, ${shippingAddress.address_line2}` : ''}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#444' }}>
                        {shippingAddress.city}, {shippingAddress.state} - <strong>{shippingAddress.postal_code}</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(true)}
                      style={{ background: 'none', border: 'none', color: '#000', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', background: '#fafafa', border: '1px dashed #ccc', borderRadius: '8px' }}>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.88rem' }}>No delivery address added yet.</p>
                  <button
                    type="button"
                    className="btn btn-black"
                    onClick={() => setShowAddressModal(true)}
                    style={{ marginTop: '10px', fontSize: '0.8rem' }}
                  >
                    + Add New Address
                  </button>
                </div>
              )}

              {/* Saved Addresses Quick Selection */}
              {savedAddresses.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Select from Saved Addresses:
                  </div>
                  <div className="saved-addresses-pills">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`address-pill ${shippingAddress.address_line1 === addr.street ? 'active' : ''}`}
                        onClick={() => handleSelectSavedAddress(addr)}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{addr.name || 'Saved Address'} ({addr.type})</div>
                        <div style={{ fontSize: '0.78rem', color: '#555', marginTop: '0.2rem' }}>{addr.street}, {addr.city}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>Pincode: {addr.pincode}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Payment Option */}
            <div className="checkout-section-card">
              <div className="checkout-section-title">
                💳 2. SELECT PAYMENT OPTION
              </div>

              <div className="payment-methods-grid">
                <div
                  className={`payment-method-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="payment-method-left">
                    <input
                      type="radio"
                      name="payment_option"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <span className="payment-icon">💵</span>
                    <div>
                      <div className="payment-title">Cash on Delivery (COD)</div>
                      <div className="payment-desc">Pay in cash when your parcel is delivered to your doorstep</div>
                    </div>
                  </div>
                  {paymentMethod === 'cod' && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#008800' }}>✓ Selected</span>
                  )}
                </div>

                <div
                  className={`payment-method-card ${paymentMethod === 'razorpay' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('razorpay')}
                >
                  <div className="payment-method-left">
                    <input
                      type="radio"
                      name="payment_option"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                    />
                    <span className="payment-icon">⚡</span>
                    <div>
                      <div className="payment-title">Razorpay Online Payment (Instant)</div>
                      <div className="payment-desc">UPI (Google Pay, PhonePe, Paytm), Credit/Debit Card, Netbanking</div>
                    </div>
                  </div>
                  {paymentMethod === 'razorpay' && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#008800' }}>✓ Selected</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Order Summary & Action */}
        <div className="cart-summary">
          <div className="summary-card">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-row">
              <span>Items ({cart.reduce((a, c) => a + c.quantity, 0)})</span>
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
              <span>Total Payable</span>
              <span>₹{Math.round(total)}</span>
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                className="btn btn-primary btn-block checkout-btn"
                onClick={handleProceedToCheckout}
              >
                PROCEED TO CHECKOUT →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-block checkout-btn"
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                style={{ opacity: placingOrder ? 0.7 : 1 }}
              >
                {placingOrder
                  ? 'PROCESSING ORDER...'
                  : paymentMethod === 'razorpay'
                  ? 'PAY NOW WITH RAZORPAY →'
                  : 'CONFIRM & PLACE ORDER (COD) →'}
              </button>
            )}

            <Link to="/shop" className="continue-link">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Address Entry / Edit Modal Popup */}
      {showAddressModal && (
        <div className="rzp-modal-overlay">
          <div className="rzp-modal-card" style={{ maxWidth: '560px', textAlign: 'left', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Delivery Address Details</h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '4px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setShowAddressModal(false); }}>
              <div className="address-form-grid">
                <div className="address-form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    className="address-input"
                    value={shippingAddress.full_name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, full_name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="address-form-group">
                  <label>Phone Number *</label>
                  <input
                    type="text"
                    className="address-input"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>

                <div className="address-form-group full-width">
                  <label>Street Address / Door No. *</label>
                  <input
                    type="text"
                    className="address-input"
                    value={shippingAddress.address_line1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address_line1: e.target.value })}
                    placeholder="Flat No, House / Street Name, Area"
                    required
                  />
                </div>

                <div className="address-form-group full-width">
                  <label>Landmark (Optional)</label>
                  <input
                    type="text"
                    className="address-input"
                    value={shippingAddress.address_line2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address_line2: e.target.value })}
                    placeholder="Near temple, school, landmark"
                  />
                </div>

                <div className="address-form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    className="address-input"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    placeholder="e.g. Chennai, Madurai"
                    required
                  />
                </div>

                <div className="address-form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    className="address-input"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    placeholder="e.g. Tamil Nadu"
                    required
                  />
                </div>

                <div className="address-form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    className="address-input"
                    value={shippingAddress.postal_code}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                    placeholder="6-digit postal code"
                    required
                  />
                </div>

                <div className="address-form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    className="address-input"
                    value={shippingAddress.country}
                    disabled
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  style={{ padding: '8px 16px', background: '#f0f0f0', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-black"
                  style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mock Razorpay Payment Modal for Testing */}
      {mockRazorpayOrder && (
        <div className="rzp-modal-overlay">
          <div className="rzp-modal-card">
            <div className="rzp-header-badge">RAZORPAY TEST GATEWAY</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '8px 0', color: '#111' }}>
              Razorpay Secure Checkout
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '16px' }}>
              Order ID: <strong>{mockRazorpayOrder.razorpay_order_id}</strong>
            </p>
            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.9rem', color: '#444' }}>Payable Amount</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0c2340', margin: '4px 0' }}>
                ₹{mockRazorpayOrder.total_amount}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>
                Simulating UPI / Card Payment Verification
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="btn"
                onClick={handleSimulateMockPayment}
                style={{ background: '#008800', color: '#fff', padding: '12px', fontWeight: 700, borderRadius: '6px', cursor: 'pointer' }}
              >
                ✓ SIMULATE SUCCESSFUL PAYMENT
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setMockRazorpayOrder(null)}
                style={{ background: '#e0e0e0', color: '#333', padding: '10px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
