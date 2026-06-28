'use client';

import React from 'react';
import { Tag } from 'lucide-react';

interface AppliedCoupon {
  code: string;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  discountPercent: number;
  freeShipping?: boolean;
}

interface CouponSectionProps {
  language: string;
  couponCode: string;
  setCouponCode: (v: string) => void;
  couponMessage: { text: string; isError: boolean };
  appliedCoupon: AppliedCoupon | null;
  onApply: (e: React.FormEvent) => void;
  onRemove: () => void;
}

export const CouponSection: React.FC<CouponSectionProps> = ({
  language,
  couponCode,
  setCouponCode,
  couponMessage,
  appliedCoupon,
  onApply,
  onRemove,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/40 bg-white p-4 flex flex-col gap-3 shadow-[0_4px_12px_rgba(26,37,93,0.02)]">
      <div className="flex items-center gap-2">
        <Tag className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {language === 'FR' ? 'Code promo' : 'رمز ترويجي'}
        </span>
      </div>

      <form onSubmit={onApply} className="flex gap-2">
        <input
          type="text"
          placeholder={language === 'FR' ? 'Entrez votre code…' : 'أدخل الرمز هنا…'}
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="flex-1 px-3.5 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl text-xs outline-none focus:border-primary focus:bg-white transition-all duration-300 text-slate-800 shadow-inner"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-primary-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary active:scale-95 transition-all duration-300 shadow-sm"
        >
          OK
        </button>
      </form>

      {appliedCoupon && (
        <div className="flex items-center justify-between bg-primary/5 border border-primary/10 text-primary-dark px-3 py-2.5 rounded-xl text-[11px] font-bold shadow-[0_2px_8px_rgba(37,115,163,0.02)]">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-primary" />
            <span>
              {appliedCoupon.code} (−
              {appliedCoupon.discountType === 'fixed'
                ? `${appliedCoupon.discountValue || 0} DH`
                : `${appliedCoupon.discountValue !== undefined ? appliedCoupon.discountValue : appliedCoupon.discountPercent}%`}
              {appliedCoupon.freeShipping &&
                ` + ${language === 'AR' ? 'شحن مجاني' : 'Port Offert'}`}
              )
            </span>
          </div>
          <button
            onClick={onRemove}
            aria-label={language === 'FR' ? 'Retirer le coupon' : 'إزالة الكوبون'}
            className="text-slate-400 hover:text-rose-500 font-extrabold transition-colors duration-250 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {couponMessage.text && (
        <span
          className={`text-[10px] font-bold ${
            couponMessage.isError ? 'text-rose-500' : 'text-primary'
          }`}
        >
          {couponMessage.text}
        </span>
      )}
    </div>
  );
};
