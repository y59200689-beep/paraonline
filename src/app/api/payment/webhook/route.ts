import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature') || '';

  try {
    // Load settings from Supabase
    const { data: settingsData } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    const paymentSettings = settingsData?.value?.paymentSettings;
    const stripeSecretKey = paymentSettings?.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
    // Prefer DB-stored webhook secret, fall back to env variable
    const webhookSecret = paymentSettings?.stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey) {
      return NextResponse.json({ success: false, error: 'Stripe is not configured' }, { status: 500 });
    }

    // SECURITY: Reject webhooks if the signing secret is not configured.
    // Without this, an attacker could forge payment events and mark orders as paid.
    if (!webhookSecret) {
      console.error('[SECURITY] STRIPE_WEBHOOK_SECRET is not set. Rejecting all incoming webhook events.');
      return NextResponse.json({ success: false, error: 'Webhook secret not configured' }, { status: 500 });
    }

    if (!sig) {
      return NextResponse.json({ success: false, error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const stripe = new Stripe(stripeSecretKey);
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ success: false, error: 'Signature verification failed' }, { status: 400 });
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        // Update order status in database
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'Paid',
            payment_status: 'paid'
          })
          .eq('order_id', orderId);

        if (updateError) {
          console.error(`Failed to update status for order ${orderId}:`, updateError);
          throw updateError;
        }

        // Add audit log entry
        try {
          await supabase.from('audit_logs').insert({
            action: 'Paiement Réussi',
            details: `Commande ${orderId} payée en ligne via Stripe (ID: ${paymentIntent.id}).`
          });
        } catch (auditErr) {
          console.error('Failed to create audit log for payment:', auditErr);
        }
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;
      const failureMessage = paymentIntent.last_payment_error?.message || 'Payment declined';

      if (orderId) {
        // Mark the order as payment failed
        await supabase
          .from('orders')
          .update({
            status: 'Payment Failed',
            payment_status: 'failed'
          })
          .eq('order_id', orderId);

        // Log the failure for operations visibility
        try {
          await supabase.from('audit_logs').insert({
            action: 'Paiement Échoué',
            details: `Commande ${orderId} — paiement Stripe refusé. Raison : ${failureMessage} (PaymentIntent: ${paymentIntent.id}).`
          });
        } catch (auditErr) {
          console.error('Failed to create audit log for payment failure:', auditErr);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handling error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';

