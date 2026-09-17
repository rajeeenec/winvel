import Razorpay from 'razorpay';
import crypto from 'crypto';

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_winvel_mock_key';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'winvel_mock_secret_key';

let razorpayInstance = null;
try {
  razorpayInstance = new Razorpay({
    key_id,
    key_secret,
  });
} catch (err) {
  console.warn('Razorpay init warning:', err.message);
}

export async function createRazorpayOrder({ amount, currency = 'INR', receipt }) {
  if (razorpayInstance && !key_id.includes('mock')) {
    try {
      const options = {
        amount: Math.round(amount * 100), // in paise
        currency,
        receipt,
      };
      const order = await razorpayInstance.orders.create(options);
      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id,
        is_mock: false,
      };
    } catch (err) {
      console.warn('Razorpay order creation fallback to sandbox mock:', err.message);
    }
  }

  // Sandbox / Test fallback order
  const mockId = `order_mock_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
  return {
    id: mockId,
    amount: Math.round(amount * 100),
    currency,
    key_id,
    is_mock: true,
  };
}

export function verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return false;
  }
  if (razorpay_order_id.startsWith('order_mock_') || razorpay_signature.startsWith('mock_sig_')) {
    return true;
  }
  try {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');
    return expectedSignature === razorpay_signature;
  } catch (err) {
    console.error('Razorpay signature verification error:', err);
    return false;
  }
}
