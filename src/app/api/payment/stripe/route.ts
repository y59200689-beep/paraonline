import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('order_id, total, payment_method, payment_status')
      .eq('order_id', orderId)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order || order.payment_method !== 'stripe' || order.payment_status === 'paid') {
      return NextResponse.json({ success: false, error: 'Commande Stripe invalide.' }, { status: 409 });
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
    const stripeSecretKey = paymentSettings?.stripeSecretKey || process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      console.error('Stripe secret key not configured');
      return NextResponse.json({ success: false, error: 'Stripe configuration missing' }, { status: 500 });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey);

    // Create a PaymentIntent in MAD (Moroccan Dirham)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amounts in cents/subunit
      currency: 'mad',
      metadata: { orderId, expectedAmount: String(Math.round(amount * 100)) },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Stripe payment intent error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
