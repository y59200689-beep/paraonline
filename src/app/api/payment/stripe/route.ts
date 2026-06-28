import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(request: Request) {
  try {
    const { amount, orderId } = await request.json();
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
      metadata: { orderId },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Stripe payment intent error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
