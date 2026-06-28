'use client';

import React from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { Product } from '@/lib/data';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { useTranslation } from '@/context/LanguageContext';

const placeholderSvg =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='100%' height='100%'><rect width='100%' height='100%' fill='#f1f5f9'/><path d='M150 100a40 40 0 1 0 40 40 40 40 0 0 0-40-40zm0 60a20 20 0 1 1 20-20 20 20 0 0 1-20 20z' fill='#94a3b8'/><path d='M180 180h-60a10 10 0 0 0-10 10v10h80v-10a10 10 0 0 0-10-10z' fill='#94a3b8'/><text x='150' y='230' font-family='sans-serif' font-size='12' font-weight='bold' fill='#64748b' text-anchor='middle'>Image Indisponible</text></svg>"
  );

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface CartUpsellsProps {
  /** Whether the oil product (id=15) is in cart but not the foam (id=22) */
  showDoubleCleanseUpsell: boolean;
  /** Products priced ≤200 DH not already in cart */
  thresholdItems: Product[];
  isFreeShipping: boolean;
  products: Product[];
  addToCart: (product: Product, qty: number) => void;
}

export const CartUpsells: React.FC<CartUpsellsProps> = ({
  showDoubleCleanseUpsell,
  thresholdItems,
  isFreeShipping,
  products,
  addToCart,
}) => {
  const { t, language } = useTranslation();

  return (
    <>
      {/* Double-Cleanse Upsell */}
      {showDoubleCleanseUpsell && (
        <div className="bg-[#831843]/5 border border-dashed border-[#831843]/20 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#831843]">
            {t('cro_double_cleanse_title')}
          </span>
          <p className="text-[10.5px] leading-relaxed text-[#831843]/90">
            {t('cro_double_cleanse_desc')}
          </p>
          <div className="flex gap-3 items-center bg-white p-3 rounded-xl border border-slate-100 shadow-[0_2px_8px_rgba(26,37,93,0.01)]">
            <div className="w-12 h-12 rounded-lg shrink-0 relative overflow-hidden bg-slate-50 border border-slate-100">
              <Image
                src={
                  getOptimizedImageUrl(
                    'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=320&auto=format&fit=crop'
                  ) || placeholderSvg
                }
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-[10.5px] font-bold text-slate-800 truncate">
                {toTitleCase(
                  products.find((p) => p.id === 22)?.nameFr ||
                    products.find((p) => p.id === 22)?.name ||
                    'Anua Heartleaf Mousse Nettoyante'
                )}
              </h5>
              <span className="text-xs font-bold text-primary-dark">179.00 DH</span>
            </div>
            <button
              onClick={() => {
                const p = products.find((p) => p.id === 22);
                if (p) addToCart(p, 1);
              }}
              className="shrink-0 px-3.5 py-2 bg-[#831843] text-white text-[9px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#831843]/90 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 shadow-sm"
            >
              {t('cro_add_partner_btn')}
            </button>
          </div>
        </div>
      )}

      {/* Threshold Free-Shipping Upsell Grid */}
      {!isFreeShipping && thresholdItems.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400">
            {t('cro_free_shipping_unlock')}
          </span>
          <div className="grid grid-cols-3 gap-3">
            {thresholdItems.map((item) => (
              <div
                key={item.id}
                className="group/upsell bg-white border border-slate-200/50 rounded-2xl p-2.5 flex flex-col items-center gap-2 text-center hover:border-primary/20 hover:shadow-[0_8px_20px_rgba(26,37,93,0.03)] transition-all duration-300 ease-out"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-1 relative overflow-hidden transition-transform duration-300 group-hover/upsell:scale-105">
                  <Image
                    src={getOptimizedImageUrl(item.image) || placeholderSvg}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                  />
                </div>
                <div className="w-full min-w-0">
                  <p className="text-[9px] font-bold text-slate-600 group-hover/upsell:text-primary transition-colors duration-200 leading-tight line-clamp-2 h-6">
                    {toTitleCase(item.nameFr || item.name || item.title)}
                  </p>
                  <span className="text-[10.5px] font-bold text-primary-dark mt-1 block">
                    {item.price} DH
                  </span>
                </div>
                <button
                  onClick={() => addToCart(item, 1)}
                  className="w-full py-1.5 bg-primary-dark text-white text-[8px] font-bold uppercase tracking-wide rounded-lg flex items-center justify-center gap-1 hover:bg-primary active:scale-95 transition-all duration-300 shadow-sm"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>{language === 'FR' ? 'Ajouter' : 'إضافة'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
