'use client';

import React from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { Product } from '@/lib/data';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { useTranslation } from '@/context/LanguageContext';
import { PRODUCT_IMAGE_FALLBACK } from '@/lib/public-images';
import styles from './CartDrawer.module.css';

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
                  ) || PRODUCT_IMAGE_FALLBACK
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
        <div className={styles.recommendations}>
          <h4>{language === 'FR' ? 'Complétez votre routine beauté' : 'أكملي روتين جمالك'}</h4>
          <p>{language === 'FR' ? 'Nos recommandations pour vous' : 'توصياتنا لك'}</p>
          <div className="grid grid-cols-3 gap-3">
            {thresholdItems.map((item) => (
              <div
                key={item.id}
                className={styles.recommendation}
              >
                <div className={styles.recommendationImage}>
                  <Image
                    src={getOptimizedImageUrl(item.image) || PRODUCT_IMAGE_FALLBACK}
                    alt={item.nameFr || item.name || item.title}
                    fill
                    sizes="(max-width: 480px) 100px, 160px"
                    className="object-cover"
                  />
                </div>
                <div className="w-full min-w-0">
                  <p className="text-[9px] font-bold text-slate-600 group-hover/upsell:text-primary transition-colors duration-200 leading-tight line-clamp-2 h-6">
                    {toTitleCase(item.nameFr || item.name || item.title)}
                  </p>
                  <span className="text-[10.5px] font-bold text-primary mt-1 block">
                    {item.price.toFixed(2)} DH
                  </span>
                </div>
                <button
                  onClick={() => addToCart(item, 1)}
                  className={styles.addButton}
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
