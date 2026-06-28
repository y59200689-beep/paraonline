'use client';

import React from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useUi } from '@/context/UiContext';
import Image from 'next/image';

export const TriplePromoBanners: React.FC = () => {
  const { language } = useTranslation();
  const { setActiveCategory } = useUi();

  const handleCategoryClick = (category: string) => {
    const el = document.getElementById('boutique-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setActiveCategory(category);
  };

  return (
    <section className="py-10 bg-[#FAFAFA] border-b border-slate-200/40 relative overflow-hidden reveal-on-scroll">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1: Soin Bébé */}
          <div className="group relative overflow-hidden rounded-[24px] p-6 flex flex-col justify-between h-[200px] md:h-[210px] transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(93,133,248,0.20)] shadow-md border border-slate-100/20">
            {/* Premium editorial background */}
            <div className="absolute inset-0 rounded-[24px] overflow-hidden">
              <Image
                src="/images/promo/card_baby.png"
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center scale-[1.02] group-hover:scale-110 transition-transform duration-700 ease-out"
                aria-hidden
              />
              {/* Frosted overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f2445]/80 via-[#0f2445]/20 to-transparent" />
            </div>

            {/* Text content (Left aligned) */}
            <div className="w-[58%] flex flex-col h-full relative z-10 select-none text-left">
              <div>
                <h3 className="text-lg sm:text-xl font-sans font-black text-white leading-tight tracking-tight drop-shadow-sm">
                  <span className="border-b-2 border-white/80 pb-0.5">{language === 'AR' ? 'عناية الطفل' : 'Soin Bébé'}</span>
                  <br />
                  {language === 'AR' ? 'مستحضرات لطيفة' : 'Mustela Doux'}
                </h3>
                <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mt-1">
                  {language === 'AR' ? 'خالٍ من العطور' : 'Sans Parfum'}
                </p>
              </div>

              <div className="mt-auto">
                <div className="mb-2">
                  <span className="text-[9px] font-black uppercase tracking-wider text-white/70 block leading-none">
                    {language === 'AR' ? 'فقط' : 'Seulement'}
                  </span>
                  <span className="text-xl sm:text-2xl font-sans font-black text-white leading-none drop-shadow-sm">99 MAD</span>
                </div>

                <div
                  onClick={() => handleCategoryClick('bebe')}
                  className="px-6 py-2 font-sans font-extrabold text-[10px] uppercase tracking-wider rounded-full hover:scale-105 active:scale-95 transition-all shadow-md w-max cursor-pointer select-none text-center bg-white text-brand-baby"
                >
                  {language === 'AR' ? 'تسوق الآن' : 'Acheter'}
                </div>
              </div>
            </div>

            {/* Overlapping Baby image */}
            <div className="absolute right-[-10px] bottom-[-5px] w-[150px] h-[150px] md:w-[170px] md:h-[170px] pointer-events-none select-none transform translate-y-3 translate-x-1 group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-500 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.12)]">
              <Image 
                src="/images/categories/bebe.png" 
                alt="Soin Bébé" 
                fill
                sizes="(max-width: 768px) 150px, 170px"
                className="object-contain"
              />
            </div>
          </div>

          {/* Card 2: Gamme Solaire — upgraded with editorial sun photography */}
          <div className="group relative overflow-hidden rounded-[24px] p-6 flex flex-col justify-between h-[200px] md:h-[210px] transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(180,140,60,0.20)] shadow-md border border-slate-100/20">
            {/* Premium editorial background */}
            <div className="absolute inset-0 rounded-[24px] overflow-hidden">
              <Image
                src="/images/promo/card_sun.png"
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center scale-[1.02] group-hover:scale-110 transition-transform duration-700 ease-out"
                aria-hidden
              />
              {/* Warm amber overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#3d2900]/75 via-[#3d2900]/15 to-transparent" />
            </div>

            {/* Text content (Left aligned) */}
            <div className="w-[58%] flex flex-col h-full relative z-10 select-none text-left">
              <div>
                <h3 className="text-lg sm:text-xl font-sans font-black text-white leading-tight tracking-tight drop-shadow-sm">
                  <span className="border-b-2 border-white/80 pb-0.5">{language === 'AR' ? 'واقيات الشمس' : 'Packs Solaires'}</span>
                  <br />
                  {language === 'AR' ? 'حماية متكاملة' : 'Anthelios Pack'}
                </h3>
                <p className="text-[10px] font-bold text-amber-200/90 uppercase tracking-widest mt-1">
                  {language === 'AR' ? 'حماية قصوى' : 'Protection Max'}
                </p>
              </div>

              <div className="mt-auto">
                <div className="mb-2">
                  <span className="text-[9px] font-black uppercase tracking-wider text-white/70 block leading-none">
                    {language === 'AR' ? 'فقط' : 'Seulement'}
                  </span>
                  <span className="text-xl sm:text-2xl font-sans font-black text-white leading-none drop-shadow-sm">159 MAD</span>
                </div>

                <div
                  onClick={() => handleCategoryClick('solaire')}
                  className="px-6 py-2 font-sans font-extrabold text-[10px] uppercase tracking-wider rounded-full hover:scale-105 active:scale-95 transition-all shadow-md w-max cursor-pointer select-none text-center bg-[#b5905b] text-white"
                >
                  {language === 'AR' ? 'تسوق الآن' : 'Acheter'}
                </div>
              </div>
            </div>

            {/* Overlapping Solaire image */}
            <div className="absolute right-[-10px] bottom-[-5px] w-[150px] h-[150px] md:w-[170px] md:h-[170px] pointer-events-none select-none transform translate-y-3 translate-x-1 group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-500 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.12)]">
              <Image 
                src="/images/categories/solaire.png" 
                alt="Packs Solaires" 
                fill
                sizes="(max-width: 768px) 150px, 170px"
                className="object-contain"
              />
            </div>
          </div>

          {/* Card 3: Anti-Âge / Rétinol — upgraded with cinematic editorial photography */}
          <div className="group relative overflow-hidden rounded-[24px] p-6 flex flex-col justify-between h-[200px] md:h-[210px] transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(26,71,49,0.30)] shadow-md border border-slate-100/10">
            {/* Premium editorial background */}
            <div className="absolute inset-0 rounded-[24px] overflow-hidden">
              <Image
                src="/images/promo/card_antiage.png"
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center scale-[1.02] group-hover:scale-110 transition-transform duration-700 ease-out"
                aria-hidden
              />
              {/* Deep forest green overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b2117]/80 via-[#0b2117]/20 to-transparent" />
            </div>

            {/* Text content (Left aligned) */}
            <div className="w-[58%] flex flex-col h-full relative z-10 select-none text-left">
              <div>
                <h3 className="text-xl sm:text-xl font-sans font-black text-white leading-tight tracking-tight drop-shadow-sm">
                  <span className="border-b-2 border-white/60 pb-0.5">{language === 'AR' ? 'مكافحة الشيخوخة' : 'Anti-Âge'}</span>
                  <br />
                  {language === 'AR' ? 'بروتوكول ريتينول' : 'Rétinol'}
                </h3>
                <p className="text-[10px] font-bold text-emerald-300/90 uppercase tracking-widest mt-1">
                  {language === 'AR' ? 'بروتوكول الليل' : 'Protocole Nuit'}
                </p>
              </div>

              <div className="mt-auto text-left">
                <div className="mb-2">
                  <span className="text-[9px] font-black uppercase tracking-wider text-white/70 block leading-none">
                    {language === 'AR' ? 'فقط' : 'Seulement'}
                  </span>
                  <span className="text-xl sm:text-2xl font-sans font-black text-white leading-none drop-shadow-sm">199 MAD</span>
                </div>

                <div
                  onClick={() => handleCategoryClick('visage')}
                  className="px-6 py-2 font-sans font-extrabold text-[10px] uppercase tracking-wider rounded-full hover:scale-105 active:scale-95 transition-all shadow-md w-max cursor-pointer select-none text-center bg-[#1a4731] text-white border border-emerald-700/40"
                >
                  {language === 'AR' ? 'تسوق الآن' : 'Prescrire'}
                </div>
              </div>
            </div>

            {/* Overlapping anti-age product image */}
            <div className="absolute right-[-10px] bottom-[-5px] w-[150px] h-[150px] md:w-[170px] md:h-[170px] pointer-events-none select-none transform translate-y-3 translate-x-1 group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-500 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.18)]">
              <Image 
                src="/images/categories/solaire.png" 
                alt="Anti-Âge Rétinol" 
                fill
                sizes="(max-width: 768px) 150px, 170px"
                className="object-contain"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
