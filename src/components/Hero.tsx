'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { Sparkles, Shield, Activity, ArrowRight, ArrowLeft } from 'lucide-react';
import { gsap } from 'gsap';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { useGalleryOverrides } from '@/lib/useGalleryOverrides';

interface HeroProps {
  onOpenDiagnostic: () => void;
  onSelectCategory: (category: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDiagnostic, onSelectCategory }) => {
  const { language } = useTranslation();
  const { settings } = useSettings();
  const { getDisplayImage } = useGalleryOverrides();
  const isRTL = language === 'AR';
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    // Reset before animating
    gsap.set(containerRef.current.querySelectorAll('.hero-card-gsap'), { clearProps: 'all' });
    gsap.set(containerRef.current.querySelectorAll('.hero-word-char'), { clearProps: 'all' });

    // Animate cards
    gsap.fromTo(
      containerRef.current.querySelectorAll('.hero-card-gsap'),
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
      }
    );

    // Animate heading words
    gsap.fromTo(
      containerRef.current.querySelectorAll('.hero-word-char'),
      { y: '100%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power2.out',
        delay: 0.3,
      }
    );
  }, [mounted]);

  // Helper to safely navigate custom banner actions
  const getBannerAction = (banner: { linkType?: string; linkValue?: string }) => {
    if (!banner) return () => {};
    if (banner.linkType === 'category' && banner.linkValue) {
      return () => onSelectCategory(banner.linkValue!);
    }
    if (banner.linkType === 'diagnostic') {
      return onOpenDiagnostic;
    }
    if (banner.linkValue?.startsWith('http')) {
      return () => window.open(banner.linkValue, '_blank');
    }
    return () => {};
  };

  const customBanners = settings?.banners?.length ? settings.banners : null;

  // Localized copy content for each grid card
  const CARDS = {
    card1: {
      tag_fr: customBanners ? customBanners[0].tagFr : '🔥 LES PLUS VENDUS · SELECTION ÉLITE',
      tag_ar: customBanners ? customBanners[0].tagAr : '🔥 الأكثر مبيعاً · تشكيلة فاخرة',
      title_fr: customBanners ? customBanners[0].titleFr : 'Nos Meilleures Ventes Produits',
      title_ar: customBanners ? customBanners[0].titleAr : 'أفضل المنتجات والأكثر مبيعاً',
      desc_fr: customBanners ? customBanners[0].descFr : 'Découvrez les soins dermo-cliniques et pépites K-Beauty les plus plébiscités par nos clientes au Maroc. Formules certifiées, résultats prouvés et livraison gratuite.',
      desc_ar: customBanners ? customBanners[0].descAr : 'اكتشفي أفضل مستحضرات العناية الكورية والطبية الأكثر طلباً في المغرب. نتائج مثبتة وتوصيل مجاني.',
      cta_fr: customBanners ? customBanners[0].ctaFr : 'Explorer les Best-Sellers',
      cta_ar: customBanners ? customBanners[0].ctaAr : 'تسوقي الأكثر مبيعاً',
      bgImage: getDisplayImage((customBanners && customBanners[0]?.bgImage) || '/images/hero_bestsellers.webp', 'hero_bestsellers'),
      action: customBanners ? getBannerAction(customBanners[0]) : () => onSelectCategory('offers'),
    },
    card2: {
      tag_fr: customBanners ? customBanners[1].tagFr : '☀️ SUMMER SALE · JUSQU\'À -40%',
      tag_ar: customBanners ? customBanners[1].tagAr : '☀️ عروض الصيف · خصم حتى 40%',
      title_fr: customBanners ? customBanners[1].titleFr : 'Offres d\'Été',
      title_ar: customBanners ? customBanners[1].titleAr : 'عروض الصيف والباقات الشمسية',
      cta_fr: customBanners ? customBanners[1].ctaFr : 'Profiter des Offres',
      cta_ar: customBanners ? customBanners[1].ctaAr : 'استفيدي من العروض',
      bgImage: getDisplayImage((customBanners && customBanners[1]?.bgImage) || '/images/hero_summersale.webp', 'hero_summersale'),
      action: customBanners ? getBannerAction(customBanners[1]) : () => onSelectCategory('solaire'),
    },
    card3: {
      tag_fr: customBanners ? customBanners[2].tagFr : '⚡ PROMO HEBDO · JUSQU\'À -35%',
      tag_ar: customBanners ? customBanners[2].tagAr : '⚡ تخفيضات الأسبوع · خصم حتى 35%',
      title_fr: customBanners ? customBanners[2].titleFr : 'Promotion De La Semaine',
      title_ar: customBanners ? customBanners[2].titleAr : 'عروض الأسبوع السريعة',
      cta_fr: customBanners ? customBanners[2].ctaFr : 'Voir les Promos',
      cta_ar: customBanners ? customBanners[2].ctaAr : 'شاهد العروض',
      bgImage: getDisplayImage((customBanners && customBanners[2]?.bgImage) || '/images/hero_weeklypromo_v2.webp', 'hero_weeklypromo'),
      action: customBanners ? getBannerAction(customBanners[2]) : () => onSelectCategory('offers'),
    },
    card4: {
      tag_fr: customBanners ? customBanners[3].tagFr : '✨ NOUVEAUTÉS · DERNIERS ARRIVAGES',
      tag_ar: customBanners ? customBanners[3].tagAr : '✨ المنتجات الجديدة · أحدث الوصولات',
      title_fr: customBanners ? customBanners[3].titleFr : 'Nouveaux Produits',
      title_ar: customBanners ? customBanners[3].titleAr : 'جديد العناية والجمال الكوري',
      cta_fr: customBanners ? customBanners[3].ctaFr : 'Découvrir la Nouveauté',
      cta_ar: customBanners ? customBanners[3].ctaAr : 'اكتشفي الجديد',
      bgImage: getDisplayImage((customBanners && customBanners[3]?.bgImage) || '/images/hero_newarrivals.webp', 'hero_newarrivals'),
      action: customBanners ? getBannerAction(customBanners[3]) : () => onSelectCategory('kbeauty'),
    },
  };

  const titleText = isRTL ? CARDS.card1.title_ar : CARDS.card1.title_fr;
  const titleWords = titleText.split(' ');

  return (
    <section ref={containerRef} className="hero-section w-full bg-background !pt-3 !pb-6 md:!pt-4 md:!pb-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Editorial Responsive Layout */}
        <div 
          className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          
          {/* Card 1: Left Main Banner (Spans 2 columns, full height) */}
          <div 
            onClick={CARDS.card1.action}
            className="hero-card-gsap md:col-span-2 lg:col-span-2 relative group overflow-hidden rounded-3xl ring-1 ring-black/6 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer h-[280px] md:h-[480px] lg:h-[520px] shimmer-sweep-1 card-press-feedback"
            style={{ opacity: mounted ? 0 : 1 }}
          >
            {/* Background image parallax — 2s ease-out-premium for visible breath */}
            <Image
              src={CARDS.card1.bgImage}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 50vw"
              priority
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ease-[var(--ease-out-premium)] group-hover:scale-[1.06]"
            />
            {/* Soft Ambient Radial/Linear Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-transparent" style={{ direction: 'ltr' }} />
            
            {/* Morphing glow blobs */}
            <div className="absolute top-1/4 left-1/4 w-56 h-56 rounded-full bg-amber-500/15 blur-3xl pointer-events-none animate-morph-blob" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none animate-morph-blob" style={{ animationDelay: '-8s' }} />

            {/* Content Container */}
            <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end text-white">
              <div className="max-w-[480px] space-y-2 md:space-y-4">
                


                {/* Heading — curtain mask wipe */}
                <span className="anim-heading-wrap">
                  <h1
                    className="active text-xl md:text-4xl font-black font-heading leading-tight tracking-tight text-white flex flex-wrap gap-x-2 drop-shadow-sm"
                  >
                    {titleWords.map((word: string, idx: number) => (
                      <span key={idx} className="inline-block overflow-hidden h-fit">
                        <span className="hero-word-char inline-block translate-y-full opacity-0">
                          {word}
                        </span>
                      </span>
                    ))}
                  </h1>
                </span>

                {/* Description — soft fade-up after heading */}
                <p
                  className="hidden sm:block text-[12px] md:text-sm text-slate-200 leading-relaxed font-normal opacity-95"
                  style={{ animation: 'body-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.65s both' }}
                >
                  {isRTL ? CARDS.card1.desc_ar : CARDS.card1.desc_fr}
                </p>

                {/* CTA Button — High-End UX/UI Button with button-in-button architecture */}
                <div className="pt-1 md:pt-2" style={{ animation: 'body-fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.8s both' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      CARDS.card1.action();
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="group/btn relative inline-flex items-center gap-4 pl-6 pr-2 py-2 text-xs font-black uppercase tracking-wider rounded-full shadow-xl shadow-emerald-950/20 hover:shadow-emerald-500/30 active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer border border-emerald-400/30 outline-none backdrop-blur-md overflow-hidden"
                    style={{
                      backgroundColor: isHovered ? 'var(--color-gold-hover, #059669)' : '#0d9488',
                      color: '#ffffff',
                    }}
                  >
                    {/* Glowing highlight sweep animation */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
                    
                    <span className="relative z-10 font-extrabold tracking-wider drop-shadow-sm">
                      {isRTL ? CARDS.card1.cta_ar : CARDS.card1.cta_fr}
                    </span>
                    
                    {/* Button-in-Button Trailing Icon Pill */}
                    <span className="relative z-10 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-all duration-500 ease-out group-hover/btn:scale-110 group-hover/btn:bg-white group-hover/btn:text-emerald-700 shadow-inner shrink-0">
                      {isRTL ? (
                        <ArrowLeft className="w-4 h-4" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Desktop Middle Tall Banner */}
          <div 
            onClick={CARDS.card2.action}
            className="hidden md:block hero-card-gsap lg:col-span-1 relative group overflow-hidden rounded-3xl ring-1 ring-black/10 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer h-[380px] md:h-[480px] lg:h-[520px] shimmer-sweep-2 card-press-feedback"
            style={{ opacity: mounted ? 0 : 1 }}
          >
            {/* Background image */}
            <Image
              src={CARDS.card2.bgImage}
              alt=""
              fill
              sizes="(max-width: 768px) 0vw, (max-width: 1024px) 25vw, 25vw"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ease-[var(--ease-out-premium)] group-hover:scale-[1.06]"
            />
            {/* Ambient visual gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

            {/* Morphing ambient glow blob */}
            <div className="absolute top-1/3 left-1/3 w-36 h-36 rounded-full bg-amber-400/20 blur-2xl pointer-events-none animate-morph-blob" />

            {/* Content Container */}
            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white">
              <div className="space-y-3">
                {/* Heading */}
                <h3 className="text-xl md:text-2xl font-black font-heading leading-tight tracking-tight text-white drop-shadow-sm">
                  {isRTL ? CARDS.card2.title_ar : CARDS.card2.title_fr}
                </h3>

                {/* Premium High Quality UI & UX Button */}
                <div className="pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      CARDS.card2.action();
                    }}
                    className="group/btn relative inline-flex items-center gap-3 pl-4 pr-1.5 py-1.5 text-[10.5px] font-black uppercase tracking-wider rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 ease-out cursor-pointer border border-emerald-400/30 outline-none backdrop-blur-md overflow-hidden active:scale-95"
                  >
                    <span className="relative z-10 font-black tracking-wider">
                      {isRTL ? CARDS.card2.cta_ar : CARDS.card2.cta_fr}
                    </span>
                    <span className="relative z-10 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:bg-white group-hover/btn:text-emerald-700 shrink-0">
                      {isRTL ? (
                        <ArrowLeft className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Stack for Desktop Cards 3 & 4 */}
          <div className="hidden md:flex lg:col-span-1 flex-col gap-6 justify-between">
            
            {/* Card 3: Top Half Card */}
            <div 
              onClick={CARDS.card3.action}
              className="hero-card-gsap relative group overflow-hidden rounded-2xl ring-1 ring-black/10 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer h-[178px] md:h-[228px] lg:h-[248px] shimmer-sweep-3 card-press-feedback"
              style={{ opacity: mounted ? 0 : 1 }}
            >
              {/* Background image */}
              <Image
                src={CARDS.card3.bgImage}
                alt=""
                fill
                sizes="(max-width: 768px) 0vw, (max-width: 1024px) 25vw, 25vw"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ease-[var(--ease-out-premium)] group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

              {/* Content Container */}
              <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                <div className="space-y-2">
                  <h3 className="text-base md:text-lg font-black font-heading leading-tight tracking-tight text-white drop-shadow-sm">
                    {isRTL ? CARDS.card3.title_ar : CARDS.card3.title_fr}
                  </h3>

                  <div className="pt-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        CARDS.card3.action();
                      }}
                      className="group/btn relative inline-flex items-center gap-2 pl-3.5 pr-1 py-1 text-[9.5px] font-black uppercase tracking-wider rounded-full shadow-md bg-rose-600 hover:bg-rose-500 text-white transition-all duration-300 ease-out cursor-pointer border border-rose-300/30 outline-none backdrop-blur-md overflow-hidden active:scale-95"
                    >
                      <span className="relative z-10 font-black tracking-wider">
                        {isRTL ? CARDS.card3.cta_ar : CARDS.card3.cta_fr}
                      </span>
                      <span className="relative z-10 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:bg-white group-hover/btn:text-rose-700 shrink-0">
                        {isRTL ? (
                          <ArrowLeft className="w-3 h-3" />
                        ) : (
                          <ArrowRight className="w-3 h-3" />
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Bottom Half Card */}
            <div 
              onClick={CARDS.card4.action}
              className="hero-card-gsap relative group overflow-hidden rounded-2xl ring-1 ring-black/10 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer h-[178px] md:h-[228px] lg:h-[248px] shimmer-sweep-3 card-press-feedback"
              style={{ opacity: mounted ? 0 : 1 }}
            >
              {/* Background image */}
              <Image
                src={CARDS.card4.bgImage}
                alt=""
                fill
                sizes="(max-width: 768px) 0vw, (max-width: 1024px) 25vw, 25vw"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ease-[var(--ease-out-premium)] group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

              {/* Content Container */}
              <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                <div className="space-y-2">
                  <h3 className="text-base md:text-lg font-black font-heading leading-tight tracking-tight text-white drop-shadow-sm">
                    {isRTL ? CARDS.card4.title_ar : CARDS.card4.title_fr}
                  </h3>

                  <div className="pt-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        CARDS.card4.action();
                      }}
                      className="group/btn relative inline-flex items-center gap-2 pl-3.5 pr-1 py-1 text-[9.5px] font-black uppercase tracking-wider rounded-full shadow-md bg-sky-600 hover:bg-sky-500 text-white transition-all duration-300 ease-out cursor-pointer border border-sky-300/30 outline-none backdrop-blur-md overflow-hidden active:scale-95"
                    >
                      <span className="relative z-10 font-black tracking-wider">
                        {isRTL ? CARDS.card4.cta_ar : CARDS.card4.cta_fr}
                      </span>
                      <span className="relative z-10 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:bg-white group-hover/btn:text-sky-700 shrink-0">
                        {isRTL ? (
                          <ArrowLeft className="w-3 h-3" />
                        ) : (
                          <ArrowRight className="w-3 h-3" />
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* MOBILE ONLY 3-COLUMN GRID FOR CARDS 2, 3, 4 */}
          <div className="grid grid-cols-3 gap-2 md:hidden mt-2 w-full">
            
            {/* Mobile Card 2 */}
            <div 
              onClick={CARDS.card2.action}
              className="hero-card-gsap w-full relative group overflow-hidden rounded-xl border border-slate-200/50 bg-white h-[110px] cursor-pointer shimmer-sweep-2 card-press-feedback"
              style={{ opacity: mounted ? 0 : 1 }}
            >
              <Image
                src={CARDS.card2.bgImage}
                alt=""
                fill
                sizes="33vw"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ease-[var(--ease-out-premium)] group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/95 via-primary-dark/50 to-transparent" />
              <div className="absolute inset-0 p-2 flex flex-col justify-end text-white">
                <div className="space-y-1">
                  <h3 className="text-[9.5px] font-black leading-tight font-heading text-white line-clamp-2">
                    {isRTL ? CARDS.card2.title_ar : CARDS.card2.title_fr}
                  </h3>
                  <div className="inline-flex items-center gap-0.5 text-[7.5px] font-black uppercase tracking-wider text-accent mt-0.5">
                    <span>{isRTL ? CARDS.card2.cta_ar : CARDS.card2.cta_fr}</span>
                    {isRTL ? <ArrowLeft className="w-2 h-2" /> : <ArrowRight className="w-2 h-2" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Card 3 */}
            <div 
              onClick={CARDS.card3.action}
              className="hero-card-gsap w-full relative group overflow-hidden rounded-xl border border-slate-200/50 bg-white h-[110px] cursor-pointer shimmer-sweep-3 card-press-feedback"
              style={{ opacity: mounted ? 0 : 1 }}
            >
              <Image
                src={CARDS.card3.bgImage}
                alt=""
                fill
                sizes="33vw"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ease-[var(--ease-out-premium)] group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/95 via-primary-dark/50 to-transparent" />
              <div className="absolute inset-0 p-2 flex flex-col justify-end text-white">
                <div className="space-y-1">
                  <h3 className="text-[9.5px] font-black leading-tight font-heading text-white line-clamp-2">
                    {isRTL ? CARDS.card3.title_ar : CARDS.card3.title_fr}
                  </h3>
                  <div className="inline-flex items-center gap-0.5 text-[7.5px] font-black uppercase tracking-wider text-accent mt-0.5">
                    <span>{isRTL ? CARDS.card3.cta_ar : CARDS.card3.cta_fr}</span>
                    {isRTL ? <ArrowLeft className="w-2 h-2" /> : <ArrowRight className="w-2 h-2" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Card 4 */}
            <div 
              onClick={CARDS.card4.action}
              className="hero-card-gsap w-full relative group overflow-hidden rounded-xl border border-slate-200/50 bg-white h-[110px] cursor-pointer shimmer-sweep-3 card-press-feedback"
              style={{ opacity: mounted ? 0 : 1 }}
            >
              <Image
                src={CARDS.card4.bgImage}
                alt=""
                fill
                sizes="33vw"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ease-[var(--ease-out-premium)] group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/95 via-primary-dark/50 to-transparent" />
              <div className="absolute inset-0 p-2 flex flex-col justify-end text-white">
                <div className="space-y-1">
                  <h3 className="text-[9.5px] font-black leading-tight font-heading text-white line-clamp-2">
                    {isRTL ? CARDS.card4.title_ar : CARDS.card4.title_fr}
                  </h3>
                  <div className="inline-flex items-center gap-0.5 text-[7.5px] font-black uppercase tracking-wider text-accent mt-0.5">
                    <span>{isRTL ? CARDS.card4.cta_ar : CARDS.card4.cta_fr}</span>
                    {isRTL ? <ArrowLeft className="w-2 h-2" /> : <ArrowRight className="w-2 h-2" />}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
