'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Check, Droplets, Heart, Leaf, ShoppingCart, Sparkles, Sun } from 'lucide-react';
import { Product } from '@/lib/data';
import { useProducts } from '@/context/ProductsContext';
import { useTranslation } from '@/context/LanguageContext';
import { useUi } from '@/context/UiContext';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { useCurrency } from '@/context/CurrencyContext';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { PRODUCT_IMAGE_FALLBACK } from '@/lib/public-images';
import { useGalleryOverrides } from '@/lib/useGalleryOverrides';
import styles from './SummerSalePromo.module.css';

export const SummerSalePromo: React.FC = () => {
  const { language } = useTranslation();
  const { products } = useProducts();
  const { settings } = useSettings();
  const { convertPrice } = useCurrency();
  const { getDisplayImage } = useGalleryOverrides();
  const { setSelectedProduct } = useUi();
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState<number | null>(null);
  const hp = settings?.homepageSections;
  const section = hp?.sectionOrder?.find(s => s.type === 'summerSale');
  const campaign = section?.settings as { endsAt?: string; endDate?: string } | undefined;
  const campaignDeadline = campaign?.endsAt || campaign?.endDate || null;
  const leftImage = getDisplayImage(section?.settings?.leftImage || hp?.summerSaleLeftImage || '/images/cicaplast_bundle.webp', 'cicaplast_bundle');
  const rightImage = getDisplayImage(section?.settings?.rightImage || hp?.summerSaleRightImage || '/images/vichy_sunscreen_bundle.webp', 'vichy_sunscreen_bundle');
  const isAR = language === 'AR';
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const deadline = campaignDeadline ? new Date(campaignDeadline).getTime() : NaN;
    if (!Number.isFinite(deadline)) { setRemaining(0); return; }
    const update = () => setRemaining(Math.max(0, deadline - Date.now()));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [campaignDeadline]);

  useEffect(() => {
    if (addedId === null) return;
    const timer = setTimeout(() => setAddedId(null), 1800);
    return () => clearTimeout(timer);
  }, [addedId]);

  const items = useMemo(() => {
    const curatedIds = hp?.summerSaleProductIds || [];
    const selection = curatedIds.length
      ? curatedIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => !!p)
      : products.filter(p => p.status !== 'draft' && (p.stock ?? 0) > 0 && p.comparePrice > p.price).slice(0, 4);
    return selection.filter(p => p.status !== 'draft' && (p.stock ?? 0) > 0).slice(0, 4);
  }, [products, hp]);

  if (!(hp?.showSummerSale ?? true) || items.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="summer-offer-title" dir={isAR ? 'rtl' : 'ltr'}>
      <div className={styles.frame}>
        <div className={styles.campaign}>
          <div className={styles.photo}>
            <Image src={getOptimizedImageUrl(leftImage) || PRODUCT_IMAGE_FALLBACK} alt={isAR ? 'مجموعة العناية الصيفية' : 'Sélection de soins pour l’été'} fill sizes="(min-width: 1024px) 28vw, 48vw" className={styles.campaignImage} />
            <p className={styles.photoCaption}>{isAR ? <>بشرة أجمل<br />هذا الصيف</> : <>Une peau<br />plus belle<br />cet été</>}</p>
          </div>
          <div className={styles.offer}>
            <div className={styles.badges}>
              <span className={styles.selected}><Sparkles size={15} aria-hidden="true" />{isAR ? 'عرض مختار' : 'Offre sélectionnée'}</span>
              <span className={styles.available}><Droplets size={15} aria-hidden="true" />{isAR ? 'متاح الآن' : 'Disponible'}</span>
            </div>
            <h2 id="summer-offer-title">{isAR ? 'عروض الصيف' : 'Offres d’été'}</h2>
            <p className={styles.description}>{isAR ? 'اكتشفي مجموعتنا من المنتجات المخفضة لصيف مليء بالراحة والعناية.' : 'Découvrez notre sélection de produits remisés pour un été tout en bien-être.'}</p>
            <ul className={styles.benefits}>
              <li><Leaf aria-hidden="true" /><span>{isAR ? 'عناية للجميع' : <>Des soins<br />pour tous</>}</span></li>
              <li><Sun aria-hidden="true" /><span>{isAR ? 'بشرة محمية' : <>Une peau<br />protégée</>}</span></li>
              <li><Heart aria-hidden="true" /><span>{isAR ? 'المزيد من الراحة' : <>Plus de<br />bien-être</>}</span></li>
            </ul>
            {campaignDeadline && remaining > 0 && <div className={styles.countdown} dir="ltr" aria-label={isAR ? 'الوقت المتبقي للعرض' : 'Temps restant pour cette offre'}>
              {Math.floor(remaining / 86400000)}j · {String(Math.floor(remaining / 3600000) % 24).padStart(2, '0')}h · {String(Math.floor(remaining / 60000) % 60).padStart(2, '0')}m · {String(Math.floor(remaining / 1000) % 60).padStart(2, '0')}s
            </div>}
            <button type="button" className={styles.discover} onClick={() => document.getElementById('boutique-grid')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}>
              {isAR ? 'اكتشف المنتجات' : 'Découvrir les produits'}<ArrowRight size={19} aria-hidden="true" />
            </button>
          </div>
          <div className={styles.photo}>
            <Image src={getOptimizedImageUrl(rightImage) || PRODUCT_IMAGE_FALLBACK} alt={isAR ? 'العناية الشمسية للصيف' : 'Sélection de soins solaires pour l’été'} fill sizes="(min-width: 1024px) 28vw, 48vw" className={styles.campaignImage} />
            <p className={styles.photoCaption}>{isAR ? <>الصيف<br />بكل ثقة</> : <>L’été<br />en toute<br />confiance</>}</p>
          </div>
        </div>
        <div className={styles.products}>
          {items.map(item => {
            const name = isAR ? item.name || item.nameFr || item.title : item.nameFr || item.title;
            const discount = item.comparePrice > item.price ? Math.round((1 - item.price / item.comparePrice) * 100) : 0;
            return <article key={item.id} className={styles.product}>
              <button type="button" className={styles.productOpen} onClick={() => setSelectedProduct(item)} aria-label={(isAR ? 'عرض ' : 'Voir ') + name}>
                <span className={styles.productImage}><Image src={getOptimizedImageUrl(item.image) || PRODUCT_IMAGE_FALLBACK} alt="" fill sizes="(min-width: 1280px) 100px, 80px" /></span>
                <span className={styles.productInfo}>
                  <span className={styles.productName}>{name}</span>
                  <span className={styles.price}>{convertPrice(item.price)}</span>
                  {item.comparePrice > item.price && <del className={styles.oldPrice}>{convertPrice(item.comparePrice)}</del>}
                </span>
              </button>
              {discount > 0 && <span className={styles.discount}>-{discount}%</span>}
              <button type="button" className={styles.add} onClick={() => { addToCart(item, 1); setAddedId(item.id); }} aria-label={isAR ? 'أضف ' + name + ' إلى السلة' : 'Ajouter ' + name + ' au panier'}>
                {addedId === item.id ? <Check size={18} /> : <ShoppingCart size={18} />}
              </button>
            </article>;
          })}
        </div>
        <span className={styles.srOnly} role="status">{addedId !== null ? (isAR ? 'تمت الإضافة إلى السلة' : 'Produit ajouté au panier') : ''}</span>
      </div>
    </section>
  );
};
