import Razorpay from 'razorpay';
import crypto from 'crypto';

function getCredentials() {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TcxvGlUcvaMJCQ';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || '4AkN1BRj2hEl9dlkEwgCYMNw';
  return { key_id, key_secret };
}

export function getRazorpayInstance() {
  const { key_id, key_secret } = getCredentials();
  return new Razorpay({
    key_id,
    key_secret,
  });
}

export async function createRazorpayOrder({ amount, currency = 'INR', receipt }) {
  const { key_id } = getCredentials();
  const amountInPaise = Math.round(Number(amount) * 100);

  if (amountInPaise < 100) {
    throw new Error('Minimum order amount for Razorpay is ₹1 (100 paise)');
  }

  const razorpay = getRazorpayInstance();
  try {
    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id,
      is_mock: false,
    };
  } catch (err) {
    console.error('Razorpay SDK Order Creation Failed:', err);
    throw new Error(err.description || err.message || 'Razorpay order creation failed');
  }
}

export function verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return false;
  }

  const { key_secret } = getCredentials();

  try {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body)
      .digest('hex');

    return expectedSignature === razorpay_signature;
  } catch (err) {
    console.error('Razorpay signature verification error:', err);
    return false;
  }
}
