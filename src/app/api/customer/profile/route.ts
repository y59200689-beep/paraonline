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

  const { data, error } = await supabase
    .from('customer_profiles')
    .select('delivery_addresses')
    .eq('id', auth.user.id)
    .maybeSingle()
    .abortSignal(AbortSignal.timeout(7_000));

  if (error) {
    console.error('Customer delivery addresses error:', error);
    return noStoreJson({ success: false, error: 'Impossible de charger vos adresses.' }, { status: 500 });
  }

  return noStoreJson({
    success: true,
    addresses: Array.isArray(data?.delivery_addresses) ? data.delivery_addresses : [],
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

  const addresses = body.addresses.slice(0, 20).map((address, index) => ({
    id: String(address?.id || `address_${index + 1}`).slice(0, 100),
    label: String(address?.label || 'Adresse').trim().slice(0, 80),
    fullName: String(address?.fullName || '').trim().slice(0, 160),
    phone: String(address?.phone || '').trim().slice(0, 40),
    city: String(address?.city || '').trim().slice(0, 120),
    address: String(address?.address || '').trim().slice(0, 400),
    isDefault: Boolean(address?.isDefault),
  }));

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
