'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { PRODUCTS_DB, Product } from '@/lib/data';
import { ChevronLeft, ChevronRight, ShoppingBag, Star, Award, ShieldCheck, Sparkles } from 'lucide-react';

export const FeaturedIngredientSection: React.FC = () => {
  const { language } = useTranslation();
  const { addToCart, setIsCartOpen } = useCart();
  const { convertPrice } = useCurrency();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [addingId, setAddingId] = useState<number | null>(null);

  // Filter products containing Centella
  const centellaProducts = PRODUCTS_DB.filter((p) => {
    const searchString = `${p.ingredients} ${p.description} ${p.title} ${p.nameFr}`.toLowerCase();
    return searchString.includes('centella');
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      // Scroll by approximately one card width plus gap (e.g. 300px)
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddingId(product.id);
    setTimeout(() => {
      addToCart(product, 1);
      setAddingId(null);
      setIsCartOpen(true);
    }, 400);
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-white dark:bg-slate-950/10">
      {/* Background soft green radial glow */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-left mb-10 md:mb-14 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15">
            <Award className="w-3 h-3 text-emerald-500" />
            {language === 'AR' ? 'مكون الأسبوع المميز' : 'ACTIF VEDETTE DE LA SEMAINE'}
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
            {language === 'AR' ? (
              <>
                اكتشفي قوة <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">السنتيلا أسياتيكا</span>
              </>
            ) : (
              <>
                Zoom Scientifique : <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">La Centella Asiatica</span>
              </>
            )}
          </h2>
        </div>

        {/* Asymmetrical Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 items-stretch">
          
          {/* Column 1: Educational Profile Card (1/3 width on desktop) */}
          <div className="p-1.5 rounded-[28px] bg-slate-100/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 shadow-sm flex flex-col h-full justify-between">
            <div className="rounded-[calc(28px-6px)] bg-slate-50 dark:bg-slate-900/60 p-6 flex flex-col justify-between h-full space-y-6">
              
              <div className="space-y-4">
                {/* Botanical Badge */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌿</span>
                    <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                      {language === 'AR' ? 'مستخلص نباتي' : 'Botanique'}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[8.5px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    {language === 'AR' ? 'ممتاز وآمن' : 'Grade Clinique'}
                  </span>
                </div>

                {/* Active Details */}
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">
                    {language === 'AR' ? 'سنتيلا أسياتيكا (سيكا)' : 'Centella Asiatica (Cica)'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {language === 'AR'
                      ? 'تُعرف باسم "عشبة النمر" وهي ركيزة أساسية في الطب الآسيوي التقليدي وعلم الكوزمتكس الحديث لخصائصها الفائقة في إصلاح الجلد.'
                      : 'Aussi connue sous le nom d’Herbe du Tigre, c’est un pilier de la dermo-cosmétique coréenne, réputée pour ses vertus réparatrices et apaisantes hors normes.'
                    }
                  </p>
                </div>

                {/* Key Scientific Benefits */}
                <div className="space-y-2.5 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {language === 'AR' ? 'الخصائص العلاجية' : 'Propriétés Clés'}
                  </span>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span className="text-xs text-slate-650 dark:text-slate-350 font-medium">
                        {language === 'AR' ? 'تهدئة فورية للاحمرار والتهيجات' : 'Calme instantanément les inflammations et rougeurs.'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span className="text-xs text-slate-650 dark:text-slate-350 font-medium">
                        {language === 'AR' ? 'تحفيز بناء الكولاجين وتجديد الخلايا' : 'Stimule la synthèse de collagène endogène.'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span className="text-xs text-slate-650 dark:text-slate-350 font-medium">
                        {language === 'AR' ? 'تقوية وإصلاح حاجز البشرة التالف' : 'Restaure et renforce la barrière cutanée altérée.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Science HUD Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200/40 dark:border-slate-800/40">
                <div className="bg-slate-100/50 dark:bg-slate-950/20 p-2.5 rounded-xl text-left">
                  <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">
                    {language === 'AR' ? 'التركيز الفعال' : 'CONCENTRATION'}
                  </span>
                  <span className="text-sm font-black text-slate-800 dark:text-white">
                    Up to 77%
                  </span>
                </div>
                <div className="bg-slate-100/50 dark:bg-slate-950/20 p-2.5 rounded-xl text-left">
                  <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">
                    {language === 'AR' ? 'نوع البشرة' : 'TYPE DE PEAU'}
                  </span>
                  <span className="text-sm font-black text-slate-800 dark:text-white">
                    {language === 'AR' ? 'الحساسة' : 'Sensibles'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Column 2: Product Carousel (2/3 width on desktop) */}
          <div className="lg:col-span-2 flex flex-col justify-between relative">
            
            {/* Carousel Header Controls */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                {language === 'AR' 
                  ? `منتجات تحتوي على السنتيلا (${centellaProducts.length})` 
                  : `Produits enrichis en Cica (${centellaProducts.length})`
                }
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => scroll('left')}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all cursor-pointer outline-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all cursor-pointer outline-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable container with native snap */}
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4"
            >
              {centellaProducts.map((product) => (
                <div
                  key={product.id}
                  className="snap-start shrink-0 w-[270px] md:w-[290px] p-1.5 rounded-[24px] bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 shadow-sm hover:border-emerald-500/20 transition-all duration-300"
                >
                  <div className="rounded-[calc(24px-6px)] bg-white dark:bg-slate-900 p-4 space-y-4 flex flex-col justify-between h-full">
                    
                    {/* Product Image Area */}
                    <div className="relative aspect-square w-full rounded-2xl bg-slate-50 dark:bg-slate-950 overflow-hidden group">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-contain p-2 transition-transform duration-700 group-hover:scale-105"
                      />
                      
                      {/* Floating Vendor Tag */}
                      <span className="absolute top-3 left-3 text-[7.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-950/80 text-white backdrop-blur-sm">
                        {product.vendor}
                      </span>
                    </div>

                    {/* Product Information */}
                    <div className="space-y-2 flex-grow">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-2 min-h-[2.5rem]">
                        {language === 'AR' && product.name ? product.name : (product.nameFr || product.title)}
                      </h4>
                      
                      {/* Star Rating */}
                      <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(product.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200 dark:text-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {product.rating}
                        </span>
                      </div>
                    </div>

                    {/* Pricing & Add to Cart Action */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800 dark:text-white">
                          {convertPrice(product.price)}
                        </span>
                        {product.comparePrice > product.price && (
                          <span className="text-[9px] text-slate-450 line-through">
                            {convertPrice(product.comparePrice)}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart button */}
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={addingId === product.id}
                        className="p-2 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-emerald-500 dark:hover:bg-emerald-500 hover:text-white dark:hover:text-white transition-all duration-300 cursor-pointer border-0 outline-none flex items-center justify-center active:scale-90"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
