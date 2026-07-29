import crypto from 'crypto';

const MIN_SECRET_LENGTH = 32;

function requiredSecret(name: 'ORDER_VERIFICATION_SECRET' | 'ORDER_TRACKING_SECRET') {
  const value = process.env[name];
  if (!value || value.length < MIN_SECRET_LENGTH) {
    throw new Error(`${name} must be configured with at least ${MIN_SECRET_LENGTH} characters.`);
  }
  return value;
}

function signedOrderToken(orderId: string, purpose: 'confirm' | 'track') {
  const secret = requiredSecret(
    purpose === 'confirm' ? 'ORDER_VERIFICATION_SECRET' : 'ORDER_TRACKING_SECRET'
  );
  return crypto.createHmac('sha256', secret).update(`${purpose}:${orderId}`).digest('hex');
}

export function createOrderVerificationToken(orderId: string) {
  return `${orderId}.${signedOrderToken(orderId, 'confirm')}`;
}

export function createOrderTrackingToken(orderId: string) {
  return `${orderId}.${signedOrderToken(orderId, 'track')}`;
}

export function verifyOrderToken(orderId: string, token: string, purpose: 'confirm' | 'track') {
  const expected = signedOrderToken(orderId, purpose);
  const provided = Buffer.from(token, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return provided.length === expectedBuffer.length && crypto.timingSafeEqual(provided, expectedBuffer);
}
