'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Product, PRODUCTS_DB } from '../lib/data';
import { useTranslation } from '../context/LanguageContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';

interface HadaLaboSliderProps {
  onOpenQuickView: (product: Product) => void;
}

// Short label shown on each card below the logo
const PRODUCT_SUBTITLES: Record<number, string> = {
  5: 'SUPER HYALURONIC ACID',
  6: 'SUPER HYALURONIC ACID',
  7: '7XHA SUPER DEEP HYDRATOR',
  8: 'ANTI-AGING SUPER HYDRATOR',
};

export const HadaLaboSlider: React.FC<HadaLaboSliderProps> = ({ onOpenQuickView }) => {
  const { language } = useTranslation();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  const hadaLaboProducts = PRODUCTS_DB.filter(
    p => p.vendor.toLowerCase() === 'hada labo tokyo'
  );

  /* ── Scroll helpers ──────────────────────────────────────────────── */
  const updateDot = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    const pct = el.scrollLeft / (el.scrollWidth - el.clientWidth || 1);
    setActiveDot(Math.min(2, Math.max(0, Math.round(pct * 2))));
  }, []);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateDot, { passive: true });
    window.addEventListener('resize', updateDot);
    updateDot();
    return () => {
      el.removeEventListener('scroll', updateDot);
      window.removeEventListener('resize', updateDot);
    };
  }, [updateDot]);

  const scrollBy = (dir: 'left' | 'right') => {
    sliderRef.current?.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' });
  };

  const scrollToPage = (page: number) => {
    const el = sliderRef.current;
    if (!el) return;
    el.scrollTo({ left: page * ((el.scrollWidth - el.clientWidth) / 2), behavior: 'smooth' });
  };

  return (
    <section className="py-10 overflow-hidden" style={{ background: 'linear-gradient(135deg, #E6F4F6 0%, #F0F8FA 50%, #EAF3F5 100%)' }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">
        <div className="flex gap-6 items-stretch min-h-[520px]">

          {/* ── Left Column: Ambassador Arch ───────────────────────── */}
          <div className="hidden md:flex w-[200px] lg:w-[230px] flex-shrink-0 flex-col gap-3">
            
            {/* Brand heading row */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <div className="bg-[#CC1F42] text-white px-1.5 py-1 rounded-[3px] leading-none text-center">
                  <div className="text-[8px] font-black tracking-tighter">HADA</div>
                  <div className="text-[8px] font-black tracking-tighter">LABO</div>
                  <div className="text-[7px] font-bold tracking-tighter opacity-80">TOKYO®</div>
                </div>
                <div className="text-[10px] font-black text-slate-700 tracking-wider leading-none">JAPANESE<br/><span className="text-2xl font-black text-slate-800 tracking-tight leading-tight">№1</span></div>
              </div>
            </div>

            {/* Ambassador arch portrait */}
            <div className="relative flex-grow rounded-t-[120px] rounded-b-2xl overflow-hidden border border-[#CC1F42]/25 shadow-md group" style={{ background: 'linear-gradient(180deg, #D6284A 0%, #AA1535 100%)' }}>
              {/* Radial shimmer */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_60%)] z-10 pointer-events-none" />
              
              {/* Portrait image */}
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=600"
                alt="Rym - Ambassadrice Hada Labo Tokyo"
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Bottom gradient fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#AA1535]/90 via-[#CC1F42]/10 to-transparent z-20" />

              {/* Ambassador name */}
              <div className="absolute bottom-0 left-0 right-0 z-30 text-center pb-4 px-3">
                <span className="font-serif italic text-white text-xl block mb-0.5 drop-shadow-md">Rym</span>
                <span className="text-[7.5px] uppercase tracking-[0.18em] font-extrabold text-pink-200 block leading-snug">
                  Ambassadrice<br/>hada labo tokyo
                </span>
              </div>

              {/* Left nav arrow */}
              <button
                onClick={() => scrollBy('left')}
                className="absolute bottom-4 left-3 z-40 w-7 h-7 rounded-full bg-white/20 backdrop-blur border border-white/40 text-white flex items-center justify-center hover:bg-white hover:text-[#CC1F42] transition-all duration-300 active:scale-90"
                aria-label="Précédent"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── Right Column: Slider ───────────────────────────────── */}
          <div className="flex-grow flex flex-col min-w-0 gap-5">
            
            {/* Cards track + right arrow */}
            <div className="relative flex-grow">
              <div
                ref={sliderRef}
                className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth h-full items-stretch"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {hadaLaboProducts.map((product) => {
                  const subtitle = PRODUCT_SUBTITLES[product.id];
                  
                  // Construct Japan's N°1 image bottom overlay for Hada Labo identity
                  const imageOverlay = (
                    <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-white/95 to-transparent pt-6 pb-2 px-3 text-center pointer-events-none">
                      <span className="text-[8px] font-black tracking-[0.15em] text-slate-500 uppercase">
                        {language === 'AR' ? 'اليابان رقم ١' : "JAPAN'S N°1"}
                      </span>
                      {subtitle && (
                        <span className="block text-[7px] font-bold tracking-widest text-[#CC1F42] mt-0.5 uppercase truncate">
                          {subtitle}
                        </span>
                      )}
                    </div>
                  );

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenQuickView={onOpenQuickView}
                      className="flex-shrink-0 w-[230px] sm:w-[240px]"
                      style={{ scrollSnapAlign: 'start' }}
                      imageOverlay={imageOverlay}
                    />
                  );
                })}
              </div>

              {/* Right navigation arrow — positioned on edge of slider */}
              <button
                onClick={() => scrollBy('right')}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white text-slate-600 shadow-xl border border-slate-100 flex items-center justify-center hover:bg-[#CC1F42] hover:text-white hover:border-[#CC1F42] transition-all duration-300 active:scale-90"
                aria-label="Suivant"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center items-center gap-2.5">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => scrollToPage(i)}
                  className={`rounded-full border transition-all duration-300 ${
                    activeDot === i
                      ? 'w-5 h-2 bg-slate-800 border-slate-800'
                      : 'w-2 h-2 bg-transparent border-slate-400 hover:border-slate-700'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
