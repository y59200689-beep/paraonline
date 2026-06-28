'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { Sparkles, Shield, Activity, ArrowRight, ArrowLeft } from 'lucide-react';

interface HeroProps {
  onOpenDiagnostic: () => void;
  onSelectCategory: (category: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDiagnostic, onSelectCategory }) => {
  const { language } = useTranslation();
  const { settings } = useSettings();
  const isRTL = language === 'AR';
  const [isHovered, setIsHovered] = useState(false);

  const getBannerAction = (banner: any) => {
    if (banner.linkType === 'diagnostic') return onOpenDiagnostic;
    if (banner.linkType === 'category') return () => onSelectCategory(banner.linkValue);
    return () => onSelectCategory(banner.linkValue || 'visage');
  };

  const customBanners = settings.banners && settings.banners.length >= 4 ? settings.banners : null;

  // Localized copy content for each grid card
  const CARDS = {
    card1: {
      tag_fr: customBanners ? customBanners[0].tagFr : 'DIAGNOSTIC DERMOCAPTEUR (IA)',
      tag_ar: customBanners ? customBanners[0].tagAr : 'التشخيص الجلدي الذكي',
      title_fr: customBanners ? customBanners[0].titleFr : 'Votre Ordonnance Cutanée Personnalisée',
      title_ar: customBanners ? customBanners[0].titleAr : 'بروتوكولكِ العلاجي المخصص بدقة',
      desc_fr: customBanners ? customBanners[0].descFr : 'Notre protocole digital analyse votre typologie épidermique et élabore un rituel ciblé de jour et de nuit validé par nos experts dermatologiques.',
      desc_ar: customBanners ? customBanners[0].descAr : 'خوارزميتنا السريرية تحلل بشرتكِ وتركّب بروتوكولاً علاجياً معتمداً من صيادلتنا مع خصم حصري 15%!',
      cta_fr: customBanners ? customBanners[0].ctaFr : 'Initialiser mon Diagnostic (-15%)',
      cta_ar: customBanners ? customBanners[0].ctaAr : 'بدء التشخيص السريري (خصم 15%-)',
      bgImage: customBanners ? customBanners[0].bgImage : '/images/hero_skincare_clinic.png',
      action: customBanners ? getBannerAction(customBanners[0]) : onOpenDiagnostic,
    },
    card2: {
      tag_fr: customBanners ? customBanners[1].tagFr : 'COMPTOIR DES SOLUTES ACTIFS',
      tag_ar: customBanners ? customBanners[1].tagAr : 'تركيبات نشطة',
      title_fr: customBanners ? customBanners[1].titleFr : 'Botanical Hydrating Serum',
      title_ar: customBanners ? customBanners[1].titleAr : 'سيروم الترطيب النباتي الفاخر',
      cta_fr: customBanners ? customBanners[1].ctaFr : 'Consulter la gamme',
      cta_ar: customBanners ? customBanners[1].ctaAr : 'اكتشفي المجموعة',
      bgImage: customBanners ? customBanners[1].bgImage : '/images/hero_serum_dropper.png',
      action: customBanners ? getBannerAction(customBanners[1]) : () => onSelectCategory('visage'),
    },
    card3: {
      tag_fr: customBanners ? customBanners[2].tagFr : 'CURE ANTI-SÉNESCENCE',
      tag_ar: customBanners ? customBanners[2].tagAr : 'مكافحة الشيخوخة',
      title_fr: customBanners ? customBanners[2].titleFr : 'Jeunesse Active Rétinol',
      title_ar: customBanners ? customBanners[2].titleAr : 'بروتوكول الشباب والريتينول',
      cta_fr: customBanners ? customBanners[2].ctaFr : 'Prescrire Rétinol',
      cta_ar: customBanners ? customBanners[2].ctaAr : 'تسوقي الريتينول',
      bgImage: customBanners ? customBanners[2].bgImage : '/images/hero_rose_cream.png',
      action: customBanners ? getBannerAction(customBanners[2]) : () => onSelectCategory('visage'),
    },
    card4: {
      tag_fr: customBanners ? customBanners[3].tagFr : 'SURATION HYDRIQUE',
      tag_ar: customBanners ? customBanners[3].tagAr : 'ترطيب مكثف',
      title_fr: customBanners ? customBanners[3].titleFr : 'Glow Acide Hyaluronique',
      title_ar: customBanners ? customBanners[3].titleAr : 'توهج حمض الهيالورونيك',
      cta_fr: customBanners ? customBanners[3].ctaFr : 'Consulter la gamme',
      cta_ar: customBanners ? customBanners[3].ctaAr : 'اكتشفي المجموعة',
      bgImage: customBanners ? customBanners[3].bgImage : '/images/hero_hydra_essence.png',
      action: customBanners ? getBannerAction(customBanners[3]) : () => onSelectCategory('visage'),
    },
  };

  return (
    <section className="hero-section w-full bg-background !pt-3 !pb-6 md:!pt-4 md:!pb-8">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Editorial Responsive Layout */}
        <div 
          className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          
          {/* Card 1: Left Main Banner (Spans 2 columns, full height) */}
          <div 
            onClick={CARDS.card1.action}
            className="hero-card-enter hero-card-delay-1 md:col-span-2 lg:col-span-2 relative group overflow-hidden rounded-3xl ring-1 ring-black/6 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer h-[280px] md:h-[480px] lg:h-[520px] shimmer-sweep-1"
          >
            {/* Background image parallax — 3s ease-out-quart for visible breath */}
            <Image
              src={CARDS.card1.bgImage}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 50vw"
              priority
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3000ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.04]"
            />
            {/* Soft Ambient Radial/Linear Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/85 via-primary-dark/45 to-transparent" style={{ direction: 'ltr' }} />
            
            {/* Morphing glow blobs */}
            <div className="absolute top-1/4 left-1/4 w-56 h-56 rounded-full bg-accent/10 blur-3xl pointer-events-none animate-morph-blob" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none animate-morph-blob" style={{ animationDelay: '-8s' }} />

            {/* Content Container */}
            <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end text-white">
              <div className="max-w-[480px] space-y-2 md:space-y-4">
                
                {/* Eyebrow badge — fades up before heading */}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-full text-[9px] font-black tracking-widest text-accent"
                  style={{ animation: 'eyebrow-in 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
                  <span>{isRTL ? CARDS.card1.tag_ar : CARDS.card1.tag_fr}</span>
                </div>

                {/* Subtitle — slides in */}
                <span
                  className="block text-[10px] md:text-xs font-black tracking-[0.15em] text-accent uppercase"
                  style={{ animation: 'eyebrow-in 0.6s cubic-bezier(0.16,1,0.3,1) 0.35s both' }}
                >
                  {isRTL ? 'التشخيص الجلدي الذكي' : 'DIAGNOSTIC CLINIQUE INTÉGRAL'}
                </span>

                {/* Heading — curtain mask wipe */}
                <span className="anim-heading-wrap">
                  <h1
                    className="anim-heading-text active text-xl md:text-4xl font-black font-heading leading-tight tracking-tight text-white"
                    style={{ transitionDelay: '0.4s' }}
                  >
                    {isRTL ? CARDS.card1.title_ar : CARDS.card1.title_fr}
                  </h1>
                </span>

                {/* Description — soft fade-up after heading (hidden on mobile to prevent overflow) */}
                <p
                  className="hidden sm:block text-[12px] md:text-sm text-gray-300 leading-relaxed font-light"
                  style={{ animation: 'body-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.65s both' }}
                >
                  {isRTL ? CARDS.card1.desc_ar : CARDS.card1.desc_fr}
                </p>

                {/* CTA Button — button-in-button nested icon */}
                <div className="pt-1 md:pt-2" style={{ animation: 'body-fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.8s both' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      CARDS.card1.action();
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="group/btn inline-flex items-center gap-3 pl-5 pr-2 py-2 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-300 shadow-md cursor-pointer active:scale-95 border-0 outline-none hover:shadow-lg hover:-translate-y-0.5"
                    style={{
                      backgroundColor: isHovered ? 'var(--color-gold-hover)' : 'var(--color-accent)',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <span style={{ color: '#ffffff', fontWeight: 900 }}>{isRTL ? CARDS.card1.cta_ar : CARDS.card1.cta_fr}</span>
                    {/* Nested icon pill — button-in-button pattern */}
                    <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-300 group-hover/btn:translate-x-0.5 shrink-0">
                      {isRTL ? (
                        <ArrowLeft className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
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
            className="hidden md:block hero-card-enter hero-card-delay-2 lg:col-span-1 relative group overflow-hidden rounded-2xl ring-1 ring-black/6 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer h-[380px] md:h-[480px] lg:h-[520px] shimmer-sweep-2"
          >
            {/* Background image */}
            <Image
              src={CARDS.card2.bgImage}
              alt=""
              fill
              sizes="(max-width: 768px) 0vw, (max-width: 1024px) 25vw, 25vw"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3000ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.04]"
            />
            {/* Standard bottom visual gradient fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/85 via-primary-dark/35 to-transparent" />

            {/* Content Container */}
            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white">
              <div className="space-y-3">
                {/* Small active badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full text-[8px] font-black tracking-wider text-accent">
                  <Activity className="w-3 h-3 text-accent animate-pulse" />
                  <span>{isRTL ? CARDS.card2.tag_ar : CARDS.card2.tag_fr}</span>
                </div>

                {/* Heading */}
                <h3 className="text-xl md:text-2xl font-black font-heading leading-tight tracking-tight text-white">
                  {isRTL ? CARDS.card2.title_ar : CARDS.card2.title_fr}
                </h3>

                {/* Subtitle / CTA Link */}
                <div 
                  className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider border-b transition-all pb-0.5"
                  style={{ 
                    color: 'var(--color-accent)', 
                    borderColor: 'rgba(16, 185, 129, 0.25)' 
                  }}
                >
                  <span>{isRTL ? CARDS.card2.cta_ar : CARDS.card2.cta_fr}</span>
                  {isRTL ? (
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:translate-x-[-2px]" style={{ color: 'var(--color-accent)' }} />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-[2px]" style={{ color: 'var(--color-accent)' }} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Stack for Desktop Cards 3 & 4 */}
          <div className="hidden md:flex lg:col-span-1 flex-col gap-6 justify-between">
            
            {/* Card 3: Top Half Card */}
            <div 
              onClick={CARDS.card3.action}
              className="hero-card-enter hero-card-delay-3 relative group overflow-hidden rounded-2xl ring-1 ring-black/6 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer h-[178px] md:h-[228px] lg:h-[248px] shimmer-sweep-3"
            >
              {/* Background image */}
              <Image
                src={CARDS.card3.bgImage}
                alt=""
                fill
                sizes="(max-width: 768px) 0vw, (max-width: 1024px) 25vw, 25vw"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3000ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/85 via-primary-dark/35 to-transparent" />

              {/* Content Container */}
              <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                <div className="space-y-2">
                  <div className="inline-flex px-2.5 py-1 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full text-[8px] font-black tracking-wider text-accent">
                    {isRTL ? CARDS.card3.tag_ar : CARDS.card3.tag_fr}
                  </div>
                  
                  <h3 className="text-base md:text-lg font-black font-heading leading-tight tracking-tight text-white">
                    {isRTL ? CARDS.card3.title_ar : CARDS.card3.title_fr}
                  </h3>

                  <div 
                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider border-b pb-0.5"
                    style={{ 
                      color: 'var(--color-accent)', 
                      borderColor: 'rgba(16, 185, 129, 0.25)' 
                    }}
                  >
                    <span>{isRTL ? CARDS.card3.cta_ar : CARDS.card3.cta_fr}</span>
                    {isRTL ? (
                      <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:translate-x-[-2px]" style={{ color: 'var(--color-accent)' }} />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-[2px]" style={{ color: 'var(--color-accent)' }} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Bottom Half Card */}
            <div 
              onClick={CARDS.card4.action}
              className="hero-card-enter hero-card-delay-4 relative group overflow-hidden rounded-2xl ring-1 ring-black/6 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer h-[178px] md:h-[228px] lg:h-[248px] shimmer-sweep-3"
            >
              {/* Background image */}
              <Image
                src={CARDS.card4.bgImage}
                alt=""
                fill
                sizes="(max-width: 768px) 0vw, (max-width: 1024px) 25vw, 25vw"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3000ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/85 via-primary-dark/35 to-transparent" />

              {/* Content Container */}
              <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                <div className="space-y-2">
                  <div className="inline-flex px-2.5 py-1 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full text-[8px] font-black tracking-wider text-accent">
                    {isRTL ? CARDS.card4.tag_ar : CARDS.card4.tag_fr}
                  </div>
                  
                  <h3 className="text-base md:text-lg font-black font-heading leading-tight tracking-tight text-white">
                    {isRTL ? CARDS.card4.title_ar : CARDS.card4.title_fr}
                  </h3>

                  <div 
                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider border-b pb-0.5"
                    style={{ 
                      color: 'var(--color-accent)', 
                      borderColor: 'rgba(16, 185, 129, 0.25)' 
                    }}
                  >
                    <span>{isRTL ? CARDS.card4.cta_ar : CARDS.card4.cta_fr}</span>
                    {isRTL ? (
                      <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:translate-x-[-2px]" style={{ color: 'var(--color-accent)' }} />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-[2px]" style={{ color: 'var(--color-accent)' }} />
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* MOBILE ONLY HORIZONTAL SCROLL STRIP FOR CARDS 2, 3, 4 */}
          <div 
            className="flex md:hidden flex-row gap-4 overflow-x-auto snap-x scrollbar-none pb-2 mt-2" 
            style={{ 
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none'
            }}
          >
            
            {/* Mobile Card 2 */}
            <div 
              onClick={CARDS.card2.action}
              className="hero-card-enter hero-card-delay-2 w-[60vw] shrink-0 snap-start snap-always relative group overflow-hidden rounded-2xl border border-slate-200/50 bg-white h-[160px] cursor-pointer shimmer-sweep-2"
            >
              <Image
                src={CARDS.card2.bgImage}
                alt=""
                fill
                sizes="60vw"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3000ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary-dark/45 to-transparent" />
              <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                <div className="space-y-1.5">
                  <span className="text-[7.5px] font-black uppercase tracking-wider text-accent block">
                    {isRTL ? CARDS.card2.tag_ar : CARDS.card2.tag_fr}
                  </span>
                  <h3 className="text-[13.5px] font-black leading-tight font-heading text-white">
                    {isRTL ? CARDS.card2.title_ar : CARDS.card2.title_fr}
                  </h3>
                  <div className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider text-accent">
                    <span>{isRTL ? CARDS.card2.cta_ar : CARDS.card2.cta_fr}</span>
                    {isRTL ? <ArrowLeft className="w-2.5 h-2.5" /> : <ArrowRight className="w-2.5 h-2.5" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Card 3 */}
            <div 
              onClick={CARDS.card3.action}
              className="hero-card-enter hero-card-delay-3 w-[60vw] shrink-0 snap-start snap-always relative group overflow-hidden rounded-2xl border border-slate-200/50 bg-white h-[160px] cursor-pointer shimmer-sweep-3"
            >
              <Image
                src={CARDS.card3.bgImage}
                alt=""
                fill
                sizes="60vw"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3000ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary-dark/45 to-transparent" />
              <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                <div className="space-y-1.5">
                  <span className="text-[7.5px] font-black uppercase tracking-wider text-accent block">
                    {isRTL ? CARDS.card3.tag_ar : CARDS.card3.tag_fr}
                  </span>
                  <h3 className="text-[13.5px] font-black leading-tight font-heading text-white">
                    {isRTL ? CARDS.card3.title_ar : CARDS.card3.title_fr}
                  </h3>
                  <div className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider text-accent">
                    <span>{isRTL ? CARDS.card3.cta_ar : CARDS.card3.cta_fr}</span>
                    {isRTL ? <ArrowLeft className="w-2.5 h-2.5" /> : <ArrowRight className="w-2.5 h-2.5" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Card 4 */}
            <div 
              onClick={CARDS.card4.action}
              className="hero-card-enter hero-card-delay-4 w-[60vw] shrink-0 snap-start snap-always relative group overflow-hidden rounded-2xl border border-slate-200/50 bg-white h-[160px] cursor-pointer shimmer-sweep-3"
            >
              <Image
                src={CARDS.card4.bgImage}
                alt=""
                fill
                sizes="60vw"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3000ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary-dark/45 to-transparent" />
              <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                <div className="space-y-1.5">
                  <span className="text-[7.5px] font-black uppercase tracking-wider text-accent block">
                    {isRTL ? CARDS.card4.tag_ar : CARDS.card4.tag_fr}
                  </span>
                  <h3 className="text-[13.5px] font-black leading-tight font-heading text-white">
                    {isRTL ? CARDS.card4.title_ar : CARDS.card4.title_fr}
                  </h3>
                  <div className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider text-accent">
                    <span>{isRTL ? CARDS.card4.cta_ar : CARDS.card4.cta_fr}</span>
                    {isRTL ? <ArrowLeft className="w-2.5 h-2.5" /> : <ArrowRight className="w-2.5 h-2.5" />}
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
