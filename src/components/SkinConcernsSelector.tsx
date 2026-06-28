'use client';

import React from 'react';
import Image from 'next/image';
import { useUi } from '@/context/UiContext';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export const SkinConcernsSelector: React.FC = () => {
  const { 
    activeConcern, 
    setActiveConcern, 
    setActiveCategory, 
    setActiveIngredient 
  } = useUi();
  const { language } = useTranslation();

  const CONCERNS = [
    {
      key: 'acne',
      titleFr: 'Acné & Imperfections',
      titleAr: 'حب الشباب والشوائب',
      subtitleFr: 'Centella Asiatica, BHA',
      subtitleAr: 'سنتيلا أسياتيكا، BHA',
      image: '/images/concern_acne.png',
      gridClass: 'md:col-span-2',
      bgGradient: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/20 dark:to-teal-950/20',
      activeBorder: 'border-emerald-500'
    },
    {
      key: 'spots',
      titleFr: 'Éclat & Anti-taches',
      titleAr: 'نضارة البشرة والبقع',
      subtitleFr: 'Vitamine C, Niacinamide',
      subtitleAr: 'فيتامين سي، نياسيناميد',
      image: '/images/concern_spots.png',
      gridClass: 'md:col-span-1',
      bgGradient: 'from-amber-500/10 to-orange-500/10 dark:from-amber-950/20 dark:to-orange-950/20',
      activeBorder: 'border-amber-500'
    },
    {
      key: 'wrinkles',
      titleFr: 'Anti-âge & Fermeté',
      titleAr: 'مكافحة الشيخوخة وشد البشرة',
      subtitleFr: 'Rétinol, Peptides',
      subtitleAr: 'ريتينول، ببتيدات',
      image: '/images/concern_wrinkles.png',
      gridClass: 'md:col-span-1',
      bgGradient: 'from-rose-500/10 to-pink-500/10 dark:from-rose-950/20 dark:to-pink-950/20',
      activeBorder: 'border-rose-500'
    },
    {
      key: 'dryness',
      titleFr: 'Hydratation & Barrière',
      titleAr: 'ترطيب وحماية حاجز البشرة',
      subtitleFr: 'Acide Hyaluronique, Céramides',
      subtitleAr: 'حمض الهيالورونيك، سيراميد',
      image: '/images/concern_dryness.png',
      gridClass: 'md:col-span-2',
      bgGradient: 'from-blue-500/10 to-sky-500/10 dark:from-blue-950/20 dark:to-sky-950/20',
      activeBorder: 'border-blue-500'
    }
  ];

  const handleSelectConcern = (concernKey: string) => {
    setActiveConcern(concernKey);
    setActiveCategory('all');
    setActiveIngredient('all');
    
    // Smooth scroll down to boutique grid
    const el = document.getElementById('boutique-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isRtl = language === 'AR';

  return (
    <section className="relative py-16 md:py-24 bg-white dark:bg-slate-950 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
      
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          {/* Eyebrow tag */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/15">
            <Sparkles className="w-3 h-3" /> Curation Clinique
          </span>
          
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
            {isRtl ? 'تسوق حسب احتياج بشرتك' : 'Acheter par Préoccupation de Peau'}
          </h2>
          
          <p className="max-w-md text-xs md:text-sm text-slate-400 leading-relaxed font-medium">
            {isRtl 
              ? 'صممنا لك مجموعات تجميلية كورية مخصصة تستهدف وتصلح مشاكل البشرة مباشرة وبأمان.'
              : 'Trouvez les solutions ciblées à vos problématiques de peau à travers des formulations K-Beauty éprouvées.'
            }
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {CONCERNS.map((c) => {
            const isSelected = activeConcern === c.key;
            return (
              <div
                key={c.key}
                onClick={() => handleSelectConcern(c.key)}
                className={`group cursor-pointer rounded-[24px] overflow-hidden border p-1.5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] ${c.gridClass} ${
                  isSelected 
                    ? `border-indigo-500 shadow-md` 
                    : 'border-slate-200/50 dark:border-white/5 hover:border-slate-350 dark:hover:border-white/10'
                }`}
              >
                {/* Double-Bezel Inner Core */}
                <div className="relative w-full h-[200px] md:h-[220px] rounded-[calc(24px-6px)] overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-end p-6 group">
                  
                  {/* Background Macro Texture Image */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={c.image}
                      alt={c.titleFr}
                      fill
                      className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 group-hover:rotate-1 opacity-90 dark:opacity-80"
                      sizes="(max-w-768px) 100vw, 33vw"
                    />
                    {/* Shadow overlay gradient for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent z-10" />
                  </div>

                  {/* Text Contents */}
                  <div className="relative z-20 space-y-1.5 text-left">
                    {/* Active Indicator Badge */}
                    {isSelected && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-indigo-500 text-white mb-1 shadow-sm">
                        Sélectionné
                      </span>
                    )}

                    <h3 className="text-base font-extrabold text-white leading-tight">
                      {isRtl ? c.titleAr : c.titleFr}
                    </h3>
                    
                    <div className="flex justify-between items-center gap-4">
                      <p className="text-[10px] text-slate-300 font-bold tracking-wide">
                        {isRtl ? c.subtitleAr : c.subtitleFr}
                      </p>
                      
                      {/* Interactive indicator circle */}
                      <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-white text-white group-hover:text-slate-950 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shrink-0 group-hover:translate-x-0.5">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
