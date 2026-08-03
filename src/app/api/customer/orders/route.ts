import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyOrderToken } from '@/lib/order-security';

const ORDER_COLUMNS = 'order_id, city, items, subtotal, discount_amount, applied_coupon, gift_item, total, status, carrier, tracking_number, estimated_delivery, created_at';

function noStoreJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  return response;
}

async function authenticatedCustomer(request: Request) {
  const bearerToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (!bearerToken) return { error: noStoreJson({ success: false, error: 'Authentification requise.' }, { status: 401 }) };

  const { data, error } = await supabase.auth.getUser(bearerToken);
  if (error || !data.user) return { error: noStoreJson({ success: false, error: 'Session invalide.' }, { status: 401 }) };
  return { user: data.user };
}

async function customerOrders(customerId: string) {
  return supabase
    .from('orders')
    .select(ORDER_COLUMNS)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(50)
    .abortSignal(AbortSignal.timeout(7_000));
}

function orderError(error: { code?: string; message?: string }) {
  console.error('Customer orders error:', error);
  const migrationRequired = error.code === '42703' || /customer_id/i.test(error.message || '');
  return noStoreJson({
    success: false,
    code: migrationRequired ? 'CUSTOMER_ORDERS_SETUP_REQUIRED' : 'CUSTOMER_ORDERS_UNAVAILABLE',
    error: migrationRequired
      ? 'L’historique des commandes doit être activé dans la base de données.'
      : 'Impossible de charger vos commandes.',
  }, { status: migrationRequired ? 503 : 500 });
}

export async function GET(request: Request) {
  const auth = await authenticatedCustomer(request);
  if (auth.error) return auth.error;

  const { data, error } = await customerOrders(auth.user.id);
  if (error) return orderError(error);
  return noStoreJson({ success: true, orders: data || [] });
}

export async function POST(request: Request) {
  const auth = await authenticatedCustomer(request);
  if (auth.error) return auth.error;

  let body: { claims?: Array<{ orderId?: unknown; token?: unknown }> };
  try {
    body = await request.json();
  } catch {
    return noStoreJson({ success: false, error: 'Données de récupération invalides.' }, { status: 400 });
  }

  const claims = Array.isArray(body.claims) ? body.claims.slice(0, 20) : [];
  const validOrderIds = new Set<string>();
  for (const claim of claims) {
    const orderId = String(claim?.orderId || '').trim().slice(0, 100);
    const fullToken = String(claim?.token || '').trim();
    const [tokenOrderId, signature] = fullToken.split('.');
    if (!orderId || tokenOrderId !== orderId || !signature || !verifyOrderToken(orderId, signature, 'track')) continue;
    validOrderIds.add(orderId);
  }

  if (validOrderIds.size === 0) return noStoreJson({ success: true, claimedCount: 0 });

  const { data, error } = await supabase
    .from('orders')
    .update({ customer_id: auth.user.id })
    .in('order_id', [...validOrderIds])
    .is('customer_id', null)
    .select('order_id')
    .abortSignal(AbortSignal.timeout(7_000));
  if (error) return orderError(error);

  return noStoreJson({ success: true, claimedCount: data?.length || 0 });
}
