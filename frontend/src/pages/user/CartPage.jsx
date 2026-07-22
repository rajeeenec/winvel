export default function CartPage() {
  return (
    <div className="container">
      <h1 className="page-title">Shopping Cart</h1>
      <div className="card card-center">
        <p className="text-muted" style={{ marginBottom: '1rem' }}>
          Your cart is empty.
        </p>
        <a href="/shop" className="btn btn-primary">Continue Shopping</a>
      </div>
    </div>
  );
}
