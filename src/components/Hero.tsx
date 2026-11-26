'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { featuredBrandCatalog } from '@/lib/featured-brand-catalog';
import { ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { useGalleryOverrides } from '@/lib/useGalleryOverrides';
import styles from './Hero.module.css';

interface HeroProps { onOpenDiagnostic: () => void; onSelectCategory?: (category: string) => void; }
const defaults = [
  { titleFr: 'Découvrez nos offres du moment', titleAr: 'اكتشفي عروضنا الحالية', descFr: 'Une sélection de soins et de produits K-Beauty appréciés au Maroc, pour votre routine beauté.', descAr: 'مجموعة من منتجات العناية والجمال الكوري المختارة لروتينك اليومي.', ctaFr: 'Je profite des offres', ctaAr: 'اكتشفي الآن', tagFr: "L'ÉVÉNEMENT BEAUTÉ DE L'ANNÉE", tagAr: 'جمال · صحة · عناية', key: 'hero_bestsellers', image: '/images/hero-black-friday.webp', category: 'offers' },
  { titleFr: 'Duo de soins. Duo de bons plans.', titleAr: 'ثنائي العناية. ثنائي التوفير.', descFr: 'Vos essentiels beauté réunis en packs à prix réduit.', descAr: 'أساسيات الجمال في مجموعات بأسعار مخفضة.', ctaFr: 'Voir les packs', ctaAr: 'تصفحي المجموعات', tagFr: 'Les packs Black Friday', tagAr: 'مجموعات بلاك فرايدي', key: 'hero_summersale', image: '/images/hero-black-friday-packs.webp', category: 'coffrets' },
  { titleFr: 'Les prix chutent.', titleAr: 'عروض الأسبوع', descFr: 'De grandes marques à petits prix.', descAr: 'منتجات مختارة بأسعار مميزة', ctaFr: 'Voir les offres', ctaAr: 'شاهدي المختارات', tagFr: 'À ne pas manquer', tagAr: '', key: 'hero_weeklypromo', image: '/images/hero-weekly-sale-tag.webp', category: 'offers' },
  { titleFr: 'Nos Packs', titleAr: 'مجموعاتنا', descFr: 'Des routines complètes à prix exceptionnels.', descAr: 'روتين عناية متكامل بأسعار استثنائية.', ctaFr: 'Découvrir nos packs', ctaAr: 'اكتشفي مجموعاتنا', tagFr: 'Black Friday', tagAr: 'بلاك فرايدي', key: 'hero_newarrivals', image: '/images/hero-kbeauty-gift-box.webp', category: 'coffrets' },
];
const legacyTitles = ['Nos Meilleures Ventes Produits', 'Nos meilleures ventes', "Offres d'Été", 'Promotion De La Semaine', 'Nouveaux Produits'];

export const Hero: React.FC<HeroProps> = ({ onOpenDiagnostic }) => {
  const router = useRouter();
  const { language } = useTranslation();
  const { settings } = useSettings();
  const { getDisplayImage } = useGalleryOverrides();
  const ar = language === 'AR';
  const cards = defaults.map((fallback, index) => {
    const configured = index === 1 || index === 3 ? undefined : settings?.banners?.[index];
    const title = ar ? (configured?.titleAr && configured.titleAr !== 'عروض الصيف' ? configured.titleAr : fallback.titleAr) : (configured?.titleFr && !legacyTitles.includes(configured.titleFr) && index !== 2 ? configured.titleFr : fallback.titleFr);
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
  // The Vercel image optimizer can be unavailable when the account's image
  // optimization billing is paused. These local WebP assets are already
  // optimized, so serve them directly and keep the hero visible.
  const picture = (index: number, main = false) => <Image src={cards[index].image} alt="" fill sizes={main ? '(max-width: 1023px) 100vw, 52vw' : '(max-width: 639px) 50vw, 24vw'} preload={main && index === 0} unoptimized className={styles.image} />;
  return <section className={'hero-section ' + styles.section} aria-label={ar ? 'مختارات الجمال والعروض' : 'Sélection beauté et offres'} dir={ar ? 'rtl' : 'ltr'}>
    <div className={styles.grid}>
      <article className={`${styles.main} ${ar ? '' : styles.blackFriday}`} aria-label={ar ? 'اكتشفي مختاراتنا' : 'Découvrez nos sélections'}>
        <div className={styles.slide}>{picture(0, true)}</div>
        <div className={styles.wash} />
        <div className={styles.mainCopy}>
          <span className={styles.eyebrow}>{ar ? current.tagAr : current.tagFr}</span>
          {ar ? (
            <><h1>{current.title}</h1><p>{current.description}</p></>
          ) : (
            <>
              <h1>BLACK <span>FRIDAY.</span></h1>
              <p>Vos soins préférés à des <strong>prix exceptionnels</strong></p>
            </>
          )}
          <Link className={`${styles.cta} ${styles.mainLink} public-cta`} href={featuredBrandCatalog}>{current.cta}<Arrow size={18} aria-hidden="true" /></Link>
        </div>
      </article>
      <article className={styles.summer}>
        {picture(1)}<div className={styles.sideWash} />
        <div className={styles.summerCopy}>
          <span className={styles.eyebrow}>{ar ? cards[1].tagAr : cards[1].tagFr}</span>
          <h2>{ar ? cards[1].title : <>Duo de soins. <br />Duo de <span>bons plans.</span></>}</h2>
          <p>{cards[1].description}</p>
          <button type="button" className={`${styles.cta} public-cta`} onClick={cards[1].action}>
            {cards[1].cta}<Arrow size={17} />
          </button>
        </div>
      </article>
      <div className={styles.stack}>{[2, 3].map(index => <article key={index} className={index === 2 ? styles.promotion : styles.new}>
        {picture(index)}<div className={styles.sideWash} /><div className={styles.smallCopy}>
          {index === 3 ? (
            <span className={styles.packBadge}><Tag size={13} aria-hidden="true" />
              {ar ? cards[index].tagAr : <>Black <span>Friday</span></>}
            </span>
          ) : !ar && <span className={styles.eyebrow}>{cards[index].tagFr}</span>}
          <h2>{ar ? cards[index].title : index === 2 ? <>Les prix <span>chutent.</span></> : <>Nos <span>Packs</span></>}</h2>
          <p>{cards[index].description}</p>
          <button type="button" className={`${styles.cta} public-cta`} onClick={cards[index].action}>
            {cards[index].cta}<Arrow size={16} />
          </button>
        </div>
      </article>)}</div>
    </div>
  </section>;
};
