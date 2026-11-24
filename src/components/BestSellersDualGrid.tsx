'use client';

import React from 'react';
import { Product } from '@/lib/data';
import { useWishlist } from '@/context/WishlistContext';
import { useTranslation } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useUi } from '@/context/UiContext';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { PRODUCT_IMAGE_FALLBACK } from '@/lib/public-images';
import { useHomepageBestSellers } from '@/lib/use-homepage-best-sellers';
import { useSettings, type HomepageSectionItem } from '@/context/SettingsContext';
import cardStyles from './TopRatedAsymmetricGrid.module.css';
import styles from './BestSellersDualGrid.module.css';

const cleanTitle = (title: string) => {
  return title
    .replace(/=\s*TROUSSE\s*OFFERTE/gi, '')
    .replace(/=\s*Tote\s*Bag\s*Offert/gi, '')
    .replace(/=\s*Coffret\s*Cadeau\s*Offert/gi, '')
    .trim();
};

export const BestSellersDualGrid: React.FC<{ sections?: HomepageSectionItem[] }> = ({ sections }) => {
  const { language } = useTranslation();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { setSelectedProduct, triggerFlyToCart } = useUi();

  const { settings } = useSettings();
  const hp = settings?.homepageSections;

  const { products: allProducts, isLoading } = useHomepageBestSellers(hp, sections);

  if (isLoading || allProducts.length === 0) {
    return null;
  }

  const section = sections?.find(item => item.type === 'bestSellers' && item.visible !== false)
    ?? sections?.find(item => item.type === 'weeklySales' && item.visible !== false);
  const sectionTitleFr = section?.settings?.titleFr || hp?.bestSellersTitleFr || hp?.weeklySalesTitleFr || 'Meilleures Ventes de la Semaine';
  const sectionTitleAr = section?.settings?.titleAr || hp?.bestSellersTitleAr || hp?.weeklySalesTitleAr || 'أفضل المنتجات مبيعاً';

  const isRTL = language === 'AR';

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const clientX = e.clientX || window.innerWidth / 2;
    const clientY = e.clientY || window.innerHeight / 2;

    triggerFlyToCart(product.image, clientX, clientY);
    addToCart(product, 1);
  };

  return (
    <section className="py-10 bg-[#FAFAFA] border-b border-slate-200/40 relative overflow-hidden reveal-on-scroll">
      <div className="w-full mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        
        {/* Single Unified Header Banner */}
        <div className="relative rounded-[20px] bg-[#111827] overflow-hidden flex flex-row items-center justify-between px-6 border border-slate-800 shadow-md group h-[96px] mb-6 md:mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-[#111827] via-[#111827]/90 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 h-full w-[50%] pointer-events-none">
            <Image 
              src="https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop" 
              alt="Botanical background" 
              fill
              sizes="50vw"
              className="object-cover opacity-35 mix-blend-luminosity"
            />
          </div>
          <div className="relative z-20 flex flex-col justify-center">
            <h2 className="public-section-title text-[18px] md:text-[22px] font-black text-white tracking-tight leading-snug">
              {isRTL ? sectionTitleAr : sectionTitleFr}
            </h2>
            <span className="text-xs font-bold text-slate-200 mt-1 uppercase tracking-widest">
              {isRTL ? `${allProducts.length} منتجات` : `${allProducts.length} Produits`}
            </span>
          </div>
        </div>

        <div className={styles.grid}>
          {allProducts.map(product => {
            const title = cleanTitle(isRTL ? product.name || product.title : product.nameFr || product.title);
            const favorite = isInWishlist(product.id);
            const unavailable = (product.stock ?? 0) <= 0;
            return (
              <article key={product.id} className={cardStyles.card}>
                <button type="button" className={cardStyles.favorite} aria-label={(isRTL ? 'المفضلة: ' : 'Favoris : ') + title} aria-pressed={favorite} onClick={() => toggleWishlist(product)}>
                  <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
                </button>
                <button type="button" className={cardStyles.image} onClick={() => handleSelectProduct(product)} aria-label={(isRTL ? 'عرض ' : 'Voir ') + title}>
                  <Image src={getOptimizedImageUrl(product.image) || PRODUCT_IMAGE_FALLBACK} alt={title} fill sizes="(max-width: 600px) 100px, 140px" />
                </button>
                <div className={cardStyles.content}>
                  <div className={cardStyles.identity}><span data-product-brand className={cardStyles.vendor}>{product.vendor}</span></div>
                  <button type="button" className={cardStyles.name} onClick={() => handleSelectProduct(product)}>{title}</button>
                  {product.reviews > 0 && product.rating > 0 ? (
                    <div className={cardStyles.rating} aria-label={product.rating.toFixed(1) + ' / 5'}>
                      <span className={cardStyles.stars} aria-hidden="true">{[1, 2, 3, 4, 5].map(star => <Star key={star} size={14} fill={star <= Math.round(product.rating) ? 'currentColor' : 'none'} />)}</span>
                      <span>{product.rating.toFixed(1)} ({product.reviews} {isRTL ? 'تقييم' : 'avis'})</span>
                    </div>
                  ) : <p className={cardStyles.noReviews}>{isRTL ? 'لا توجد تقييمات بعد' : 'Pas encore d’avis'}</p>}
                  <div className={cardStyles.purchase}>
                    <div className={cardStyles.prices}>
                      <strong>{product.price.toFixed(2)} DH</strong>
                      {product.comparePrice > product.price && <del>{product.comparePrice.toFixed(2)} DH</del>}
                    </div>
                    <button type="button" className={`${cardStyles.add} public-cta`} disabled={unavailable} onClick={e => handleQuickAdd(product, e)}>
                      <ShoppingCart size={18} aria-hidden="true" />
                      {unavailable ? (isRTL ? 'غير متوفر' : 'Rupture de stock') : (isRTL ? 'إضافة إلى السلة' : 'Ajouter au panier')}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
