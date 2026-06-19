'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { Sparkles, Activity, ShieldCheck } from 'lucide-react';

type SkinConcern = 'spots' | 'acne' | 'dryness';

export const BeforeAfterSlider: React.FC = () => {
  const { language } = useTranslation();
  const [activeConcern, setActiveConcern] = useState<SkinConcern>('spots');
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Tab selectors details
  const CONCERNS_TABS = [
    { key: 'spots', fr: 'Taches Brunes', ar: 'البقع الداكنة' },
    { key: 'acne', fr: 'Acné & Imperfections', ar: 'حب الشباب والشوائب' },
    { key: 'dryness', fr: 'Hydratation & Ridules', ar: 'الترطيب والخطوط' },
  ];

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    const x = clientX - left;
    const percentage = Math.max(0, Math.min(100, (x / width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.current) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const isRTL = language === 'AR';

  return (
    <section 
      className="py-24 relative overflow-hidden bg-gradient-to-b from-white via-background to-white border-t border-border/30"
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {/* Visual background atmospheric elements */}
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-accent/4 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FEF2F8] border border-[#FCE7F3] rounded-full text-[9px] font-black text-primary uppercase tracking-widest shadow-sm">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span>{language === 'FR' ? 'Efficacité Clinique Prouvée' : 'فعالية سريرية مثبتة'}</span>
          </div>
          <h2 className="text-3xl md:text-4.5xl font-black font-heading text-primary-dark tracking-tight leading-tight">
            {language === 'FR' ? 'Visualisez votre Transformation' : 'شاهدي نتيجة روتينكِ العلاجي'}
          </h2>
          <p className="text-xs md:text-sm text-foreground/70 max-w-xl font-medium leading-relaxed">
            {language === 'FR'
              ? 'Faites glisser le curseur pour comparer les résultats réels de nos actifs dermatologiques K-Beauty sur les préoccupations majeures.'
              : 'اسحبي المؤشر لمقارنة النتائج الحقيقية لمكوناتنا الجلدية الكورية النشطة على مشاكل البشرة الرئيسية.'}
          </p>
        </div>

        {/* Dynamic Concern Selector Tabs */}
        <div className="flex justify-center flex-wrap gap-2.5 mb-12">
          {CONCERNS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveConcern(tab.key as SkinConcern);
                setSliderPosition(50); // Reset position for fresh visual check
              }}
              className={`px-5 py-2.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-sm active:scale-95 border ${
                activeConcern === tab.key
                  ? 'bg-primary border-primary text-white shadow-primary/10'
                  : 'bg-white border-border/40 text-foreground/75 hover:bg-slate-50 hover:text-primary-dark'
              }`}
            >
              {language === 'FR' ? tab.fr : tab.ar}
            </button>
          ))}
        </div>

        {/* Master Before/After Slider Core */}
        <div 
          className="max-w-[800px] mx-auto bg-white/70 backdrop-blur-md border border-border/20 rounded-2xl p-6 shadow-md relative"
          style={{ transformStyle: 'preserve-3d' }}
        >
          
          <div 
            ref={containerRef}
            className="relative aspect-[16/9] w-full rounded-xl overflow-hidden select-none cursor-ew-resize border border-slate-100/60 shadow-inner bg-slate-50"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* ── BEFORE (AVANT) STATE CONTAINER ── */}
            <div className="absolute inset-0 w-full h-full select-none pointer-events-none bg-[#FDF4F5]">
              {/* SVG texture overlay for raw skin concern */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Skin base color gradient */}
                <defs>
                  <radialGradient id="skin-before-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFF2F2" />
                    <stop offset="100%" stopColor="#FBEAEB" />
                  </radialGradient>
                  
                  {/* Pattern representing dry skin texture */}
                  <pattern id="dry-crack-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 0,0 L 24,0 L 12,24 Z" fill="none" stroke="#E2CFCF" strokeWidth="0.75" />
                    <path d="M 12,0 L 0,24" fill="none" stroke="#E2CFCF" strokeWidth="0.75" />
                  </pattern>
                </defs>
                
                {/* Background color */}
                <rect width="100%" height="100%" fill="url(#skin-before-glow)" />

                {/* 1. ACNE CONCERN */}
                {activeConcern === 'acne' && (
                  <g className="opacity-80">
                    {/* Render inflamed red spots and pores */}
                    <circle cx="15%" cy="30%" r="9" fill="#E11D48" opacity="0.45" filter="blur(6px)" />
                    <circle cx="15%" cy="30%" r="3.5" fill="#FDA4AF" />

                    <circle cx="35%" cy="20%" r="14" fill="#E11D48" opacity="0.4" filter="blur(8px)" />
                    <circle cx="35%" cy="20%" r="4.5" fill="#F43F5E" />

                    <circle cx="25%" cy="65%" r="12" fill="#E11D48" opacity="0.4" filter="blur(7px)" />
                    <circle cx="25%" cy="65%" r="4" fill="#F43F5E" />

                    <circle cx="50%" cy="40%" r="10" fill="#E11D48" opacity="0.45" filter="blur(6px)" />
                    <circle cx="50%" cy="40%" r="3" fill="#FDA4AF" />

                    <circle cx="68%" cy="75%" r="16" fill="#E11D48" opacity="0.4" filter="blur(8px)" />
                    <circle cx="68%" cy="75%" r="5.5" fill="#F43F5E" />

                    <circle cx="75%" cy="25%" r="11" fill="#E11D48" opacity="0.45" filter="blur(6px)" />
                    <circle cx="75%" cy="25%" r="3.5" fill="#FDA4AF" />

                    <circle cx="85%" cy="50%" r="13" fill="#E11D48" opacity="0.4" filter="blur(7px)" />
                    <circle cx="85%" cy="50%" r="4" fill="#F43F5E" />
                  </g>
                )}

                {/* 2. HYPERPIGMENTATION SPOTS CONCERN */}
                {activeConcern === 'spots' && (
                  <g className="opacity-85">
                    {/* Render brownish spots */}
                    <ellipse cx="20%" cy="25%" rx="18" ry="12" fill="#854D0E" opacity="0.3" filter="blur(6px)" />
                    <ellipse cx="22%" cy="24%" rx="8" ry="5" fill="#713F12" opacity="0.4" />

                    <ellipse cx="40%" cy="70%" rx="14" ry="14" fill="#854D0E" opacity="0.25" filter="blur(8px)" />
                    <ellipse cx="38%" cy="69%" rx="6" ry="6" fill="#713F12" opacity="0.35" />

                    <ellipse cx="65%" cy="30%" rx="24" ry="16" fill="#854D0E" opacity="0.28" filter="blur(7px)" />
                    <ellipse cx="67%" cy="28%" rx="10" ry="7" fill="#713F12" opacity="0.45" />

                    <ellipse cx="78%" cy="60%" rx="16" ry="12" fill="#854D0E" opacity="0.3" filter="blur(6px)" />
                    <ellipse cx="77%" cy="61%" rx="8" ry="6" fill="#713F12" opacity="0.4" />
                  </g>
                )}

                {/* 3. DEHYDRATION / texture cracks */}
                {activeConcern === 'dryness' && (
                  <g>
                    {/* Grid texture for dryness cracks */}
                    <rect width="100%" height="100%" fill="url(#dry-crack-pattern)" opacity="0.65" />
                    
                    {/* Darker dry spots */}
                    <path d="M 10,20 Q 30,15 50,20 Q 70,25 90,20" fill="none" stroke="#E2CFCF" strokeWidth="1" opacity="0.5" />
                    <path d="M 40,80 Q 60,75 80,80" fill="none" stroke="#E2CFCF" strokeWidth="1" opacity="0.4" />
                  </g>
                )}
              </svg>
              
              {/* Dynamic Overlay "Avant" label text */}
              <span className="absolute bottom-4 left-4 bg-slate-900/75 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest py-1 px-3 rounded-md border border-white/10 shadow-sm z-20">
                {language === 'FR' ? 'Avant : Cliniquement altérée' : 'قبل العلاج'}
              </span>
            </div>

            {/* ── AFTER (APRÈS) STATE CONTAINER ── */}
            <div 
              className="absolute inset-0 w-full h-full select-none pointer-events-none bg-[#FFF8FA] transition-all duration-75"
              style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
            >
              {/* SVG for flawless glowing smooth skin */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="skin-after-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFDFC" />
                    <stop offset="60%" stopColor="#FFF2F5" />
                    <stop offset="100%" stopColor="#FFE4EC" />
                  </radialGradient>
                  {/* Soft lights */}
                  <linearGradient id="glass-beam" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                    <stop offset="40%" stopColor="#FFF0F5" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#F9A8D4" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#skin-after-glow)" />
                {/* Glowing light rays */}
                <ellipse cx="30%" cy="30%" rx="300" ry="80" fill="url(#glass-beam)" transform="rotate(-15 300 300)" />
                <ellipse cx="70%" cy="60%" rx="200" ry="60" fill="url(#glass-beam)" transform="rotate(-10 500 500)" opacity="0.6" />
              </svg>
              
              {/* Dynamic Overlay "Après" label text */}
              <span className="absolute bottom-4 right-4 bg-emerald-600/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest py-1 px-3 rounded-md border border-emerald-400/20 shadow-sm z-20">
                {language === 'FR' ? 'Après : 100% Glass Skin ✨' : 'بعد العلاج ✨'}
              </span>
            </div>

            {/* ── DRAG HANDLE BAR ── */}
            <div 
              className="absolute top-0 bottom-0 w-[2px] bg-white cursor-ew-resize z-30 transition-all duration-75 flex items-center justify-center"
              style={{ left: `${sliderPosition}%` }}
            >
              {/* Clinical Slider circular trigger handle button */}
              <div className="w-8 h-8 rounded-full bg-white border border-border-light shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center justify-center active:scale-90 transition-transform shrink-0 relative">
                {/* Left/Right arrow icons inside handle */}
                <div className="flex gap-0.5 text-primary text-[8px] font-black">
                  <span>◀</span>
                  <span>▶</span>
                </div>
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full animate-ping bg-primary/10 border border-primary/20 scale-125 -z-10 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Under-slider benefit statement micro-banner */}
          <div className="flex items-center gap-3 bg-muted/40 border border-solid border-slate-100/50 rounded-xl p-4.5 mt-6">
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200/65 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-[11px] leading-relaxed">
              <span className="font-extrabold text-primary-dark block uppercase tracking-wider">
                {activeConcern === 'acne' 
                  ? (language === 'FR' ? 'Analyse Acné : -84% d\'inflammation en 14 jours' : 'تحليل حب الشباب: -84٪ التهابات خلال 14 يوماً')
                  : activeConcern === 'spots'
                    ? (language === 'FR' ? 'Analyse Hyperpigmentation : Éclat unifié à 96% en 3 semaines' : 'تحليل التصبغات: نضارة وتوحيد اللون بنسبة 96٪ خلال 3 أسابيع')
                    : (language === 'FR' ? 'Analyse Texture : Barrière cutanée hydratée à +140%' : 'تحليل التجاعيد والترطيب: حاجز بشرة مرطب بنسبة +140٪')
                }
              </span>
              <p className="text-foreground/70 font-medium">
                {language === 'FR'
                  ? 'Tests dermatologiques certifiés et validés par des pharmaciens cosmétiques.'
                  : 'اختبارات جلدية معتمدة ومؤكدة من صيادلة التجميل.'}
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
