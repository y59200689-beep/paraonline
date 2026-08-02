import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const bearerToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (!bearerToken) {
    return NextResponse.json({ success: false, error: 'Authentification requise.' }, { status: 401 });
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(bearerToken);
  if (authError || !authData.user) {
    return NextResponse.json({ success: false, error: 'Session invalide.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('orders')
    .select('order_id, customer_name, phone_number, address, city, notes, items, subtotal, discount_amount, applied_coupon, gift_item, total, status, carrier, tracking_number, estimated_delivery, created_at')
    .eq('customer_id', authData.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Customer orders error:', error);
    return NextResponse.json({ success: false, error: 'Impossible de charger vos commandes.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, orders: data || [] });
}
