'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { PRODUCTS_DB } from '@/lib/data';
import { Zap, ShoppingBag, Star, Clock } from 'lucide-react';

export const FlashSaleBanner: React.FC = () => {
  const { addToCart, setIsCartOpen } = useCart();
  const { language } = useTranslation();
  const { convertPrice } = useCurrency();
  const [isAdding, setIsAdding] = useState(false);

  // Time remaining countdown target: end of current day
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      
      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      return { hours, minutes, seconds };
    };

    // Initial run
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Find product ID 17: Skin1004 Madagascar Centella Hyalu-Cica Water-Fit Sun Serum
  const originalProduct = PRODUCTS_DB.find((p) => p.id === 17);

  const handleAddToCart = () => {
    if (!originalProduct) return;
    setIsAdding(true);
    
    // Create discounted product (-30% discount on 209 DH normal price = 146 DH)
    const flashProduct = {
      ...originalProduct,
      price: 146,
      comparePrice: 209
    };

    setTimeout(() => {
      addToCart(flashProduct, 1, false);
      setIsAdding(false);
      setIsCartOpen(true);
    }, 450);
  };

  if (!originalProduct) return null;

  const TimeBlock = ({ value, label }: { value: number; label: string }) => {
    const formatted = value.toString().padStart(2, '0');
    return (
      <div className="flex flex-col items-center">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 min-w-[64px] md:min-w-[72px] shadow-lg flex items-center justify-center">
          <span className="font-mono text-xl md:text-3xl font-black text-emerald-450 tracking-tight tabular-nums">
            {formatted}
          </span>
        </div>
        <span className="text-[8px] md:text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-1.5">
          {label}
        </span>
      </div>
    );
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-slate-50 dark:bg-slate-950/20">
      {/* Background Subtle Mesh Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Double-Bezel Outer Shell (Contrast Dark Mode) */}
        <div className="p-2 md:p-3 rounded-[32px] bg-slate-950/95 border border-slate-900 shadow-2xl relative overflow-hidden">
          {/* Inner Content Core */}
          <div className="rounded-[calc(32px-8px)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden p-6 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
            
            {/* Left Column: Urgency & Product Offer */}
            <div className="space-y-6 flex flex-col justify-center items-start text-left">
              {/* Eyebrow Flash Tag */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Zap className="w-3 h-3 fill-emerald-400 text-emerald-400 animate-pulse" />
                {language === 'AR' ? 'عرض فلاش محدود' : 'VENTE FLASH LIMITÉE'}
              </span>

              {/* Title & Description */}
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  {language === 'AR' ? (
                    <>
                      سيروم الحماية الأكثر <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">طلبًا -30%</span>
                    </>
                  ) : (
                    <>
                      Le Best-Seller Solaire à <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">-30% Flash</span>
                    </>
                  )}
                </h2>
                
                {/* Stars Rating */}
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">5.0 (112 {language === 'AR' ? 'تقييم' : 'avis'})</span>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed font-medium max-w-[45ch]">
                  {language === 'AR' 
                    ? 'احصل على واقي الشمس العضوي الأكثر مبيعًا Skin1004 Madagascar Centella بتركيبته المائية الخفيفة بسعر حصري اليوم فقط.'
                    : 'Profitez de la protection organique culte Skin1004 Madagascar Centella avec sa formule gel-eau ultra-légère à prix exclusif. Aujourd’hui seulement.'
                  }
                </p>
              </div>

              {/* Pricing details */}
              <div className="space-y-1.5">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                  {language === 'AR' ? 'سعر خاص لفترة محدودة' : 'PRIX FLASH DE LA JOURNÉE'}
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-white">{convertPrice(146)}</span>
                  <span className="text-sm text-slate-500 line-through">{convertPrice(209)}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">
                    {language === 'AR' ? 'وفر 30%' : 'Économisez 30%'}
                  </span>
                </div>
              </div>

              {/* Countdown Timer Board */}
              <div className="space-y-2.5 w-full">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-emerald-450" />
                  <span>{language === 'AR' ? 'ينتهي العرض خلال' : 'L’offre se termine dans'}</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <TimeBlock value={timeLeft.hours} label={language === 'AR' ? 'ساعات' : 'Heures'} />
                  <span className="text-xl md:text-2xl font-black text-slate-800 animate-pulse">:</span>
                  <TimeBlock value={timeLeft.minutes} label={language === 'AR' ? 'دقائق' : 'Minutes'} />
                  <span className="text-xl md:text-2xl font-black text-slate-800 animate-pulse">:</span>
                  <TimeBlock value={timeLeft.seconds} label={language === 'AR' ? 'ثواني' : 'Secondes'} />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="group relative inline-flex items-center gap-4 pl-6 pr-2 py-2 rounded-full bg-emerald-450 hover:bg-emerald-400 text-slate-950 hover:text-slate-950 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-400/25 active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer border-0 outline-none w-full md:w-auto justify-between"
              >
                <span className="text-xs font-black uppercase tracking-wider">
                  {isAdding 
                    ? (language === 'AR' ? 'جاري الإضافة...' : 'Ajout...') 
                    : (language === 'AR' ? 'اشتري الآن' : 'Acheter Maintenant')
                  }
                </span>
                {/* Button-in-Button trailing icon */}
                <div className="w-8 h-8 rounded-full bg-slate-950/15 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-slate-950 group-hover:text-emerald-400 group-hover:translate-x-0.5">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            {/* Right Column: Premium Visual of Product with Glassmorphic discount tag */}
            <div className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden border border-slate-900 shadow-xl group">
              <div className="absolute inset-0 bg-slate-950">
                <Image
                  src="/images/promo/flash_sale_banner.png"
                  alt="Skin1004 Madagascar Centella Water-Fit Sun Serum Flash Sale"
                  fill
                  sizes="(max-w-768px) 100vw, 50vw"
                  className="object-cover object-right transition-transform duration-1000 group-hover:scale-105"
                  priority
                />
              </div>

              {/* Holographic glowing borders around the image */}
              <div className="absolute inset-0 pointer-events-none z-10 border border-white/5 rounded-[24px]" />

              {/* Floating Glassmorphic Discount Badge */}
              <div className="absolute top-4 right-4 z-20 pointer-events-none p-1.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
                <div className="px-3 py-2 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest leading-none">
                    FLASH
                  </span>
                  <span className="text-xl font-extrabold text-white leading-none mt-0.5">
                    -30%
                  </span>
                </div>
              </div>

              {/* Technical Corners overlays */}
              <div className="absolute inset-2 border border-white/5 pointer-events-none z-20">
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/30" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/30" />
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-white/30" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/30" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
