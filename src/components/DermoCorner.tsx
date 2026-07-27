'use client';

import React, { useRef } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { ProductCard } from './ProductCard';
import { useProducts } from '@/context/ProductsContext';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useGalleryOverrides } from '@/lib/useGalleryOverrides';

// Default Unsplash fallbacks (used when no admin upload override exists)
const CONCERN_DEFAULTS = {
  acne:     'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?q=80&w=600&auto=format&fit=crop',
  spots:    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600&auto=format&fit=crop',
  wrinkles: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
  dryness:  'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=600&auto=format&fit=crop',
  redness:  'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=600&auto=format&fit=crop',
  solaire:  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
};

export const DermoCorner: React.FC = () => {
  const { language } = useTranslation();
  const isAR = language === 'AR';
  const { products } = useProducts();
  const { getDisplayImage } = useGalleryOverrides();

  // Refs for horizontal scrolling
  const acneScrollRef = useRef<HTMLDivElement>(null);
  const spotScrollRef = useRef<HTMLDivElement>(null);
  const antiAgeScrollRef = useRef<HTMLDivElement>(null);
  const hydrateScrollRef = useRef<HTMLDivElement>(null);
  const sootheScrollRef = useRef<HTMLDivElement>(null);
  const solarScrollRef = useRef<HTMLDivElement>(null);

  const safeProducts = React.useMemo(() => (Array.isArray(products) ? products : []), [products]);

  // Dynamically filter targeted products with fallback to safeProducts
  const acneProducts = React.useMemo(() => {
    const filtered = safeProducts.filter(p => {
      if (!p) return false;
      const text = `${p.title || ''} ${p.nameFr || ''} ${p.description || ''} ${Array.isArray(p.tags) ? p.tags.join(' ') : ''}`.toLowerCase();
      return text.includes('acné') || text.includes('bouton') || text.includes('imperfection') || text.includes('sebum') || text.includes('pore') || text.includes('gel');
    });
    return (filtered.length > 0 ? filtered : safeProducts).slice(0, 6);
  }, [safeProducts]);

  const spotProducts = React.useMemo(() => {
    const filtered = safeProducts.filter(p => {
      if (!p) return false;
      const text = `${p.title || ''} ${p.nameFr || ''} ${p.description || ''} ${Array.isArray(p.tags) ? p.tags.join(' ') : ''}`.toLowerCase();
      return text.includes('tache') || text.includes('éclat') || text.includes('bright') || text.includes('pigment') || text.includes('serum');
    });
    return (filtered.length > 0 ? filtered : safeProducts).slice(0, 6);
  }, [safeProducts]);

  const antiAgeProducts = React.useMemo(() => {
    const filtered = safeProducts.filter(p => {
      if (!p) return false;
      const text = `${p.title || ''} ${p.nameFr || ''} ${p.description || ''} ${Array.isArray(p.tags) ? p.tags.join(' ') : ''}`.toLowerCase();
      return text.includes('anti-age') || text.includes('anti age') || text.includes('ride') || text.includes('fermeté') || text.includes('lift') || text.includes('creme');
    });
    return (filtered.length > 0 ? filtered : safeProducts).slice(0, 6);
  }, [safeProducts]);

  const hydrateProducts = React.useMemo(() => {
    const filtered = safeProducts.filter(p => {
      if (!p) return false;
      const text = `${p.title || ''} ${p.nameFr || ''} ${p.description || ''} ${Array.isArray(p.tags) ? p.tags.join(' ') : ''}`.toLowerCase();
      return text.includes('hydrat') || text.includes('sec') || text.includes('barrière') || text.includes('baume') || text.includes('lotion');
    });
    return (filtered.length > 0 ? filtered : safeProducts).slice(0, 6);
  }, [safeProducts]);

  const sootheProducts = React.useMemo(() => {
    const filtered = safeProducts.filter(p => {
      if (!p) return false;
      const text = `${p.title || ''} ${p.nameFr || ''} ${p.description || ''} ${Array.isArray(p.tags) ? p.tags.join(' ') : ''}`.toLowerCase();
      return text.includes('apais') || text.includes('sensible') || text.includes('cica') || text.includes('rougeur') || text.includes('eau');
    });
    return (filtered.length > 0 ? filtered : safeProducts).slice(0, 6);
  }, [safeProducts]);

  const solarProducts = React.useMemo(() => {
    const filtered = safeProducts.filter(p => {
      if (!p) return false;
      const text = `${p.title || ''} ${p.nameFr || ''} ${p.description || ''} ${Array.isArray(p.tags) ? p.tags.join(' ') : ''}`.toLowerCase();
      return text.includes('solaire') || text.includes('spf') || text.includes('écran') || text.includes('sun');
    });
    return (filtered.length > 0 ? filtered : safeProducts).slice(0, 6);
  }, [safeProducts]);

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 300;
      ref.current.scrollBy({
        left: dir === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-slate-50/50 dark:bg-slate-950/10 border-t border-b border-slate-100 dark:border-white/5">
      {/* Dynamic ambient gradients */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/3 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/3 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 relative z-10 space-y-12 md:space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            {isAR ? 'كورنر الجلدية' : 'DERMO CORNER'}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
            {isAR ? (
              <>
                علاجات سريرية <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">حسب نوع مشكلتكِ</span>
              </>
            ) : (
              <>
                Solutions Cliniques <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Ciblées par Préoccupation</span>
              </>
            )}
          </h2>
        </div>

        {/* Stacked Full-Width Layout */}
        <div className="space-y-10 md:space-y-12">
          
          {/* Row 1: Acne & Imperfections */}
          <div className="flex flex-col lg:flex-row gap-6 p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-md hover:shadow-xl transition-all duration-300">
            
            {/* Model Card Left */}
            <div className="w-full lg:w-[240px] shrink-0 relative aspect-[16/9] lg:aspect-[3/4.2] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-end p-6">
              <Image
                src={getDisplayImage(CONCERN_DEFAULTS.acne, 'concern_acne')}
                alt="Acne & Imperfections skin concern model"
                fill
                className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-5 z-10">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-1">
                  {isAR ? 'البشرة الدهنية والشوائب' : 'Peaux Normales à Grasses'}
                </span>
                <h3 className="text-lg font-black text-white leading-tight">
                  {isAR ? 'حب الشباب والمسام' : 'Acné & Imperfections'}
                </h3>
                <p className="text-[10px] text-slate-300 mt-1.5 leading-relaxed font-medium">
                  {isAR ? 'يمنع ظهور البثور، يقشر بلطف وينعم نسيج البشرة.' : 'Purifie, régule le sébum et cible les imperfections.'}
                </p>
                <div className="pt-3 mt-2 border-t border-white/10">
                  <a
                    href="/products?category=visage&q=cerave"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200"
                    style={{ background: '#ffffff', color: '#0f172a' }}
                  >
                    {isAR ? 'تصفح كل العلاجات' : 'Voir tous les soins'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Products Selection Right */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              
              {/* Header inside row with controls */}
              <div className="flex justify-between items-center mb-4 border-b border-slate-50 dark:border-white/5 pb-3">
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  {isAR ? 'بروتوكول التحكم بالدهون' : 'Protocole Sébo-Régulateur'}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleScroll(acneScrollRef, 'left')}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer outline-none"
                    title={isAR ? 'السابق' : 'Précédent'}
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => handleScroll(acneScrollRef, 'right')}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer outline-none"
                    title={isAR ? 'التالي' : 'Suivant'}
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Side Scrollable Products Container */}
              <div
                ref={acneScrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 select-none"
              >
                {acneProducts.map(product => (
                  <div key={product.id} className="snap-start shrink-0 w-[180px] sm:w-[220px] lg:w-[168px] transition-all duration-200 hover:-translate-y-0.5">
                    <ProductCard product={product} compact={true} />
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Row 2: Spot & Brightening */}
          <div className="flex flex-col lg:flex-row-reverse gap-6 p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-md hover:shadow-xl transition-all duration-300">
            
            {/* Model Card Right */}
            <div className="w-full lg:w-[240px] shrink-0 relative aspect-[16/9] lg:aspect-[3/4.2] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-end p-6">
              <Image
                src={getDisplayImage(CONCERN_DEFAULTS.spots, 'concern_spots')}
                alt="Spots & Pigmentation skin concern model"
                fill
                className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-5 z-10">
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">
                  {isAR ? 'البقع الداكنة وتوحيد اللون' : 'Hyperpigmentation'}
                </span>
                <h3 className="text-lg font-black text-white leading-tight">
                  {isAR ? 'التصبغات والنضارة' : 'Anti-Taches & Éclat'}
                </h3>
                <p className="text-[10px] text-slate-300 mt-1.5 leading-relaxed font-medium">
                  {isAR ? 'يستهدف بقع الميلانين ويوحد لون البشرة.' : 'Cible la mélanine et redonne de l\'éclat.'}
                </p>
                <div className="pt-3 mt-2 border-t border-white/10">
                  <a
                    href="/products?category=visage&q=serum"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200"
                    style={{ background: '#ffffff', color: '#0f172a' }}
                  >
                    {isAR ? 'تصفح كل العلاجات' : 'Voir tous les soins'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Products Selection Right */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              
              {/* Header inside row with controls */}
              <div className="flex justify-between items-center mb-4 border-b border-slate-50 dark:border-white/5 pb-3">
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  {isAR ? 'بروتوكول توحيد اللون' : 'Protocole Éclaircissant'}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleScroll(spotScrollRef, 'left')}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer outline-none"
                    title={isAR ? 'السابق' : 'Précédent'}
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => handleScroll(spotScrollRef, 'right')}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer outline-none"
                    title={isAR ? 'التالي' : 'Suivant'}
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Side Scrollable Products Container */}
              <div
                ref={spotScrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 select-none"
              >
                {spotProducts.map(product => (
                  <div key={product.id} className="snap-start shrink-0 w-[180px] sm:w-[220px] lg:w-[168px] transition-all duration-200 hover:-translate-y-0.5">
                    <ProductCard product={product} compact={true} />
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Row 3: Anti-âge & Fermeté */}
          <div className="flex flex-col lg:flex-row gap-6 p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-md hover:shadow-xl transition-all duration-300">
            
            {/* Model Card Left */}
            <div className="w-full lg:w-[240px] shrink-0 relative aspect-[16/9] lg:aspect-[3/4.2] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-end p-6">
              <Image
                src={getDisplayImage(CONCERN_DEFAULTS.wrinkles, 'concern_wrinkles')}
                alt="Anti-aging & Firmness skin concern model"
                fill
                className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-5 z-10">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-1">
                  {isAR ? 'التجاعيد وفقدان المرونة' : 'Rides & Perte de Fermeté'}
                </span>
                <h3 className="text-lg font-black text-white leading-tight">
                  {isAR ? 'مقاومة التجاعيد وشد البشرة' : 'Anti-âge & Fermeté'}
                </h3>
                <p className="text-[10px] text-slate-300 mt-1.5 leading-relaxed font-medium">
                  {isAR ? 'يستهدف التجاعيد ويستعيد مرونة البشرة.' : 'Cible les rides et redonne fermeté et élasticité.'}
                </p>
                <div className="pt-3 mt-2 border-t border-white/10">
                  <a
                    href="/products?category=visage&q=anti-age"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200"
                    style={{ background: '#ffffff', color: '#0f172a' }}
                  >
                    {isAR ? 'تصفح كل العلاجات' : 'Voir tous les soins'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Products Selection Right */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              
              {/* Header inside row with controls */}
              <div className="flex justify-between items-center mb-4 border-b border-slate-50 dark:border-white/5 pb-3">
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  {isAR ? 'بروتوكول شد وملء البشرة' : 'Protocole Anti-Rides & Fermeté'}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleScroll(antiAgeScrollRef, 'left')}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer outline-none"
                    title={isAR ? 'السابق' : 'Précédent'}
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => handleScroll(antiAgeScrollRef, 'right')}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer outline-none"
                    title={isAR ? 'التالي' : 'Suivant'}
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Side Scrollable Products Container */}
              <div
                ref={antiAgeScrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 select-none"
              >
                {antiAgeProducts.map(product => (
                  <div key={product.id} className="snap-start shrink-0 w-[180px] sm:w-[220px] lg:w-[168px] transition-all duration-200 hover:-translate-y-0.5">
                    <ProductCard product={product} compact={true} />
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Row 4: Hydratation & Barrière */}
          <div className="flex flex-col lg:flex-row-reverse gap-6 p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-md hover:shadow-xl transition-all duration-300">
            
            {/* Model Card Right */}
            <div className="w-full lg:w-[240px] shrink-0 relative aspect-[16/9] lg:aspect-[3/4.2] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-end p-6">
              <Image
                src={getDisplayImage(CONCERN_DEFAULTS.dryness, 'concern_dryness')}
                alt="Hydration & Barrier skin concern model"
                fill
                className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-5 z-10">
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">
                  {isAR ? 'البشرة الجافة وشديدة الجفاف' : 'Peaux Sèches & Déshydratées'}
                </span>
                <h3 className="text-lg font-black text-white leading-tight">
                  {isAR ? 'الترطيب وحاجز البشرة' : 'Hydratation & Barrière'}
                </h3>
                <p className="text-[10px] text-slate-300 mt-1.5 leading-relaxed font-medium">
                  {isAR ? 'يرمم حاجز البشرة ويحبس الرطوبة.' : 'Restaure la barrière cutanée et retient l\'eau.'}
                </p>
                <div className="pt-3 mt-2 border-t border-white/10">
                  <a
                    href="/products?category=visage&q=ceramide"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200"
                    style={{ background: '#ffffff', color: '#0f172a' }}
                  >
                    {isAR ? 'تصفح كل العلاجات' : 'Voir tous les soins'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Products Selection Left */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              
              {/* Header inside row with controls */}
              <div className="flex justify-between items-center mb-4 border-b border-slate-50 dark:border-white/5 pb-3">
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  {isAR ? 'بروتوكول الترطيب الفائق والترميم' : 'Protocole Hydratation & Réparation'}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleScroll(hydrateScrollRef, 'left')}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer outline-none"
                    title={isAR ? 'السابق' : 'Précédent'}
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => handleScroll(hydrateScrollRef, 'right')}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer outline-none"
                    title={isAR ? 'التالي' : 'Suivant'}
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Side Scrollable Products Container */}
              <div
                ref={hydrateScrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 select-none"
              >
                {hydrateProducts.map(product => (
                  <div key={product.id} className="snap-start shrink-0 w-[180px] sm:w-[220px] lg:w-[168px] transition-all duration-200 hover:-translate-y-0.5">
                    <ProductCard product={product} compact={true} />
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Row 5: Apaisant & Sensibilité */}
          <div className="flex flex-col lg:flex-row gap-6 p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-md hover:shadow-xl transition-all duration-300">
            
            {/* Model Card Left */}
            <div className="w-full lg:w-[240px] shrink-0 relative aspect-[16/9] lg:aspect-[3/4.2] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-end p-6">
              <Image
                src={getDisplayImage(CONCERN_DEFAULTS.redness, 'concern_redness')}
                alt="Soothing & Sensitive skin concern model"
                fill
                className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-5 z-10">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-1">
                  {isAR ? 'الاحمرار والبشرة الحساسة' : 'Rougeurs & Peaux Réactives'}
                </span>
                <h3 className="text-lg font-black text-white leading-tight">
                  {isAR ? 'العناية الملطفة والتهدئة' : 'Apaisant & Sensibilité'}
                </h3>
                <p className="text-[10px] text-slate-300 mt-1.5 leading-relaxed font-medium">
                  {isAR ? 'يهدئ الاحمرار ويقوي دفاعات البشرة الحساسة.' : 'Calme les irritations et réduit les rougeurs.'}
                </p>
                <div className="pt-3 mt-2 border-t border-white/10">
                  <a
                    href="/products?category=visage&q=centella"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200"
                    style={{ background: '#ffffff', color: '#0f172a' }}
                  >
                    {isAR ? 'تصفح كل العلاجات' : 'Voir tous les soins'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Products Selection Right */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              
              {/* Header inside row with controls */}
              <div className="flex justify-between items-center mb-4 border-b border-slate-50 dark:border-white/5 pb-3">
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  {isAR ? 'بروتوكول تهدئة وتلطيف البشرة' : 'Protocole Soignant & Apaisant'}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleScroll(sootheScrollRef, 'left')}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer outline-none"
                    title={isAR ? 'السابق' : 'Précédent'}
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => handleScroll(sootheScrollRef, 'right')}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer outline-none"
                    title={isAR ? 'التالي' : 'Suivant'}
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Side Scrollable Products Container */}
              <div
                ref={sootheScrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 select-none"
              >
                {sootheProducts.map(product => (
                  <div key={product.id} className="snap-start shrink-0 w-[180px] sm:w-[220px] lg:w-[168px] transition-all duration-200 hover:-translate-y-0.5">
                    <ProductCard product={product} compact={true} />
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Row 6: Solaire & Protection */}
          <div className="flex flex-col lg:flex-row-reverse gap-6 p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-md hover:shadow-xl transition-all duration-300">
            
            {/* Model Card Right */}
            <div className="w-full lg:w-[240px] shrink-0 relative aspect-[16/9] lg:aspect-[3/4.2] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-end p-6">
              <Image
                src={getDisplayImage(CONCERN_DEFAULTS.solaire, 'concern_solaire')}
                alt="Solaire & Protection concern model"
                fill
                className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-5 z-10">
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">
                  {isAR ? 'الحماية من أشعة الشمس وفوق البنفسجية' : 'Protection UV & Anti-Photovieillissement'}
                </span>
                <h3 className="text-lg font-black text-white leading-tight">
                  {isAR ? 'الحماية والوقاية من الشمس' : 'Solaire & Protection'}
                </h3>
                <p className="text-[10px] text-slate-300 mt-1.5 leading-relaxed font-medium">
                  {isAR ? 'يحمي من الأشعة فوق البنفسجية ويمنع البقع الشمسية.' : 'Protège contre les UVA/UVB et prévient les taches solaires.'}
                </p>
                <div className="pt-3 mt-2 border-t border-white/10">
                  <a
                    href="/products?category=solaire"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200"
                    style={{ background: '#ffffff', color: '#0f172a' }}
                  >
                    {isAR ? 'تصفح كل العلاجات' : 'Voir tous les soins'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Products Selection Left */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              
              {/* Header inside row with controls */}
              <div className="flex justify-between items-center mb-4 border-b border-slate-50 dark:border-white/5 pb-3">
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  {isAR ? 'بروتوكول الوقاية والحماية القصوى' : 'Protocole Haute Protection Solaire'}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleScroll(solarScrollRef, 'left')}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer outline-none"
                    title={isAR ? 'السابق' : 'Précédent'}
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => handleScroll(solarScrollRef, 'right')}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer outline-none"
                    title={isAR ? 'التالي' : 'Suivant'}
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Side Scrollable Products Container */}
              <div
                ref={solarScrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 select-none"
              >
                {solarProducts.map(product => (
                  <div key={product.id} className="snap-start shrink-0 w-[180px] sm:w-[220px] lg:w-[168px] transition-all duration-200 hover:-translate-y-0.5">
                    <ProductCard product={product} compact={true} />
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
