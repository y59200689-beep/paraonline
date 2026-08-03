import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

type DeliveryAddress = {
  id?: unknown;
  label?: unknown;
  fullName?: unknown;
  phone?: unknown;
  city?: unknown;
  address?: unknown;
  isDefault?: unknown;
};

type OrderDeliveryAddress = {
  order_id?: unknown;
  customer_name?: unknown;
  phone_number?: unknown;
  city?: unknown;
  address?: unknown;
  created_at?: unknown;
};

type NormalizedDeliveryAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  isDefault: boolean;
};

const normalizeAddressPart = (value: unknown) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const addressFingerprint = (address: Pick<NormalizedDeliveryAddress, 'city' | 'address'>) =>
  `${normalizeAddressPart(address.city)}|${normalizeAddressPart(address.address)}`;

function normalizeDeliveryAddress(address: DeliveryAddress, index: number): NormalizedDeliveryAddress {
  return {
    id: String(address?.id || `address_${index + 1}`).slice(0, 100),
    label: String(address?.label || 'Adresse').trim().slice(0, 80),
    fullName: String(address?.fullName || '').trim().slice(0, 160),
    phone: String(address?.phone || '').trim().slice(0, 40),
    city: String(address?.city || '').trim().slice(0, 120),
    address: String(address?.address || '').trim().slice(0, 400),
    isDefault: Boolean(address?.isDefault),
  };
}

function deduplicateAddresses(addresses: NormalizedDeliveryAddress[]): NormalizedDeliveryAddress[] {
  const unique: NormalizedDeliveryAddress[] = [];
  const indexByFingerprint = new Map<string, number>();

  for (const address of addresses) {
    // Do not promote incomplete data from an order into the address book.
    if (!address.city || !address.address) continue;
    const fingerprint = addressFingerprint(address);
    const existingIndex = indexByFingerprint.get(fingerprint);
    if (existingIndex === undefined) {
      indexByFingerprint.set(fingerprint, unique.length);
      unique.push(address);
      continue;
    }

    // Preserve an explicitly selected default address if two records describe
    // the same place with slightly different formatting.
    if (address.isDefault && !unique[existingIndex].isDefault) {
      unique[existingIndex] = address;
    }
  }

  return unique;
}

function addressesFromOrders(orders: OrderDeliveryAddress[]): NormalizedDeliveryAddress[] {
  return orders.map((order, index) => {
    const city = String(order.city || '').trim().slice(0, 120);
    return {
      id: `order_address_${String(order.order_id || index + 1).trim().slice(0, 70)}`,
      label: city ? `Livraison — ${city}` : 'Adresse de livraison',
      fullName: String(order.customer_name || '').trim().slice(0, 160),
      phone: String(order.phone_number || '').trim().slice(0, 40),
      city,
      address: String(order.address || '').trim().slice(0, 400),
      isDefault: false,
    };
  });
}

function mergeDeliveryAddresses(saved: DeliveryAddress[], orders: OrderDeliveryAddress[]) {
  return deduplicateAddresses([
    ...saved.map(normalizeDeliveryAddress),
    ...addressesFromOrders(orders),
  ]).slice(0, 20);
}

function noStoreJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  return response;
}

async function getAuthenticatedCustomer(request: Request) {
  const bearerToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (!bearerToken) return { error: noStoreJson({ success: false, error: 'Authentification requise.' }, { status: 401 }) };

  const { data, error } = await supabase.auth.getUser(bearerToken);
  if (error || !data.user) return { error: noStoreJson({ success: false, error: 'Session invalide.' }, { status: 401 }) };

  return { user: data.user };
}

export async function GET(request: Request) {
  const auth = await getAuthenticatedCustomer(request);
  if (auth.error) return auth.error;

  const [profileResult, ordersResult] = await Promise.all([
    supabase
      .from('customer_profiles')
      .select('delivery_addresses')
      .eq('id', auth.user.id)
      .maybeSingle()
      .abortSignal(AbortSignal.timeout(7_000)),
    supabase
      .from('orders')
      .select('order_id, customer_name, phone_number, city, address, created_at')
      .eq('customer_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .abortSignal(AbortSignal.timeout(7_000)),
  ]);

  if (profileResult.error) {
    console.error('Customer delivery addresses error:', profileResult.error);
    return noStoreJson({ success: false, error: 'Impossible de charger vos adresses.' }, { status: 500 });
  }

  // Do not block the manual address book if legacy data has not yet received
  // the customer_id migration. The customer can still use saved addresses.
  if (ordersResult.error) {
    console.warn('Customer order addresses unavailable:', ordersResult.error);
  }

  const saved = Array.isArray(profileResult.data?.delivery_addresses)
    ? profileResult.data.delivery_addresses as DeliveryAddress[]
    : [];
  const orderAddresses = ordersResult.error ? [] : (ordersResult.data || []) as OrderDeliveryAddress[];

  return noStoreJson({
    success: true,
    addresses: mergeDeliveryAddresses(saved, orderAddresses),
  });
}

export async function PUT(request: Request) {
  const auth = await getAuthenticatedCustomer(request);
  if (auth.error) return auth.error;

  let body: { addresses?: DeliveryAddress[] };
  try {
    body = await request.json();
  } catch {
    return noStoreJson({ success: false, error: 'Données d’adresse invalides.' }, { status: 400 });
  }

  if (!Array.isArray(body.addresses)) {
    return noStoreJson({ success: false, error: 'La liste des adresses est invalide.' }, { status: 400 });
  }

  const addresses = deduplicateAddresses(body.addresses
    .slice(0, 20)
    .map(normalizeDeliveryAddress));

  const { error } = await supabase
    .from('customer_profiles')
    .upsert({
      id: auth.user.id,
      email: auth.user.email || null,
      delivery_addresses: addresses,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .abortSignal(AbortSignal.timeout(7_000));

  if (error) {
    console.error('Customer delivery address update error:', error);
    return noStoreJson({ success: false, error: 'Impossible d’enregistrer vos adresses.' }, { status: 500 });
  }

  return noStoreJson({ success: true, addresses });
}
