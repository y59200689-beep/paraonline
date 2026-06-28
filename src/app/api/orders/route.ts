import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    if (!search || search.trim().length < 3) {
      return NextResponse.json({ success: true, orders: [] });
    }

    // Rate limit: 20 tracking queries per IP per minute
    const ip = getClientIp(request);
    const { allowed } = await rateLimit(`order-track:${ip}`, 20, 60_000);
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Trop de requêtes. Veuillez réessayer dans une minute.' }, { status: 429 });
    }

    const cleanSearch = search.trim();
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`phone_number.eq.${cleanSearch},order_id.eq.${cleanSearch},customer_name.eq.${cleanSearch}`);

    if (error) throw error;

    return NextResponse.json({ success: true, orders: data || [] });
  } catch (error: any) {
    console.error('Order tracking error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Rate limit: 10 order submissions per IP per minute
    const ip = getClientIp(request);
    const { allowed } = await rateLimit(`orders:${ip}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Trop de requêtes. Veuillez réessayer dans une minute.' }, { status: 429 });
    }


    const body = await request.json();
    const {
      orderData,
      items,
      subtotal,
      discountAmount,
      appliedCoupon,
      giftItem,
      total,
      skinDiagnostic,
      loyaltyPoints,
      loyaltyTier,
      paymentMethod,
      paymentStatus
    } = body;

    if (!orderData || !items || !Array.isArray(items)) {
      return NextResponse.json({ success: false, error: 'Informations de commande invalides' }, { status: 400 });
    }

    // Validate coupon on the server if one was applied to prevent coupon abuse/price tampering
    if (appliedCoupon) {
      const normalizedCode = appliedCoupon.trim().toUpperCase();
      
      const MOCK_COUPONS: Record<string, any> = {
        'BEAUTY10': { code: 'BEAUTY10', discountPercent: 10, freeShipping: false, isActive: true },
        'CLINICAL15': { code: 'CLINICAL15', discountPercent: 15, freeShipping: false, isActive: true },
        'FREESHIP': { code: 'FREESHIP', discountPercent: 0, freeShipping: true, minPurchase: 300, isActive: true },
        'GIFTGLOW': { code: 'GIFTGLOW', discountPercent: 0, freeShipping: false, giftItem: 'Masque Hydra-Glow Offert', isActive: true }
      };

      // 1. Get settings for dynamic coupons
      let settingsCoupons: any[] = [];
      try {
        const { data: settingsData, error: settingsError } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .single();
        
        if (!settingsError && settingsData?.value?.coupons) {
          settingsCoupons = settingsData.value.coupons;
        }
      } catch (dbErr) {
        console.error("Error reading store settings for coupons in order endpoint:", dbErr);
      }

      let coupon = settingsCoupons.find((c: any) => c.code === normalizedCode);
      if (!coupon) {
        coupon = MOCK_COUPONS[normalizedCode];
      }

      if (!coupon || coupon.isActive === false) {
        return NextResponse.json({ success: false, error: 'Code promo invalide ou inactif.' }, { status: 400 });
      }

      const todayStr = new Date().toISOString().split('T')[0];
      if (coupon.startDate && coupon.startDate > todayStr) {
        return NextResponse.json({ success: false, error: "Ce code promo n'est pas encore actif." }, { status: 400 });
      }

      if (coupon.expiryDate) {
        const expiryTime = new Date(coupon.expiryDate).getTime();
        const todayTime = new Date().setHours(0, 0, 0, 0);
        if (expiryTime < todayTime) {
          return NextResponse.json({ success: false, error: 'Ce code promo a expiré.' }, { status: 400 });
        }
      }

      if (coupon.minPurchase && subtotal < coupon.minPurchase) {
        return NextResponse.json({ success: false, error: `Minimum d'achat de ${coupon.minPurchase} DH requis pour ce code.` }, { status: 400 });
      }

      if (coupon.usageLimit !== undefined && coupon.usageLimit !== null && coupon.usageLimit > 0) {
        const { count, error: countError } = await supabase
          .from('orders')
          .select('order_id', { count: 'exact', head: true })
          .eq('applied_coupon', normalizedCode)
          .not('status', 'eq', 'Cancelled');

        if (!countError && count !== null && count >= coupon.usageLimit) {
          return NextResponse.json({ success: false, error: "Ce code promo a atteint sa limite d'utilisation." }, { status: 400 });
        }
      }
    }

    const orderId = 'PO-' + Math.floor(100000 + Math.random() * 900000);

    const { error: insertError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        customer_name: orderData.name,
        phone_number: orderData.phone,
        address: orderData.address,
        city: orderData.city,
        notes: orderData.note || null,
        items,
        subtotal,
        discount_amount: discountAmount,
        applied_coupon: appliedCoupon,
        gift_item: giftItem,
        total,
        status: paymentMethod && paymentMethod !== 'cod' ? 'Pending Payment' : 'Pending',
        skin_diagnostic: skinDiagnostic,
        loyalty_points: loyaltyPoints,
        loyalty_tier: loyaltyTier,
        payment_method: paymentMethod || 'cod',
        payment_status: paymentStatus || 'unpaid'
      });

    if (insertError) {
      console.error('Supabase DB Insert Error:', insertError);
      throw insertError;
    }

    // 2. Decrement stock securely in Supabase via RPC to prevent race conditions
    try {
      for (const item of items) {
        await supabase.rpc('decrement_product_stock', {
          product_id: item.id,
          qty: item.quantity
        });
      }
    } catch (stockError) {
      console.error('Error executing secure stock decrement:', stockError);
    }

    const isCod = !paymentMethod || paymentMethod === 'cod';
    let verificationToken = '';
    if (isCod) {
      verificationToken = await generateVerificationToken(orderId);
      console.log(`[WhatsApp COD Verification Link] https://paraofficinal.ma/api/orders/verify?token=${verificationToken}&action=confirm`);
    }

    return NextResponse.json({ success: true, orderId, verificationToken });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

async function generateVerificationToken(orderId: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'secret-key';
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(orderId)
  );
  const hex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${orderId}.${hex}`;
}
