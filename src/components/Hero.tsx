'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { useGalleryOverrides } from '@/lib/useGalleryOverrides';
import { shouldBypassNextImageOptimization } from '@/lib/public-images';
import styles from './Hero.module.css';

interface HeroProps { onOpenDiagnostic: () => void; onSelectCategory?: (category: string) => void; }
const defaults = [
  { titleFr: 'Découvrez nos Meilleures Ventes', titleAr: 'اكتشفي منتجاتنا الأكثر مبيعاً', descFr: 'Une sélection de soins et de produits K-Beauty appréciés au Maroc, pour votre routine beauté.', descAr: 'مجموعة من منتجات العناية والجمال الكوري المختارة لروتينك اليومي.', ctaFr: 'Je découvre', ctaAr: 'اكتشفي الآن', tagFr: 'Beauté · Santé · Bien-être', tagAr: 'جمال · صحة · عناية', key: 'hero_bestsellers', image: '/images/hero-editorial-bestsellers.webp', category: 'offers' },
  { titleFr: 'Offres d’Été', titleAr: 'عروض الصيف', descFr: 'Des soins solaires, hydratants et bien plus encore…', descAr: 'حماية من الشمس وترطيب والمزيد…', ctaFr: 'Voir les offres', ctaAr: 'شاهدي العروض', tagFr: 'Offres spéciales', tagAr: 'عروض خاصة', key: 'hero_summersale', image: '/images/hero-editorial-summer.webp', category: 'solaire' },
  { titleFr: 'Promotion de la semaine', titleAr: 'عروض الأسبوع', descFr: 'Des marques de qualité à prix doux !', descAr: 'منتجات مختارة بأسعار مميزة', ctaFr: 'Voir la sélection', ctaAr: 'شاهدي المختارات', tagFr: '', tagAr: '', key: 'hero_weeklypromo', image: '/images/hero-editorial-promotion.webp', category: 'offers' },
  { titleFr: 'K-Beauty', titleAr: 'الجمال الكوري', descFr: 'Les dernières pépites pour votre routine beauté.', descAr: 'اكتشفي الجديد لروتين جمالك.', ctaFr: 'Découvrir', ctaAr: 'اكتشفي', tagFr: 'Nouveautés', tagAr: 'الجديد', key: 'hero_newarrivals', image: '/images/hero-editorial-kbeauty.webp', category: 'kbeauty' },
];
const legacyTitles = ['Nos Meilleures Ventes Produits', 'Nos meilleures ventes', "Offres d'Été", 'Promotion De La Semaine', 'Nouveaux Produits'];

export const Hero: React.FC<HeroProps> = ({ onOpenDiagnostic }) => {
  const router = useRouter();
  const { language } = useTranslation();
  const { settings } = useSettings();
  const { getDisplayImage } = useGalleryOverrides();
  const ar = language === 'AR';
  const cards = defaults.map((fallback, index) => {
    const configured = settings?.banners?.[index];
    const title = ar ? (configured?.titleAr || fallback.titleAr) : (configured?.titleFr && !legacyTitles.includes(configured.titleFr) ? configured.titleFr : fallback.titleFr);
    return {
      ...fallback, title,
      description: ar ? (configured?.descAr || fallback.descAr) : (index === 0 ? configured?.descFr || fallback.descFr : fallback.descFr),
      cta: ar ? configured?.ctaAr || fallback.ctaAr : fallback.ctaFr,
      // New artwork slots keep legacy baked-in headlines out of the editorial design.
      image: getDisplayImage(fallback.image, fallback.key + '_editorial'),
      action: () => {
        if (configured?.linkType === 'diagnostic') return onOpenDiagnostic();
        const value = configured?.linkValue;
        if (value && /^https?:\/\//i.test(value)) { window.open(value, '_blank', 'noopener,noreferrer'); return; }
        if (value?.startsWith('/') && !value.startsWith('//')) return router.push(value);
        router.push('/products?category=' + encodeURIComponent(value || fallback.category));
      },
    };
  });
  const current = cards[0];
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const picture = (index: number, main = false) => <Image src={cards[index].image} alt="" fill sizes={main ? '(max-width: 1023px) 100vw, 52vw' : '(max-width: 639px) 50vw, 24vw'} preload={main && index === 0} unoptimized={shouldBypassNextImageOptimization(cards[index].image)} className={styles.image} />;
  return <section className={'hero-section ' + styles.section} aria-label={ar ? 'مختارات الجمال والعروض' : 'Sélection beauté et offres'} dir={ar ? 'rtl' : 'ltr'}>
    <div className={styles.grid}>
      <article className={styles.main} aria-label={ar ? 'اكتشفي مختاراتنا' : 'Découvrez nos sélections'}>
        <div className={styles.slide}>{picture(0, true)}</div>
        <div className={styles.wash} />
        <div className={styles.mainCopy}>
          <span className={styles.eyebrow}>{ar ? current.tagAr : current.tagFr}</span>
          <h1>{current.title}</h1><p>{current.description}</p>
          <button type="button" className={`${styles.cta} public-cta`} onClick={current.action}>{current.cta}<Arrow size={18} /></button>
        </div>
      </article>
      <article className={styles.summer}>
        {picture(1)}<div className={styles.sideWash} />
        <div className={styles.summerCopy}><span className={styles.eyebrow}>{ar ? cards[1].tagAr : cards[1].tagFr}</span><h2>{cards[1].title}</h2><p>{cards[1].description}</p><button type="button" className={`${styles.cta} public-cta`} onClick={cards[1].action}>{cards[1].cta}<Arrow size={17} /></button></div>
      </article>
      <div className={styles.stack}>{[2, 3].map(index => <article key={index} className={index === 2 ? styles.promotion : styles.new}>
        {picture(index)}<div className={styles.sideWash} /><div className={styles.smallCopy}>
          {index === 3 && <span className={styles.eyebrow}>{ar ? cards[index].tagAr : cards[index].tagFr}</span>}
          <h2>{cards[index].title}</h2><p>{cards[index].description}</p><button type="button" className={`${styles.cta} public-cta`} onClick={cards[index].action}>{cards[index].cta}<Arrow size={16} /></button>
        </div>
      </article>)}</div>
    </div>
  </section>;
};
