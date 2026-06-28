'use client';

import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface StripeCheckoutFormProps {
  clientSecret: string;
  orderId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  adminTheme: string;
}

export const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
  clientSecret,
  orderId,
  amount,
  onSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || 'Une erreur est survenue');
      setIsProcessing(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Le paiement a échoué.');
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-500 text-[11px] font-bold">
          {errorMessage}
        </div>
      )}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
        >
          Retour
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? 'Traitement...' : `Payer ${amount.toFixed(2)} DH`}
        </button>
      </div>
    </form>
  );
};
