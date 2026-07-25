'use client';

import React from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useUi } from '@/context/UiContext';
import Image from 'next/image';
import { useGalleryOverrides } from '@/lib/useGalleryOverrides';

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
  const { getDisplayImage } = useGalleryOverrides();

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
      price: "",
      bgImage: "/images/promo/card_baby.webp",
      overlayImage: "/images/categories/bebe.webp",
      category: "bebe"
    },
    {
      tagFr: "Protection Max",
      tagAr: "حماية قصوى",
      titleFr: "Pack Solaire",
      titleAr: "واقيات الشمس",
      price: "",
      bgImage: "/images/promo/card_sun.webp",
      overlayImage: "/images/categories/solaire.webp",
      category: "solaire"
    },
    {
      tagFr: "Protocole Nuit",
      tagAr: "عناية مركزة",
      titleFr: "Sérums",
      titleAr: "سيرومات",
      price: "",
      bgImage: "/images/promo/card_antiage.webp",
      overlayImage: "/images/categories/visage.webp",
      category: "visage"
    }
  ];

  const list = cards && cards.length > 0 ? cards : defaultCards;

  const cardKeysMap: Record<number, { bgKeys: string[]; overlayKeys: string[] }> = {
    0: { bgKeys: ['card_baby'], overlayKeys: ['overlay_bebe', 'cat_bebe'] },
    1: { bgKeys: ['card_sun'], overlayKeys: ['overlay_solaire', 'cat_solaire'] },
    2: { bgKeys: ['card_antiage'], overlayKeys: ['overlay_visage', 'cat_visage'] },
  };

  return (
    <section className="py-10 bg-[#FAFAFA] border-b border-slate-200/40 relative overflow-hidden reveal-on-scroll">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {list.slice(0, 3).map((card, idx) => {
            const keys = cardKeysMap[idx] || { bgKeys: [], overlayKeys: [] };
            const bgSrc = getDisplayImage(card.bgImage, ...keys.bgKeys);
            const overlaySrc = card.overlayImage ? getDisplayImage(card.overlayImage, ...keys.overlayKeys) : '';

            return (
              <div 
                key={idx}
                className="group relative overflow-hidden rounded-[24px] p-6 flex flex-col justify-between h-[200px] md:h-[210px] transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(93,133,248,0.15)] shadow-md border border-slate-100/20"
              >
                {/* Premium editorial background */}
                <div className="absolute inset-0 rounded-[24px] overflow-hidden">
                  <Image
                    src={bgSrc}
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
                    <div
                      onClick={() => handleCategoryClick(card.category)}
                      className="px-6 py-2 font-sans font-extrabold text-[10px] uppercase tracking-wider rounded-full hover:scale-105 active:scale-95 transition-all shadow-md w-max cursor-pointer select-none text-center bg-white text-slate-800"
                    >
                      {language === 'AR' ? 'تسوق الآن' : 'Acheter'}
                    </div>
                  </div>
                </div>

                {/* Overlapping image */}
                {overlaySrc && (
                  <div className="absolute right-[-10px] bottom-[-5px] w-[150px] h-[150px] md:w-[170px] md:h-[170px] pointer-events-none select-none transform translate-y-3 translate-x-1 group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-500 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.12)]">
                    <Image 
                      src={overlaySrc} 
                      alt="" 
                      fill
                      sizes="(max-width: 768px) 150px, 170px"
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
