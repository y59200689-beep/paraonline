import crypto from 'crypto';
import { cookies } from 'next/headers';

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'fallback-super-secret-key-po-2026';

// Warn loudly in production if the secret is not explicitly set
if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_SESSION_SECRET) {
  console.error('[SECURITY] ADMIN_SESSION_SECRET is not set. Using insecure fallback — set this env var immediately!');
}

/**
 * Hash a plain-text password using SHA-256 (legacy — kept for password migration compatibility only)
 * @deprecated Use hashPasswordAsync / verifyPassword instead
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Hash a password with scrypt + a random salt.
 * Stored format: "<hex-salt>:<hex-hash>"
 * scrypt parameters (N=16384, r=8, p=1) provide ~100ms on commodity hardware.
 */
export async function hashPasswordAsync(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
}

/**
 * Verify a plain-text password against a stored hash.
 * Supports both the legacy SHA-256 format and the new scrypt format.
 * Returns true if valid, false otherwise.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (stored.includes(':')) {
    // New scrypt format: "salt:hash"
    const [salt, storedHash] = stored.split(':');
    return new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
        if (err) reject(err);
        else {
          try {
            const derivedBuf = Buffer.from(derivedKey.toString('hex'));
            const storedBuf = Buffer.from(storedHash);
            // Pad to same length for timingSafeEqual
            if (derivedBuf.length !== storedBuf.length) resolve(false);
            else resolve(crypto.timingSafeEqual(derivedBuf, storedBuf));
          } catch {
            resolve(false);
          }
        }
      });
    });
  }
  // Legacy SHA-256 format (64-char hex) — for migration path
  const legacy = hashPassword(password);
  try {
    const a = Buffer.from(legacy);
    const b = Buffer.from(stored);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Generate a base64 encoded payload signed with HMAC-SHA256
 */
export function createSessionToken(payload: object, expiryMs: number = 7 * 24 * 60 * 60 * 1000): string {
  const payloadStr = JSON.stringify({
    ...payload,
    exp: Date.now() + expiryMs
  });
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payloadStr).digest('hex');
  return Buffer.from(payloadStr).toString('base64') + '.' + signature;
}

/**
 * Verify base64 signature and decode payload
 */
export function verifySessionToken(token: string): any {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;
    
    const payloadStr = Buffer.from(payloadB64, 'base64').toString('utf8');
    const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET).update(payloadStr).digest('hex');

    // Use timing-safe comparison to prevent signature oracle attacks
    const sigBuf = Buffer.from(signature.padEnd(expectedSignature.length, '0'));
    const expBuf = Buffer.from(expectedSignature);
    const isValid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

    if (isValid && signature.length === expectedSignature.length) {
      const payload = JSON.parse(payloadStr);
      if (payload.exp && Date.now() > payload.exp) {
        return null; // Token expired
      }
      return payload;
    }
  } catch (e) {}
  return null;
}

/**
 * Extract, verify, and return user profile details from the session cookie.
 * This function automatically rotates the session token if more than half of its lifetime has elapsed.
 */
export async function verifyAdminSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (!token) return null;
    
    const payload = verifySessionToken(token);
    if (!payload) return null;

    // Check if token is near expiration and needs rotation
    // Total lifespan: 7 days (604800000 ms). We rotate if remaining time is < 3.5 days (302400000 ms).
    const remaining = payload.exp - Date.now();
    if (remaining > 0 && remaining < 3.5 * 24 * 60 * 60 * 1000) {
      const { exp, ...cleanPayload } = payload;
      const newToken = createSessionToken(cleanPayload);
      cookieStore.set('admin_session', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60,
        path: '/'
      });
    }

    return payload;
  } catch (e) {
    return null;
  }
}

/**
 * Helper to decode Base32 (used for Google Authenticator secrets)
 */
function decodeBase32(base32: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  let hex = '';

  const cleaned = base32.replace(/=+$/, '').toUpperCase();
  for (let i = 0; i < cleaned.length; i++) {
    const val = alphabet.indexOf(cleaned.charAt(i));
    if (val === -1) throw new Error('Invalid base32 character');
    bits += val.toString(2).padStart(5, '0');
  }

  for (let i = 0; i + 8 <= bits.length; i += 8) {
    const chunk = bits.substring(i, i + 8);
    hex += parseInt(chunk, 2).toString(16).padStart(2, '0');
  }

  return Buffer.from(hex, 'hex');
}

/**
 * Generate a random 16-character Base32 secret for TOTP setup
 */
export function generateMfaSecret(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  const bytes = crypto.randomBytes(10);
  for (let i = 0; i < bytes.length; i++) {
    secret += alphabet[bytes[i] % alphabet.length];
  }
  return secret;
}

/**
 * Generate a 6-digit TOTP code for a given secret and counter
 */
export function generateTOTP(secret: string, counter: number): string {
  const key = decodeBase32(secret);
  
  // Counter needs to be 8 bytes
  const buffer = Buffer.alloc(8);
  let tmp = counter;
  for (let i = 7; i >= 0; i--) {
    buffer[i] = tmp & 0xff;
    tmp = Math.floor(tmp / 256);
  }

  const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
  
  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (code % 1000000).toString().padStart(6, '0');
}

/**
 * Verify a 6-digit TOTP code against a Base32 secret (window +/- 30s)
 */
export function verifyTOTP(secret: string, token: string): boolean {
  if (!secret || !token) return false;
  const counter = Math.floor(Date.now() / 1000 / 30);
  for (let i = -1; i <= 1; i++) {
    if (generateTOTP(secret, counter + i) === token.trim()) {
      return true;
    }
  }
  return false;
}

/**
 * Generate cryptographically secure backup recovery codes formatted as XXXX-XXXX
 */
export function generateRecoveryCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${raw.substring(0, 4)}-${raw.substring(4)}`);
  }
  return codes;
}

