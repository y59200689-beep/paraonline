import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import crypto from 'crypto';
import { awardOrderLoyalty } from '@/lib/loyalty-awards';
import { blocksOnlinePaymentSettlement } from '@/lib/payment-lifecycle';
import { transitionOrderLifecycle } from '@/lib/order-lifecycle-transition';

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
      settingsData?.value?.paymentSettings?.cmiStoreKey || process.env.CMI_STORE_KEY;
    if (!cmiStoreKey) {
      console.error('[CMI Callback] CMI store key is not configured.');
      return new Response('ACTION=REJECT', { status: 200, headers: { 'Content-Type': 'text/plain' } });
    }

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
      // Verify that this callback belongs to the stored CMI order and amount.
      const { data: order } = await supabase
        .from('orders')
        .select('status, total, payment_method')
        .eq('order_id', orderId)
        .single();

      const callbackAmount = Number(params.amount);
      const isCorrectOrder = order?.payment_method === 'cmi'
        && Number.isFinite(callbackAmount)
        && Math.round(callbackAmount * 100) === Math.round(Number(order.total) * 100)
        && params.symbol === '504';
      if (!isCorrectOrder) {
        console.error(`[CMI Callback] Invalid order, amount, currency, or payment method for ${orderId}.`);
        return new Response('ACTION=REJECT', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        });
      }

      if (blocksOnlinePaymentSettlement(order?.status)) {
        console.warn(`[CMI Callback] Refusing settlement for terminal order ${orderId}.`);
        return new Response('ACTION=REJECT', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        });
      }

      if (order?.status === 'Paid') {
        console.log(`Order ${orderId} is already marked as Paid. Skipping duplicate CMI callback.`);
        const { error: loyaltyError } = await awardOrderLoyalty(orderId, 'online_payment_succeeded');
        if (loyaltyError) throw loyaltyError;
        return new Response('ACTION=POSTAUTH', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        });
      }

      const { error: transitionError } = await transitionOrderLifecycle(
        orderId,
        approved ? 'Paid' : 'Payment Failed',
        approved ? 'paid' : 'failed',
      );
      if (transitionError) throw transitionError;

      if (approved) {
        const { error: loyaltyError } = await awardOrderLoyalty(orderId, 'online_payment_succeeded');
        if (loyaltyError) throw loyaltyError;
      }

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
