'use client';

import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { StripeCheckoutForm } from './StripeCheckoutForm';

interface StripePaymentElementProps {
  publishableKey: string;
  clientSecret: string;
  orderId: string;
  trackingToken: string;
  amount: number;
  locale: 'fr' | 'ar';
  onSuccess: () => void;
  onCancel: () => void;
}

export function StripePaymentElement({
  publishableKey,
  clientSecret,
  orderId,
  trackingToken,
  amount,
  locale,
  onSuccess,
  onCancel,
}: StripePaymentElementProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    if (!publishableKey || !clientSecret) return;
    setStripePromise(loadStripe(publishableKey));
  }, [clientSecret, publishableKey]);

  if (!stripePromise) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-24 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500"
      >
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
        {locale === 'fr' ? 'Chargement du paiement sécurisé…' : 'جاري تحميل الدفع الآمن…'}
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, locale }}>
      <StripeCheckoutForm
        clientSecret={clientSecret}
        orderId={orderId}
        trackingToken={trackingToken}
        amount={amount}
        onSuccess={onSuccess}
        onCancel={onCancel}
        adminTheme="light"
      />
    </Elements>
  );
}
