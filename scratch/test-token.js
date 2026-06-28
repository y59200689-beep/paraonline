const crypto = require('crypto');

const SESSION_SECRET = 'fallback-super-secret-key-po-2026';

function createSessionToken(payload, expiryMs = 7 * 24 * 60 * 60 * 1000) {
  const payloadStr = JSON.stringify({
    ...payload,
    exp: Date.now() + expiryMs
  });
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payloadStr).digest('hex');
  return Buffer.from(payloadStr).toString('base64') + '.' + signature;
}

// Logic from proxy.ts
async function verifySessionTokenProxy(token) {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return { success: false, reason: 'Split failed' };
    
    const payloadStr = atob(payloadB64);
    
    const encoder = new TextEncoder();
    const secretBytes = encoder.encode(SESSION_SECRET);
    const payloadBytes = encoder.encode(payloadStr);
    
    const key = await crypto.webcrypto.subtle.importKey(
      'raw',
      secretBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.webcrypto.subtle.sign(
      'HMAC',
      key,
      payloadBytes
    );
    
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = signatureArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
      
    if (signature === expectedSignature) {
      return { success: true, payload: JSON.parse(payloadStr) };
    } else {
      return { success: false, reason: 'Signature mismatch', signature, expectedSignature };
    }
  } catch (e) {
    return { success: false, reason: 'Error: ' + e.message };
  }
}

async function run() {
  const payload = { id: "1", username: "admin", role: "owner", name: "Youssef Mahir" };
  const token = createSessionToken(payload);
  console.log("Token:", token);
  const result = await verifySessionTokenProxy(token);
  console.log("Verification result:", result);
}

run();
