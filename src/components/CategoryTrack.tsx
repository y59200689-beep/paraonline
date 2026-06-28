'use client';

import React from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export interface CategoryItem {
  id: string;
  tag: string;
  translationKey: string;
  image: string;
  gradientStart: string;
  activeColor: string;
}

interface CategoryTrackProps {
  activeCategory: string;
  onSelectCategory: (tag: string) => void;
}

// Category product photos are loaded directly from the public/images/categories/ folder

export const CategoryTrack: React.FC<CategoryTrackProps> = ({ activeCategory, onSelectCategory }) => {
  const { t, language } = useTranslation();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = React.useState(false);
  const [showRightFade, setShowRightFade] = React.useState(true);

  const handleScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 5);
    const maxScroll = el.scrollWidth - el.clientWidth;
    setShowRightFade(el.scrollLeft < maxScroll - 5);
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    // Check initial scroll limits after entrance animations complete
    const timer = setTimeout(handleScroll, 500);
    
    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      clearTimeout(timer);
    };
  }, [handleScroll]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = el.querySelectorAll('button');
    if (cards.length > 0) {
      const firstCard = cards[0] as HTMLElement;
      const cardWidth = firstCard.offsetWidth;
      const flexContainer = el.firstElementChild as HTMLElement;
      const gap = flexContainer ? parseInt(window.getComputedStyle(flexContainer).gap) || 20 : 20;
      
      // Scroll smoothly by exactly 5 cards (card width + layout gaps)
      const scrollAmount = 5 * (cardWidth + gap);
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const CATEGORIES: CategoryItem[] = [
    { id: 'all',          tag: 'all',          translationKey: 'circle_bestsellers',  image: '', gradientStart: '#FFF0E0', activeColor: '#D97706' },
    { id: 'offers',       tag: 'offers',       translationKey: 'circle_offers',       image: '', gradientStart: '#FFE5EC', activeColor: '#E11D48' },
    { id: 'kbeauty',      tag: 'kbeauty',      translationKey: 'circle_kbeauty',      image: '', gradientStart: '#E0F2FE', activeColor: '#2573a3' },
    { id: 'solaire',      tag: 'solaire',      translationKey: 'circle_solaire',      image: '', gradientStart: '#FFF3D1', activeColor: '#F97316' },
    { id: 'visage',       tag: 'visage',       translationKey: 'circle_visage',       image: '', gradientStart: '#E0F7FA', activeColor: '#10B981' },
    { id: 'cheveux',      tag: 'cheveux',      translationKey: 'circle_cheveux',      image: '', gradientStart: '#FBE9E7', activeColor: '#B45309' },
    { id: 'corps',        tag: 'corps',        translationKey: 'circle_corps',        image: '', gradientStart: '#F3E5F5', activeColor: '#8B5CF6' },
    { id: 'appareils',    tag: 'appareils',    translationKey: 'circle_appareils',    image: '', gradientStart: '#ECE0FD', activeColor: '#6366F1' },
    { id: 'accessoires',  tag: 'accessoires',  translationKey: 'circle_accessoires',  image: '', gradientStart: '#FFEBE6', activeColor: '#F43F5E' },
    { id: 'complements',  tag: 'complements',  translationKey: 'circle_complements',  image: '', gradientStart: '#E8F5E9', activeColor: '#10B981' },
    { id: 'maquillage',   tag: 'maquillage',   translationKey: 'circle_maquillage',   image: '', gradientStart: '#FFEBEE', activeColor: '#E11D48' },
    { id: 'sport',        tag: 'sport',        translationKey: 'circle_sport',        image: '', gradientStart: '#E0F2FE', activeColor: '#0EA5E9' },
    { id: 'masques',      tag: 'masques',      translationKey: 'circle_masques',      image: '', gradientStart: '#E0F2F1', activeColor: '#0D9488' },
    { id: 'homme',        tag: 'homme',        translationKey: 'circle_homme',        image: '', gradientStart: '#ECEFF1', activeColor: '#3B82F6' },
    { id: 'bebe',         tag: 'bebe',         translationKey: 'circle_bebe',         image: '', gradientStart: '#FFFDE7', activeColor: '#F59E0B' },
  ];

  const isRTL = language === 'AR';

  return (
    <div className="w-full bg-[#FAFAFA] border-b border-slate-200/40 pt-6 pb-2 md:pt-8 md:pb-3 overflow-hidden">
      
      {/* Centered title & track container */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 relative w-full">
        {/* Header section aligns exactly with rest of page sections */}
        <div 
          className="mb-4 flex justify-between items-end select-none font-sans"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <h2 className="text-xl sm:text-2xl md:text-[22px] font-bold text-slate-800 tracking-tight leading-none">
            {language === 'AR' ? 'الفئات' : 'Categories'}
          </h2>
        </div>

        {/* Scrollable track: kept within centered container boundaries */}
        <div className="relative w-full group/track">
          


          {/* Navigation Arrows positioned relative to centered boundary */}
          <div className="absolute inset-x-0 top-[50%] -translate-y-1/2 -mx-4 pointer-events-none z-20 flex justify-between">
            {/* Left Navigation Arrow */}
            <button
              onClick={() => scroll(isRTL ? 'right' : 'left')}
              className={`w-9 h-9 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/50 shadow-md rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer pointer-events-auto ${
                showLeftFade ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
              }`}
              aria-label="Défiler à gauche"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Right Navigation Arrow */}
            <button
              onClick={() => scroll(isRTL ? 'left' : 'right')}
              className={`w-9 h-9 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/50 shadow-md rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer pointer-events-auto ${
                showRightFade ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
              }`}
              aria-label="Défiler à droite"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Scroll Container with bleed track margins */}
          <div 
            ref={scrollRef}
            className="-mx-5 sm:-mx-7 md:-mx-10 lg:-mx-12 overflow-x-auto no-scrollbar pt-1 pb-1 scroll-smooth"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div
              className="flex flex-row flex-nowrap gap-4 snap-x pt-2 pb-6 px-5 sm:px-7 md:px-10 lg:px-12"
            >
              {CATEGORIES.map((cat, index) => {
                 const isActive = activeCategory === cat.tag;
                 
                 // Exact top-down gradient; borderless layout with soft shadow; overflow-hidden to crop bleeding illustrations
                 const cardStyle: React.CSSProperties = {
                   background: `linear-gradient(180deg, ${cat.gradientStart} 0%, #FFFFFF 100%)`,
                   boxShadow: isActive 
                     ? '0 12px 30px rgba(149, 157, 165, 0.22)' 
                     : '0 8px 24px rgba(149, 157, 165, 0.15)',
                   border: 'none',
                   animationDelay: `${index * 50}ms`,
                   willChange: 'transform, box-shadow'
                 };

                 return (
                   <button
                     key={cat.id}
                     onClick={() => onSelectCategory(cat.tag)}
                     className={`relative flex flex-col items-center justify-between snap-start shrink-0 pt-3 pb-3 px-2 rounded-[20px] transition-all duration-500 focus:outline-none overflow-hidden group active:scale-95 cursor-pointer w-[100px] h-[110px] sm:w-[110px] sm:h-[120px] md:w-[115px] md:h-[125px] lg:w-[calc((100%-112px)/8)] lg:h-[128px] animate-slide-up hover:-translate-y-1 ${
                       isActive ? 'scale-[1.03]' : ''
                     }`}
                     style={cardStyle}
                   >
                     {/* Premium Real Product Photography */}
                     <div className="relative w-full h-[60px] sm:h-[68px] md:h-[72px] lg:h-[74px] flex items-center justify-center overflow-hidden select-none mt-1">
                       <div className="relative w-[54px] h-[54px] sm:w-[62px] sm:h-[62px] md:w-[68px] md:h-[68px] lg:w-[70px] lg:h-[70px] pointer-events-none select-none group-hover:scale-105 transition-transform duration-500 ease-out">
                         <Image 
                           src={`/images/categories/${cat.tag}.png`}
                           alt={t(cat.translationKey)}
                           fill
                           sizes="(max-width: 640px) 54px, (max-width: 768px) 62px, 70px"
                           className="object-contain"
                         />
                       </div>
                     </div>
                     
                     {/* Interactive active dot indicator for offers */}
                     {cat.id === 'offers' && (
                       <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-accent rounded-full animate-pulse shadow-sm z-10" />
                     )}

                     {/* Centered Modern Title text in Sans-Serif */}
                     <span
                       className={`text-[11px] tracking-tight text-center leading-tight transition-colors duration-300 font-bold select-none px-1 h-7 flex items-center justify-center font-sans z-10 ${
                         isActive ? 'text-slate-800 font-extrabold' : 'text-slate-700 group-hover:text-slate-800'
                       }`}
                     >
                       {t(cat.translationKey)}
                     </span>
                   </button>
                 );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
