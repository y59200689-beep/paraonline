'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { AnimatedPrice } from './AnimatedPrice';
import type { DeliverySettings } from '@/context/SettingsContext';

interface CartFooterProps {
  subtotal: number;
  discountAmount: number;
  dailyGiftName: string | null;
  shippingFee: number;
  total: number;
  language: string;
  isRTL: boolean;
  step: 'cart' | 'checkout';
  onCheckout: () => void;
  t: (key: string) => string;
  showShipping?: boolean;
  shippingCity?: string;
  deliverySettings?: DeliverySettings;
  totalSavings?: number;
}

export const CartFooter: React.FC<CartFooterProps> = ({
  subtotal,
  discountAmount,
  dailyGiftName,
  shippingFee,
  total,
  language,
  isRTL,
  step,
  onCheckout,
  t,
  showShipping = false,
  shippingCity = '',
  deliverySettings,
  totalSavings = 0,
}) => {
  const displayTotal = showShipping ? total : Math.max(0, subtotal - discountAmount);

  const isFR = language === 'FR';

  // ── Estimated delivery calculation ────────────────────────────────
  const getEstimatedDelivery = () => {
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 5=Fri, 6=Sat
    const hour = now.getHours();

    // Admin-configurable cutoff hour (default 14)
    const cutoff = deliverySettings?.cutoffHour ?? 14;

    // Check if city matches a configured rule (case-insensitive partial match)
    const cityLower = shippingCity.trim().toLowerCase();
    const cityRule = cityLower
      ? deliverySettings?.cityRules?.find(r => cityLower.includes(r.city.toLowerCase()) || r.city.toLowerCase().includes(cityLower))
      : undefined;

    // Determine base days to add based on time + weekday
    const isAfterCutoff = hour >= cutoff;
    const isWeekend = day === 5 || day === 6; // Fri or Sat

    let daysToAdd: number;
    if (cityRule) {
      // Use city-specific window — pick min or max based on cutoff
      daysToAdd = isAfterCutoff || isWeekend ? cityRule.daysMax : cityRule.daysMin;
    } else {
      const defaultMin = deliverySettings?.defaultDaysMin ?? 1;
      const defaultMax = deliverySettings?.defaultDaysMax ?? 2;
      if (isWeekend) {
        daysToAdd = day === 5 ? 3 : 2; // Fri→Mon, Sat→Mon
      } else {
        daysToAdd = isAfterCutoff ? defaultMax : defaultMin;
      }
    }

    const delivery = new Date(now);
    delivery.setDate(now.getDate() + daysToAdd);
    // Skip Sunday
    if (delivery.getDay() === 0) delivery.setDate(delivery.getDate() + 1);

    const dayLabel = isFR
      ? delivery.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
      : delivery.toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long' });

    const cutoffNote = !isAfterCutoff && !isWeekend
      ? (isFR ? `Si commande avant ${cutoff}h` : `إذا طلبتِ قبل ${cutoff}:00`)
      : null;

    const cityLabel = cityRule
      ? (isFR ? `Zone : ${cityRule.city}` : `منطقة : ${cityRule.city}`)
      : null;

    return { dayLabel, cutoffNote, cityLabel };
  };

  const { dayLabel: estDeliveryLabel, cutoffNote, cityLabel } = getEstimatedDelivery();

  const trustBadges = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      label: isFR ? 'Paiement à la livraison' : 'الدفع عند الاستلام',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      label: isFR ? 'Produits authentiques' : 'منتجات أصلية 100٪',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
        </svg>
      ),
      label: isFR ? 'Retour facile sous 7j' : 'إرجاع سهل خلال 7 أيام',
    },
  ];

  return (
    <div className="py-5 px-6 border-t border-slate-200/40 bg-white flex flex-col gap-4 shrink-0 shadow-[0_-12px_32px_rgba(26,37,93,0.04)]">
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between text-[11.5px] font-semibold text-slate-500">
          <span>{t('cart_subtotal')}</span>
          <span className="font-bold text-slate-800">{subtotal.toFixed(2)} DH</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-[11.5px] font-bold text-primary">
            <span>{isFR ? 'Remise' : 'الخصم'}</span>
            <span className="font-bold text-primary">−{discountAmount.toFixed(2)} DH</span>
          </div>
        )}

        {dailyGiftName && (
          <div className="flex justify-between text-[11.5px] font-bold text-accent">
            <span>{isFR ? 'Cadeau Gratuit' : 'الهدية المجانية'}</span>
            <span className="font-extrabold text-accent truncate max-w-[180px]">
              {dailyGiftName}
            </span>
          </div>
        )}

        {showShipping && (
          <div className="flex justify-between text-[11.5px] font-semibold text-slate-500">
            <span>{isFR ? 'Frais de livraison' : 'مصاريف الشحن'}</span>
            <span>
              {shippingFee === 0 ? (
                <span className="text-accent font-extrabold tracking-wide">
                  {isFR ? 'GRATUIT' : 'مجاني'}
                </span>
              ) : (
                <span className="font-bold text-slate-800">{shippingFee.toFixed(2)} DH</span>
              )}
            </span>
          </div>
        )}

        <div className="flex justify-between items-baseline pt-4 border-t border-slate-100 mt-2">
          <span className="text-sm font-bold text-slate-700">Total</span>
          <div className="text-lg font-bold text-primary-dark">
            <AnimatedPrice value={displayTotal} />
          </div>
        </div>

        {totalSavings > 0 && (
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/8 to-teal-500/4 border border-emerald-500/12 shadow-[0_2px_10px_rgba(16,185,129,0.03)] mt-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10.5px] font-bold text-emerald-800/90 uppercase tracking-wider">
                {isFR ? 'Économie Totale' : 'مجموع التوفير'}
              </span>
            </div>
            <span className="text-[12.5px] font-black text-emerald-600">
              −{totalSavings.toFixed(2)} DH
            </span>
          </div>
        )}

        {/* Estimated Delivery */}
        <div className="flex items-start justify-between pt-2.5 border-t border-dashed border-slate-100">
          <div className="flex items-center gap-2 text-slate-500">
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0 text-primary/50" stroke="currentColor" strokeWidth={1.8}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span className="text-[10.5px] font-semibold">
              {isFR ? 'Livraison estimée' : 'التوصيل المتوقع'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10.5px] font-extrabold text-primary capitalize">{estDeliveryLabel}</span>
            {cityLabel && (
              <span className="block text-[9px] text-primary/60 font-semibold mt-0.5">{cityLabel}</span>
            )}
            {cutoffNote && (
              <span className="block text-[9px] text-slate-400 font-medium mt-0.5">{cutoffNote}</span>
            )}
          </div>
        </div>
      </div>

      {step === 'cart' && (
        <div className="grid grid-cols-3 gap-1.5">
          {trustBadges.map((badge, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 px-1.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-center"
            >
              <span className="text-primary/70">{badge.icon}</span>
              <span className="text-[9px] font-semibold text-slate-500 leading-tight">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {step === 'cart' && (
        <button
          onClick={onCheckout}
          className="group w-full py-4 bg-gradient-to-r from-primary-dark to-primary text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:shadow-[0_6px_20px_rgba(26,37,93,0.2)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 ease-out flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{t('cart_checkout')}</span>
          <ArrowRight className={`w-4.5 h-4.5 transition-transform duration-300 group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
        </button>
      )}
    </div>
  );
};
