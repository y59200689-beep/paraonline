import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // CMI sends application/x-www-form-urlencoded POST body
    const text = await request.text();
    const params = Object.fromEntries(new URLSearchParams(text).entries());

    const {
      oid: orderId,
      response: responseCode,
      HASH: receivedHash,
      mdStatus,
    } = params;

    // Load storeKey from Supabase settings to verify the callback signature
    const { data: settingsData } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    const cmiStoreKey =
      settingsData?.value?.paymentSettings?.cmiStoreKey || 'TEST_KEY_123456';

    // -------------------------------------------------------------------
    // CMI ver3 HASH verification
    // Remove the HASH field from the params, sort remaining keys, hash them
    // -------------------------------------------------------------------
    const verifyParams = { ...params };
    delete verifyParams.HASH;

    const sortedKeys = Object.keys(verifyParams).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );

    let hashString = '';
    sortedKeys.forEach((key) => {
      const val = (verifyParams[key] ?? '')
        .replace(/\\/g, '\\\\')
        .replace(/\|/g, '\\|');
      hashString += val + '|';
    });

    const escapedStoreKey = cmiStoreKey
      .replace(/\\/g, '\\\\')
      .replace(/\|/g, '\\|');
    hashString += escapedStoreKey;

    const expectedHash = crypto
      .createHash('sha256')
      .update(hashString, 'utf8')
      .digest('base64');

    if (receivedHash !== expectedHash) {
      console.error(
        '[CMI Callback] Signature mismatch. Possible tampering. orderId:',
        orderId
      );
      // Respond with REJECT — do NOT authorise the transaction
      return new Response('ACTION=REJECT', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // responseCode '00' means approved; mdStatus '1' means 3D-Secure passed
    const approved = responseCode === '00' && mdStatus === '1';

    if (orderId) {
      await supabase
        .from('orders')
        .update({
          status: approved ? 'Paid' : 'Payment Failed',
          payment_status: approved ? 'paid' : 'failed',
        })
        .eq('order_id', orderId);

      await supabase.from('audit_logs').insert({
        action: approved ? 'Paiement CMI Réussi' : 'Paiement CMI Échoué',
        details: `Commande ${orderId} — CMI callback reçu. responseCode=${responseCode}, mdStatus=${mdStatus}.`,
      });
    }

    // CMI requires the response body "ACTION=POSTAUTH" to finalise the payment
    return new Response(approved ? 'ACTION=POSTAUTH' : 'ACTION=REJECT', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error: any) {
    console.error('CMI callback error:', error);
    return new Response('ACTION=REJECT', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

export const dynamic = 'force-dynamic';
