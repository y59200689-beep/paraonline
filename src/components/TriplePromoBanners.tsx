'use client';

import React from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useUi } from '@/context/UiContext';
import Image from 'next/image';

export interface TriplePromoCard {
  tagFr: string;
  tagAr: string;
  titleFr: string;
  titleAr: string;
  price: string;
  bgImage: string;
  overlayImage: string;
  category: string;
}

interface TriplePromoBannersProps {
  cards?: TriplePromoCard[];
}

export const TriplePromoBanners: React.FC<TriplePromoBannersProps> = ({ cards }) => {
  const { language } = useTranslation();
  const { setActiveCategory } = useUi();

  const handleCategoryClick = (category: string) => {
    const el = document.getElementById('boutique-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setActiveCategory(category);
  };

  const defaultCards: TriplePromoCard[] = [
    {
      tagFr: "Sans Parfum",
      tagAr: "خالٍ من العطور",
      titleFr: "Soin Bébé\nMustela Doux",
      titleAr: "عناية الطفل\nمستحضرات لطيفة",
      price: "99 MAD",
      bgImage: "/images/promo/card_baby.png",
      overlayImage: "/images/categories/bebe.png",
      category: "bebe"
    },
    {
      tagFr: "Protection Max",
      tagAr: "حماية قصوى",
      titleFr: "Packs Solaires\nAnthelios Pack",
      titleAr: "واقيات الشمس\nحماية متكاملة",
      price: "159 MAD",
      bgImage: "/images/promo/card_sun.png",
      overlayImage: "/images/categories/solaire.png",
      category: "solaire"
    },
    {
      tagFr: "Protocole Nuit",
      tagAr: "بروتوكول الليل",
      titleFr: "Anti-Âge\nRétinol",
      titleAr: "مكافحة الشيخوخة\nبروتوكول ريتينول",
      price: "199 MAD",
      bgImage: "/images/promo/card_antiage.png",
      overlayImage: "/images/categories/solaire.png",
      category: "visage"
    }
  ];

  const list = cards && cards.length > 0 ? cards : defaultCards;

  return (
    <section className="py-10 bg-[#FAFAFA] border-b border-slate-200/40 relative overflow-hidden reveal-on-scroll">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {list.slice(0, 3).map((card, idx) => (
            <div 
              key={idx}
              className="group relative overflow-hidden rounded-[24px] p-6 flex flex-col justify-between h-[200px] md:h-[210px] transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(93,133,248,0.15)] shadow-md border border-slate-100/20"
            >
              {/* Premium editorial background */}
              <div className="absolute inset-0 rounded-[24px] overflow-hidden">
                <Image
                  src={card.bgImage}
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
                  <h3 className="text-lg sm:text-xl font-sans font-black text-white leading-tight tracking-tight drop-shadow-sm whitespace-pre-line">
                    {language === 'AR' ? card.titleAr : card.titleFr}
                  </h3>
                  <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mt-1">
                    {language === 'AR' ? card.tagAr : card.tagFr}
                  </p>
                </div>

                <div className="mt-auto">
                  <div className="mb-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-white/70 block leading-none">
                      {language === 'AR' ? 'فقط' : 'Seulement'}
                    </span>
                    <span className="text-xl sm:text-2xl font-sans font-black text-white leading-none drop-shadow-sm">{card.price}</span>
                  </div>

                  <div
                    onClick={() => handleCategoryClick(card.category)}
                    className="px-6 py-2 font-sans font-extrabold text-[10px] uppercase tracking-wider rounded-full hover:scale-105 active:scale-95 transition-all shadow-md w-max cursor-pointer select-none text-center bg-white text-slate-800"
                  >
                    {language === 'AR' ? 'تسوق الآن' : 'Acheter'}
                  </div>
                </div>
              </div>

              {/* Overlapping image */}
              {card.overlayImage && (
                <div className="absolute right-[-10px] bottom-[-5px] w-[150px] h-[150px] md:w-[170px] md:h-[170px] pointer-events-none select-none transform translate-y-3 translate-x-1 group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-500 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.12)]">
                  <Image 
                    src={card.overlayImage} 
                    alt="" 
                    fill
                    sizes="(max-width: 768px) 150px, 170px"
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
