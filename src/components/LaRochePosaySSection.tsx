'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/context/LanguageContext';
import { ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { ProductCard } from './ProductCard';

export const LaRochePosaySSection: React.FC = () => {
  const { language } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?vendor=La+Roche-Posay&limit=100')
      .then((r) => r.json())
      .then((data) => {
        setAllProducts(data.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const brandProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const v = (p.vendor || '').toLowerCase();
      const t = (p.title || p.nameFr || '').toLowerCase();
      return v.includes('la roche') || v.includes('laroche') || t.includes('la roche') || t.includes('laroche');
    });
  }, [allProducts]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft } = scrollContainerRef.current;
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-[#fafaf9] dark:bg-slate-950/10">
      {/* Background warm radial glow */}
      <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-orange-500/4 dark:bg-orange-500/8 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-left mb-10 md:mb-14 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/15">
            <Award className="w-3 h-3 text-orange-500" />
            {language === 'AR' ? 'ماركة الأسبوع المميزة' : 'MARQUE VEDETTE DE LA SEMAINE'}
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
            {language === 'AR' ? (
              <>
                تركيز خاص على منتجات{' '}
                <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                  لا روش بوزاي | La Roche-Posay
                </span>
              </>
            ) : (
              <>
                Spotlight de la Semaine :{' '}
                <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                  La Roche-Posay
                </span>
              </>
            )}
          </h2>
        </div>

        {/* Asymmetrical Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 items-stretch">

          {/* Column 1: Brand Spotlight Card */}
          <div className="relative overflow-hidden rounded-[28px] border border-slate-200/50 dark:border-white/10 shadow-lg min-h-[480px] lg:min-h-full group">
            <Image
              src="/images/larochposay_brand_showcase.webp"
              alt="La Roche-Posay Brand Spotlight"
              fill
              priority
              className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent flex flex-col justify-end p-6 md:p-8">
              <div className="space-y-3">
                <span className="inline-block text-[9.5px] font-black uppercase tracking-[0.2em] text-orange-400">
                  {language === 'AR' ? 'ماركة ديرمو-تجميلية' : 'Dermo-Cosmétique'}
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-none">
                  La Roche-Posay
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {language === 'AR'
                    ? 'طورت بالشراكة مع أطباء الجلد، توفر La Roche-Posay حلولاً مبتكرة لأكثر الحالات الجلدية حساسية بفضل مياه Eau Thermale الفريدة.'
                    : "Développée avec des dermatologues, La Roche-Posay propose des formules innovantes avec l'Eau Thermale pour les peaux les plus sensibles."}
                </p>
                <div className="pt-2">
                  <a
                    href="/brand/la-roche-posay"
                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-white text-slate-950 rounded-full text-xs font-bold shadow-md hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <span>{language === 'AR' ? 'اكتشف المجموعة' : 'Découvrir la gamme'}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Product Carousel */}
          <div className="lg:col-span-2 flex flex-col justify-between relative">

            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                {!loading && (
                  language === 'AR'
                    ? `منتجات لا روش بوزاي المتاحة (${brandProducts.length})`
                    : `Produits La Roche-Posay disponibles (${brandProducts.length})`
                )}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => scroll('left')}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all cursor-pointer outline-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all cursor-pointer outline-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4"
            >
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="snap-start shrink-0 w-[270px] md:w-[290px] animate-pulse">
                    <div className="bg-slate-100 dark:bg-slate-900/60 rounded-2xl h-[380px]" />
                  </div>
                ))
              ) : brandProducts.length > 0 ? (
                brandProducts.map((product) => (
                  <div
                    key={product.id}
                    className="snap-start shrink-0 w-[270px] md:w-[290px]"
                  >
                    <ProductCard product={product} singleImage />
                  </div>
                ))
              ) : (
                <div className="w-full flex items-center justify-center py-20 text-slate-400 italic text-sm">
                  {language === 'AR' ? 'لا توجد منتجات متوفرة' : 'Aucun produit disponible'}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
