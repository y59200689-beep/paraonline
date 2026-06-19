'use client';

import React from 'react';
import { useTranslation } from '../context/LanguageContext';

export interface CategoryItem {
  id: string;
  tag: string;
  translationKey: string;
  image: string;
}

interface CategoryTrackProps {
  activeCategory: string;
  onSelectCategory: (tag: string) => void;
}

export const CategoryTrack: React.FC<CategoryTrackProps> = ({ activeCategory, onSelectCategory }) => {
  const { t } = useTranslation();

  const CATEGORIES: CategoryItem[] = [
    { id: 'all',          tag: 'all',          translationKey: 'circle_bestsellers',  image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=150&auto=format&fit=crop' },
    { id: 'offers',       tag: 'offers',       translationKey: 'circle_offers',       image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=150&auto=format&fit=crop' },
    { id: 'kbeauty',      tag: 'kbeauty',      translationKey: 'circle_kbeauty',      image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=150&auto=format&fit=crop' },
    { id: 'solaire',      tag: 'solaire',      translationKey: 'circle_solaire',      image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=150&auto=format&fit=crop' },
    { id: 'visage',       tag: 'visage',       translationKey: 'circle_visage',       image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=150&auto=format&fit=crop' },
    { id: 'cheveux',      tag: 'cheveux',      translationKey: 'circle_cheveux',      image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=150&auto=format&fit=crop' },
    { id: 'corps',        tag: 'corps',        translationKey: 'circle_corps',        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=150&auto=format&fit=crop' },
    { id: 'appareils',    tag: 'appareils',    translationKey: 'circle_appareils',    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=150&auto=format&fit=crop' },
    { id: 'accessoires',  tag: 'accessoires',  translationKey: 'circle_accessoires',  image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=150&auto=format&fit=crop' },
    { id: 'complements',  tag: 'complements',  translationKey: 'circle_complements',  image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=150&auto=format&fit=crop' },
    { id: 'maquillage',   tag: 'maquillage',   translationKey: 'circle_maquillage',   image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=150&auto=format&fit=crop' },
    { id: 'sport',        tag: 'sport',        translationKey: 'circle_sport',        image: 'https://images.unsplash.com/photo-1556229174-5e42a09e45af?q=80&w=150&auto=format&fit=crop' },
    { id: 'masques',      tag: 'masques',      translationKey: 'circle_masques',      image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=150&auto=format&fit=crop' },
    { id: 'homme',        tag: 'homme',        translationKey: 'circle_homme',        image: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=150&auto=format&fit=crop' },
    { id: 'bebe',         tag: 'bebe',         translationKey: 'circle_bebe',         image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=150&auto=format&fit=crop' },
  ];
 
  return (
    <section 
      className="py-16 md:py-20 bg-white/80 backdrop-blur-md border-b border-border/40"
      style={{ paddingTop: '32px', paddingBottom: '32px' }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">
        <div 
          className="flex gap-6 md:gap-8 overflow-x-auto pb-6 pt-6 snap-x scroll-smooth no-scrollbar"
          style={{ paddingTop: '12px', paddingBottom: '12px' }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.tag;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.tag)}
                className="flex flex-col items-center gap-2 snap-start shrink-0 group focus:outline-none"
              >
                <div className="relative">
                  <div
                    className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-300 transform group-hover:scale-105 ${
                      isActive
                        ? 'border-accent ring-4 ring-accent/20 shadow-lg shadow-accent/10'
                        : 'border-border group-hover:border-secondary'
                    }`}
                  >
                    <img
                      src={cat.image}
                      alt={t(cat.translationKey)}
                      className="w-full h-full object-cover select-none"
                      loading="lazy"
                    />
                  </div>
                  {(cat.id === 'offers' || cat.id === 'kbeauty') && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-accent border-2 border-white rounded-full animate-pulse" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-extrabold tracking-wide uppercase max-w-[72px] text-center leading-tight transition-colors duration-300 ${
                    isActive ? 'text-accent' : 'text-primary group-hover:text-secondary'
                  }`}
                >
                  {t(cat.translationKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
