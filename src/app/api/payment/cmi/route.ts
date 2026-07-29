import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import crypto from 'crypto';
import { createOrderTrackingToken } from '@/lib/order-security';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('order_id, total, customer_name, phone_number, payment_method, payment_status')
      .eq('order_id', orderId)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order || order.payment_method !== 'cmi' || order.payment_status === 'paid') {
      return NextResponse.json({ success: false, error: 'Commande CMI invalide.' }, { status: 409 });
    }
    const amount = Number(order.total);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Montant de commande invalide.' }, { status: 409 });
    }

    // Load settings from Supabase
    const { data: settingsData } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    const paymentSettings = settingsData?.value?.paymentSettings;
    const cmiMerchantId = paymentSettings?.cmiMerchantId || process.env.CMI_MERCHANT_ID;
    const cmiStoreKey = paymentSettings?.cmiStoreKey || process.env.CMI_STORE_KEY;
    const cmiApiUrl = paymentSettings?.cmiApiUrl || process.env.CMI_API_URL;
    if (!cmiMerchantId || !cmiStoreKey || !cmiApiUrl) {
      return NextResponse.json({ success: false, error: 'CMI n’est pas configuré.' }, { status: 503 });
    }

    // Build absolute URL endpoints
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    const trackingToken = createOrderTrackingToken(orderId);
    const trackingQuery = `order=${encodeURIComponent(orderId)}&token=${encodeURIComponent(trackingToken)}`;
    const okUrl = `${baseUrl}/checkout/success?orderId=${orderId}&${trackingQuery}`;
    const failUrl = `${baseUrl}/checkout/failure?orderId=${orderId}&${trackingQuery}`;
    const shopUrl = baseUrl;

    // Define parameters for CMI form POST request
    const params: Record<string, string> = {
      clientid: cmiMerchantId,
      amount: Number(amount).toFixed(2),
      okUrl: okUrl,
      failUrl: failUrl,
      callbackUrl: `${baseUrl}/api/payment/cmi/callback`,
      Shopurl: shopUrl,
      symbol: '504', // MAD ISO code
      oid: orderId,
      email: 'customer@example.com',
      BillToName: order.customer_name,
      tel: order.phone_number,
      rnd: crypto.randomBytes(8).toString('hex'),
      hashAlgorithm: 'ver3',
      encoding: 'UTF-8',
      storetype: '3D_PAY_HOSTING',
      tranType: 'PreAuth',
    };

    // Calculate CMI Signature (ver3 algorithm)
    // 1. Sort the parameter keys alphabetically (case insensitive)
    const sortedKeys = Object.keys(params).sort((a, b) => 
      a.toLowerCase().localeCompare(b.toLowerCase())
    );

    // 2. Concatenate parameter values separated by '|' (escaping '|' and '\' characters)
    let hashString = '';
    sortedKeys.forEach(key => {
      const val = params[key].replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
      hashString += val + '|';
    });

    // 3. Append escaped store key
    const escapedStoreKey = cmiStoreKey.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
    hashString += escapedStoreKey;

    // 4. Calculate SHA-256 hash and encode in Base64
    const hash = crypto.createHash('sha256').update(hashString, 'utf8').digest('base64');

    return NextResponse.json({
      success: true,
      apiUrl: cmiApiUrl,
      params: {
        ...params,
        HASH: hash
      }
    });
  } catch (error: any) {
    console.error('CMI Form signature generation error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
