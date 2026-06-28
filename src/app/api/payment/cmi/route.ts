import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { amount, orderId, customerName, phone, email } = await request.json();
    if (!amount || !orderId) {
      return NextResponse.json({ success: false, error: 'Amount and orderId are required' }, { status: 400 });
    }

    // Load settings from Supabase
    const { data: settingsData } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    const paymentSettings = settingsData?.value?.paymentSettings;
    const cmiMerchantId = paymentSettings?.cmiMerchantId || '600000000'; // Simulation merchant ID
    const cmiStoreKey = paymentSettings?.cmiStoreKey || 'TEST_KEY_123456';
    const cmiApiUrl = paymentSettings?.cmiApiUrl || 'https://testpayment.cmi.co.ma/fim/est3Dgate';

    // Build absolute URL endpoints
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    const okUrl = `${baseUrl}/checkout/success?orderId=${orderId}`;
    const failUrl = `${baseUrl}/checkout/failure?orderId=${orderId}`;
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
      email: email || 'customer@example.com',
      BillToName: customerName || 'Client E-com',
      tel: phone || '',
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
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
