import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';
import { supabaseAdmin as supabase } from '@/lib/supabase';

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && url !== 'https://placeholder.supabase.co' && url !== 'https://your-project-id.supabase.co' && key && key !== 'placeholder-key' && key !== 'your-public-anon-key-placeholder';
}

export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }
    if (session.role === 'support') { return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 }); }

    const { orderId, courierName, codAmount, customerName, phone, city, address } = await request.json();
    
    if (!orderId || !courierName) {
      return NextResponse.json({ success: false, error: 'Order ID and Courier are required' }, { status: 400 });
    }

    // Generate simulated tracking details
    const cleanCourier = courierName.toLowerCase();
    const isYalidine = cleanCourier.includes('yalidine');
    
    const trackingPrefix = isYalidine ? 'YAL' : 'CAT';
    const trackingNumber = trackingPrefix + Math.floor(100000000 + Math.random() * 900000000);
    const trackingLink = isYalidine 
      ? `https://www.yalidine.com/track/${trackingNumber}` 
      : `https://www.cathedis.ma/tracking/${trackingNumber}`;

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: 'Shipped',
            tracking_number: trackingNumber,
            tracking_link: trackingLink,
            courier: courierName
          })
          .eq('order_id', orderId);
        
        if (error) {
          console.error("Supabase courier ship update error:", error);
        }
      } catch (e) {
        console.error("Supabase update fail:", e);
      }
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
