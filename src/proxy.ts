import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'fallback-super-secret-key-po-2026';

async function verifySessionToken(token: string): Promise<any> {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;
    
    // Decode base64 to string safely (supported in Edge/Node Runtime)
    const payloadStr = atob(payloadB64);
    
    // Compute HMAC SHA-256 signature using Web Crypto API
    const encoder = new TextEncoder();
    const secretBytes = encoder.encode(SESSION_SECRET);
    const payloadBytes = encoder.encode(payloadStr);
    
    const key = await crypto.subtle.importKey(
      'raw',
      secretBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      payloadBytes
    );
    
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = signatureArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
      
    if (signature === expectedSignature) {
      const payload = JSON.parse(payloadStr);
      if (payload.exp && Date.now() > payload.exp) {
        return null; // Expired
      }
      return payload;
    }
  } catch (e) {
    console.error('Proxy token verification error:', e);
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // We only intercept paths starting with /admin
  // but we do NOT intercept /admin/login
  if (path.startsWith('/admin') && path !== '/admin/login') {
    const sessionCookie = request.cookies.get('admin_session')?.value;
    
    if (!sessionCookie) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', path);
      return NextResponse.redirect(loginUrl);
    }
    
    const payload = await verifySessionToken(sessionCookie);
    
    if (!payload) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', path);
      
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('admin_session');
      return response;
    }
  }
  
  // If user accesses /admin/login but is already authenticated, redirect to /admin
  if (path === '/admin/login') {
    const sessionCookie = request.cookies.get('admin_session')?.value;
    if (sessionCookie) {
      const payload = await verifySessionToken(sessionCookie);
      if (payload) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
  }

  return NextResponse.next();
}

// Match all routes starting with /admin
export const config = {
  matcher: ['/admin/:path*'],
};
