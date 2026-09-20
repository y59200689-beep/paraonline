'use client';

import React from 'react';
import { Product } from '@/lib/data';
import { useProducts } from '@/context/ProductsContext';
import { useWishlist } from '@/context/WishlistContext';
import { useTranslation } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { Star, Heart, ShoppingCart, Flame } from 'lucide-react';
import { useUi } from '@/context/UiContext';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { PRODUCT_IMAGE_FALLBACK } from '@/lib/public-images';
import { useSettings } from '@/context/SettingsContext';
import { useGalleryOverrides } from '@/lib/useGalleryOverrides';
import styles from './TopRatedAsymmetricGrid.module.css';
import { formatPriceDH } from '@/lib/format-price';
import { selectReviewedProducts } from '@/lib/reviewed-products';

const cleanTitle = (title: string) => {
  return title
    .replace(/=\s*TROUSSE\s*OFFERTE/gi, '')
    .replace(/=\s*Tote\s*Bag\s*Offert/gi, '')
    .replace(/=\s*Coffret\s*Cadeau\s*Offert/gi, '')
    .trim();
};


export const TopRatedAsymmetricGrid: React.FC = () => {
  const { language } = useTranslation();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { setSelectedProduct, triggerFlyToCart } = useUi();
  const { products, isLoading } = useProducts();

  const { settings } = useSettings();
  const { getDisplayImage } = useGalleryOverrides();
  const hp = settings?.homepageSections;

  const showSection = hp?.showTopRated ?? true;
  const [approvedReviews, setApprovedReviews] = React.useState<Array<{ productId: number; rating: number }>>([]);
  React.useEffect(() => {
    if (!showSection) return;
    const controller = new AbortController();
    // This public endpoint returns approved reviews only.
    fetch('/api/reviews', { signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (!controller.signal.aborted && data?.success && Array.isArray(data.reviews)) {
          setApprovedReviews(data.reviews);
        }
      })
      .catch(() => { /* No unverified fallback on a review-service failure. */ });
    return () => controller.abort();
  }, [showSection]);

  // Curated IDs never bypass the review requirement.
  const topRatedProducts = React.useMemo(() => {
    return selectReviewedProducts(products, approvedReviews, hp?.topRatedProductIds);
  }, [products, approvedReviews, hp?.topRatedProductIds]);

  if (isLoading || !showSection || topRatedProducts.length === 0) {
    return null;
  }

  const titleFr = hp?.topRatedTitleFr || 'Produits les Mieux Notés';
  const titleAr = hp?.topRatedTitleAr || 'المنتجات الأعلى تقييماً';

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

  const renderCard = (product: Product, featured = false) => {
    const title = cleanTitle(language === 'AR' ? product.name || product.title : product.nameFr || product.title);
    const favorite = isInWishlist(product.id);
    const discount = product.comparePrice > product.price ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;
    const unavailable = (product.stock ?? 0) <= 0;
    return (
      <article key={product.id} className={featured ? styles.featured : styles.card}>
        <button type="button" className={styles.favorite} aria-label={(language === 'AR' ? 'المفضلة: ' : 'Favoris : ') + title} aria-pressed={favorite} onClick={() => toggleWishlist(product)}>
          <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
        </button>
        <button type="button" className={styles.image} onClick={() => handleSelectProduct(product)} aria-label={(language === 'AR' ? 'عرض ' : 'Voir ') + title}>
          <Image src={getOptimizedImageUrl(product.image) || PRODUCT_IMAGE_FALLBACK} alt={title} fill sizes={featured ? '(max-width: 1023px) 90vw, 33vw' : '(max-width: 600px) 100px, 140px'} />
        </button>
        {featured && <span className={styles.popular}><Flame size={17} />{language === 'AR' ? 'تقييمات العملاء' : 'Avis clients'}</span>}
        <div className={styles.content}>
          <div className={styles.identity}>
            {featured && <span className={styles.eyebrow}>{language === 'AR' ? 'عناية فائقة' : 'Soin premium'}</span>}
            <span data-product-brand className={styles.vendor}>{product.vendor}</span>
          </div>
          <button type="button" className={styles.name} onClick={() => handleSelectProduct(product)}>{title}</button>
          {product.reviews > 0 && product.rating > 0 ? <div className={styles.rating} aria-label={product.rating.toFixed(1) + ' / 5'}>
            <span className={styles.stars} aria-hidden="true">{[1, 2, 3, 4, 5].map(n => <Star key={n} size={14} fill={n <= Math.round(product.rating) ? 'currentColor' : 'none'} />)}</span>
            <span>{product.rating.toFixed(1)} ({product.reviews} {language === 'AR' ? 'تقييم' : 'avis'})</span>
          </div> : <p className={styles.noReviews}>{language === 'AR' ? 'لا توجد تقييمات بعد' : 'Pas encore d’avis'}</p>}
          <div className={styles.purchase}>
            <div className={styles.prices}>
              <strong>{formatPriceDH(product.price)}</strong>
              {product.comparePrice > product.price && <del>{formatPriceDH(product.comparePrice)}</del>}
              {discount > 0 && <span className={styles.discount}>-{discount}%</span>}
            </div>
            <button type="button" className={`${styles.add} public-cta`} disabled={unavailable} onClick={e => handleQuickAdd(product, e)}>
              <ShoppingCart size={18} aria-hidden="true" />
              {unavailable ? (language === 'AR' ? 'غير متوفر' : 'Rupture de stock') : (language === 'AR' ? 'إضافة إلى السلة' : 'Ajouter au panier')}
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <section className="py-10 bg-[#FAFAFA] border-b border-slate-200/40 relative overflow-hidden reveal-on-scroll">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">

        {/* Section Dark Title Card Banner — slim compact design matching reference */}
        <div className="relative rounded-[20px] bg-[#111827] overflow-hidden flex flex-row items-center justify-between px-6 md:px-8 border border-slate-800 shadow-lg mb-7 group" style={{ height: '72px' }}>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#111827] via-[#111827]/90 to-transparent pointer-events-none z-10" />
          
          {/* Botanical fading image on the right */}
          <div className="absolute right-0 top-0 h-full w-[55%] pointer-events-none">
            <Image 
              src={getDisplayImage("https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=1200&auto=format&fit=crop", "skincare_brand_banner")} 
              alt="Botanical background" 
              fill
              sizes="50vw"
              className="object-cover opacity-40 mix-blend-luminosity"
            />
          </div>

          {/* Left: heading block */}
          <div className="relative z-20 flex flex-row items-center gap-4">
            <h2 className="public-section-title text-[15px] md:text-[17px] font-black text-white leading-none tracking-tight">
              {language === 'AR' ? titleAr : titleFr}
            </h2>
            <span className="hidden sm:block text-xs font-semibold text-slate-200 border-l border-slate-700 pl-4">
            {language === 'AR' ? `${topRatedProducts.length} منتجات مختارة بعناية` : `${topRatedProducts.length} produits sélectionnés`}
            </span>
          </div>

          {/* Right: product count */}
          <div className="relative z-20 flex items-center gap-2 shrink-0">
            <span className="text-xs font-black uppercase tracking-widest text-slate-200">
              {language === 'AR' ? 'منتجات' : 'PRODUITS'}
            </span>
            <span className="text-[22px] font-heading font-black text-white leading-none">
              {topRatedProducts.length}
            </span>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.column}>{topRatedProducts.slice(0, 3).map(product => renderCard(product))}</div>
          {topRatedProducts[3] && renderCard(topRatedProducts[3], true)}
          <div className={styles.column}>{topRatedProducts.slice(4, 7).map(product => renderCard(product))}</div>
        </div>
      </div>
    </section>
  );
};
