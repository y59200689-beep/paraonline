'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/data';
import { useProducts } from '@/context/ProductsContext';
import { useTranslation } from '@/context/LanguageContext';
import { useUi } from '@/context/UiContext';
import { Sparkles, ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { useSettings } from '@/context/SettingsContext';

export const SummerSalePromo: React.FC = () => {
  const { language } = useTranslation();
  const { products } = useProducts();
  const { settings } = useSettings();
  const hp = settings?.homepageSections;
  const showSummerSale = hp?.showSummerSale ?? true;

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 20, seconds: 0 });
  const { setSelectedProduct } = useUi();

  useEffect(() => {
    // Generate random minutes between 15 and 30 and random seconds on client mount to avoid SSR hydration mismatch
    const randomMins = Math.floor(Math.random() * 16) + 15; // 15 to 30
    const randomSecs = Math.floor(Math.random() * 60);
    setTimeLeft({ days: 0, hours: 0, minutes: randomMins, seconds: randomSecs });

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        clearInterval(timer);
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const summerSaleItems = React.useMemo(() => {
    const curatedIds = hp?.summerSaleProductIds || [];
    if (curatedIds.length > 0) {
      return curatedIds
        .map(id => products.find(p => p.id === id))
        .filter((p): p is Product => !!p)
        .map(p => ({
          id: p.id,
          titleFr: p.nameFr || p.title,
          titleAr: p.title,
          image: p.image,
          price: p.price,
          comparePrice: p.comparePrice || p.price,
          rating: p.rating,
          category: p.category,
          vendor: p.vendor
        }));
    }

    return [
      {
        id: 3,
        titleFr: 'Garnier Sérum Vitamine C 30ml',
        titleAr: 'سيروم غارنييه فيتامين سي 30مل',
        image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=320&auto=format&fit=crop',
        price: 119,
        comparePrice: 139,
        rating: 4.6,
        category: 'visage',
        vendor: 'Garnier'
      },
      {
        id: 9,
        titleFr: 'Bioderma Photoderm Fluid SPF 50+',
        titleAr: 'بيوديرما واقي شمس سائل',
        image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=320&auto=format&fit=crop',
        price: 169,
        comparePrice: 191,
        rating: 4.9,
        category: 'solaire',
        vendor: 'Bioderma'
      },
      {
        id: 18,
        titleFr: 'Kérastase Huile Originale 100ml',
        titleAr: 'زيت كريستاس الأصلي 100مل',
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=320&auto=format&fit=crop',
        price: 450,
        comparePrice: 490,
        rating: 4.9,
        category: 'cheveux',
        vendor: 'Kérastase'
      },
      {
        id: 108,
        titleFr: 'Mixa Bébé Lait Très Doux',
        titleAr: 'حليب ميكسا بيبي اللطيف',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
        price: 119,
        comparePrice: 149,
        rating: 4.9,
        category: 'corps',
        vendor: 'Mixa'
      }
    ].map(item => {
      const dbProd = products.find(p => p.id === item.id);
      if (dbProd) {
        return {
          id: dbProd.id,
          titleFr: dbProd.nameFr || dbProd.title,
          titleAr: item.titleAr,
          image: dbProd.image,
          price: dbProd.price,
          comparePrice: dbProd.comparePrice || dbProd.price,
          rating: dbProd.rating,
          category: dbProd.category,
          vendor: dbProd.vendor
        };
      }
      return item;
    });
  }, [products, hp]);

  if (!showSummerSale || summerSaleItems.length === 0) return null;

  return (
    <section className="bg-[#FAFAFA] border-b border-slate-200/40 relative overflow-hidden py-10 md:py-16 reveal-on-scroll">
      {/* Premium campaign background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/promo/summer_sale_hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          opacity: 0.06,
          filter: 'saturate(1.4)',
        }}
      />
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 relative z-10">
        
        {/* Blue Frame Container */}
        <div className="bg-primary-dark rounded-[32px] p-6 md:p-8 shadow-[0_20px_50px_rgba(26,37,93,0.15)] border border-primary/30 relative overflow-hidden">
          
          {/* Ambient emerald glow orb and decorative orbit particles */}
          <div className="glow-orb glow-orb-emerald -bottom-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px]" />
          <div className="absolute top-6 left-6 w-24 h-24 pointer-events-none opacity-20 hidden md:block">
            <div className="orbit-particle orbit-particle-1 top-1/2 left-1/2" />
            <div className="orbit-particle orbit-particle-2 top-1/2 left-1/2" />
          </div>

          {/* Top Row: 3 White Cards (Optimized desktop layout to prevent circles clipping) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 relative z-10">
            
            {/* Left Card: Cicaplast Duo Pack Image (25% on desktop) */}
            <div className="lg:col-span-3 bg-white rounded-[24px] p-6 flex flex-col items-center justify-center relative overflow-hidden group min-h-[320px] shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-slate-100/50">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent pointer-events-none" />
              <div className="relative w-full aspect-square max-w-[240px] flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500 ease-out">
                <Image 
                  src="/images/cicaplast_bundle_nobg.webp" 
                  alt="Cicaplast Duo Pack" 
                  fill
                  sizes="240px"
                  preload={true}
                  loading="eager"
                  className="object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.06)]"
                />
              </div>
            </div>

            {/* Center Card: Countdown & Offer Details (50% on desktop to prevent clipping!) */}
            <div className="lg:col-span-6 bg-white rounded-[24px] p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-slate-100/50 min-h-[320px]">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-50/30 to-transparent pointer-events-none" />
              
              {/* Best Deal Badge */}
              <div className="mb-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#7C3AED]/90 backdrop-blur-sm shadow-sm tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  {language === 'AR' ? 'أفضل عرض' : 'Best Deal'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black text-emerald-500 bg-emerald-50 border border-emerald-100 shadow-sm animate-pulse">
                  <span>🔥</span>
                  <span>{language === 'AR' ? 'نشط الآن' : 'LIVE'}</span>
                </span>
              </div>

              {/* Summer Sale Heading */}
              <h3 className="text-3xl sm:text-[36px] font-black text-slate-800 tracking-tight mb-2 select-none font-heading">
                {language === 'AR' ? 'تخفيضات الصيف' : 'Summer Sale'}
              </h3>
              
              {/* Promo Subtext */}
              <p className="text-slate-500 text-sm max-w-[280px] leading-relaxed mb-6 font-medium">
                {language === 'AR' 
                  ? 'أسرع واحصل على خصومات على جميع المنتجات تصل إلى 30%' 
                  : 'Hurry & Get Discounts on all products up to 30% Off'}
              </p>

              {/* Square Block Countdown Timer Row */}
              <div className="flex items-center gap-1.5 sm:gap-3 mb-6 select-none" dir="ltr">
                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[12px] bg-white border border-slate-100 shadow-md flex flex-col items-center justify-center">
                    <span className="text-base sm:text-lg font-black text-primary leading-none">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[7px] sm:text-[8px] font-black text-slate-400 mt-1 tracking-wider uppercase">
                      {language === 'AR' ? 'دقيقة' : 'MINS'}
                    </span>
                  </div>
                </div>

                <span className="text-lg font-black text-slate-300 animate-pulse">:</span>

                {/* Seconds */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[12px] bg-white border border-slate-100 shadow-md flex flex-col items-center justify-center animate-pulse-ring">
                    <span className="text-base sm:text-lg font-black text-primary leading-none">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[7px] sm:text-[8px] font-black text-slate-400 mt-1 tracking-wider uppercase">
                      {language === 'AR' ? 'ثانية' : 'SECS'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shop Now CTA Button (With robust inline-style background color to solve uncompiled classes) */}
              <button 
                onClick={() => {
                  const el = document.getElementById('boutique-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="font-bold text-sm px-8 py-3.5 rounded-full transform active:scale-95 transition-all duration-300 flex items-center gap-2 group border-0 outline-none"
                style={{
                  background: 'linear-gradient(160deg, #1a4731 0%, #2d7a4f 55%, #1f5c3a 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 16px rgba(30,80,55,0.28), inset 0 1px 0 rgba(255,255,255,0.08)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(160deg, #153b28 0%, #256642 55%, #1a4d30 100%)';
                  e.currentTarget.style.boxShadow = '0 6px 22px rgba(30,80,55,0.38), inset 0 1px 0 rgba(255,255,255,0.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(160deg, #1a4731 0%, #2d7a4f 55%, #1f5c3a 100%)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(30,80,55,0.28), inset 0 1px 0 rgba(255,255,255,0.08)';
                }}
              >
                <span style={{ color: '#ffffff' }}>{language === 'AR' ? 'تسوق الآن' : 'Shop Now'}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" style={{ color: '#ffffff', stroke: '#ffffff' }} />
              </button>
            </div>

            {/* Right Card: Vichy Sunscreen Bundle Pack Image (25% on desktop) */}
            <div className="lg:col-span-3 bg-white rounded-[24px] p-6 flex flex-col items-center justify-center relative overflow-hidden group min-h-[320px] shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-slate-100/50">
              <div className="absolute inset-0 bg-gradient-to-bl from-slate-50/50 to-transparent pointer-events-none" />
              <div className="relative w-full aspect-square max-w-[240px] flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500 ease-out">
                <Image 
                  src="/images/vichy_sunscreen_bundle_nobg.webp" 
                  alt="Vichy Sunscreen Pack" 
                  fill
                  sizes="240px"
                  preload={true}
                  loading="eager"
                  className="object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.06)]"
                />
              </div>
            </div>

          </div>

          {/* Bottom Row: Horizontal Product Bar */}
          <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-slate-100/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-slate-100 rtl:lg:divide-x-reverse">
            {summerSaleItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => {
                  const dbProduct = products.find(p => p.id === item.id);
                  if (dbProduct) {
                    handleSelectProduct(dbProduct);
                  } else {
                    handleSelectProduct({
                      id: item.id,
                      vendor: 'Clinique',
                      title: language === 'AR' ? item.titleAr : item.titleFr,
                      category: item.category,
                      tags: [item.category],
                      price: item.price,
                      comparePrice: item.comparePrice,
                      image: item.image,
                      rating: item.rating,
                      reviews: 42,
                      images: [item.image],
                      ingredients: '',
                      usage: '',
                      description: 'Soin dermatologique haut de gamme.'
                    } as Product);
                  }
                }}
                className="flex items-center gap-4 px-4 lg:px-6 hover:bg-slate-50/80 transition-colors duration-300 cursor-pointer group"
              >
                {/* Left: Product Thumbnail Container */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-[#F8FAFC]/80 rounded-[14px] flex items-center justify-center group-hover:scale-105 transition-transform duration-300 border border-slate-100/50 overflow-hidden relative">
                  <Image 
                    src={getOptimizedImageUrl(item.image)} 
                    alt={item.titleFr} 
                    fill
                    sizes="(max-width: 640px) 64px, 80px"
                    className="object-cover filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.04)]"
                  />
                </div>

                {/* Right: Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                  <h4 className="text-sm font-bold text-slate-800 leading-snug truncate group-hover:text-primary transition-colors duration-200">
                    {language === 'AR' ? item.titleAr : item.titleFr}
                  </h4>
                  
                  {/* Rating Stars Row */}
                  <div className="flex items-center gap-1.5 my-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-3.5 h-3.5 fill-current ${
                            star <= Math.round(item.rating) 
                              ? 'text-amber-400' 
                              : 'text-slate-200'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 leading-none mt-0.5">
                      ({item.rating.toFixed(1)})
                    </span>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-base font-black text-primary leading-none">
                      {item.price} MAD
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400/80 line-through leading-none">
                      {item.comparePrice} MAD
                    </span>
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
