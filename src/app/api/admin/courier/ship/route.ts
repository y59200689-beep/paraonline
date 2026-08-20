import { NextResponse } from 'next/server';
import { authorizeAdminMutation } from '@/lib/admin-authorization';
import { canManageCouriers } from '@/lib/permissions';
import { isSupabaseConfigured, supabaseAdmin as supabase } from '@/lib/supabase';
import { orderLifecycleTransition } from '@/lib/order-lifecycle';
import { transitionOrderLifecycle } from '@/lib/order-lifecycle-transition';

export async function POST(request: Request) {
  try {
    const authorization = await authorizeAdminMutation({ allow: canManageCouriers });
    if (!authorization.authorized) return authorization.response;

    const { orderId, courierName, codAmount, customerName, phone, city, address } = await request.json();
    
    if (!orderId || !courierName) {
      return NextResponse.json({ success: false, error: 'Order ID and Courier are required' }, { status: 400 });
    }
    const { data: order, error: orderError } = await supabase.from('orders').select('status').eq('order_id', orderId).maybeSingle();
    if (orderError || !order) return NextResponse.json({ success: false, error: 'Commande introuvable.' }, { status: 404 });
    if (!orderLifecycleTransition(order.status, 'Shipped').allowed) return NextResponse.json({ success: false, error: 'Transition de commande invalide.' }, { status: 409 });

    // Generate simulated tracking details
    const cleanCourier = courierName.toLowerCase();
    const isYalidine = cleanCourier.includes('yalidine');
    
    const trackingPrefix = isYalidine ? 'YAL' : 'CAT';
    const trackingNumber = trackingPrefix + Math.floor(100000000 + Math.random() * 900000000);
    const trackingLink = isYalidine 
      ? `https://www.yalidine.com/track/${trackingNumber}` 
      : `https://www.cathedis.ma/tracking/${trackingNumber}`;

    if (isSupabaseConfigured()) {
      const { error: transitionError } = await transitionOrderLifecycle(orderId, 'Shipped');
      if (transitionError) return NextResponse.json({ success: false, error: 'Transition de commande invalide.' }, { status: 409 });
      const { error } = await supabase
        .from('orders')
        .update({ tracking_number: trackingNumber, tracking_link: trackingLink, courier: courierName })
        .eq('order_id', orderId);
      if (error) return NextResponse.json({ success: false, error: 'Impossible d’enregistrer l’expédition.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      trackingNumber,
      trackingLink,
      courier: courierName,
      labelData: {
        orderId,
        courier: courierName.toUpperCase(),
        trackingNumber,
        codAmount: Number(codAmount) || 0,
        customerName,
        phone,
        city,
        address,
        shippingDate: new Date().toLocaleDateString('fr-FR')
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
