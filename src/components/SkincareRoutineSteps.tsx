'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Product } from '@/lib/data';
import { useProducts } from '@/context/ProductsContext';
import { Check, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useUi } from '@/context/UiContext';
import { Magnetic } from './Magnetic';
import { RoutineDiagnosticIntro } from './RoutineDiagnosticIntro';

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getProductBadge = (id: number, lang: string): string => {
  const badges: Record<number, { fr: string, ar: string }> = {
    15: { fr: "Étape 1: Huile Purifiante", ar: "الخطوة 1: زيت مطهر" },
    22: { fr: "Étape 1: Mousse Active", ar: "الخطوة 1: رغوة منظفة" },
    14: { fr: "Étape 2: Sérum Anti-Taches", ar: "الخطوة 2: سيروم للبقع" },
    7: { fr: "Étape 2: Lotion Hydratante", ar: "الخطوة 2: لوشن مرطب" },
    3: { fr: "Étape 2: Éclat Vitamine C", ar: "الخطوة 2: سيروم فيتامين C" },
    13: { fr: "Étape 3: Écran Riz + Probiotiques", ar: "الخطوة 3: واقي بالأرز" },
    17: { fr: "Étape 3: Sérum Solaire Fluide", ar: "الخطوة 3: سيروم واقي" },
    1: { fr: "Étape 3: Gel Solaire Frais", ar: "الخطوة 3: جل واقي شمس" }
  };
  return lang === 'FR' ? (badges[id]?.fr || "Soin ciblé") : (badges[id]?.ar || "عناية مخصصة");
};

interface SkincareRoutineStepsProps {
  onOpenQuickView?: (product: Product) => void;
  onOpenBundleDrawer?: () => void;
}

export const SkincareRoutineSteps: React.FC<SkincareRoutineStepsProps> = ({ onOpenQuickView, onOpenBundleDrawer }) => {
  const { language } = useTranslation();
  const { products } = useProducts();
  const { diagnostic, setDiagnostic, setDiagnosticOpen, setSelectedProduct } = useUi();
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  
  const isTestCompleted = diagnostic !== null;
  const [activeStep, setActiveStep] = useState<number>(-1);

  useEffect(() => {
    // Only reset to intro when the diagnostic is cleared (e.g. user resets)
    if (!isTestCompleted && activeStep !== -1) {
      setActiveStep(-1);
    }
    // Do NOT auto-advance to step 0 — the user should stay on the intro state
    // after finishing the test, and click a step tab to explore results.
  }, [isTestCompleted, activeStep]);

  const triggerOpenBundleDrawer = () => {
    if (onOpenBundleDrawer) {
      onOpenBundleDrawer();
    } else {
      setDiagnosticOpen(true);
    }
  };

  const triggerOpenQuickView = (product: Product) => {
    if (onOpenQuickView) {
      onOpenQuickView(product);
    } else {
      setSelectedProduct(product);
    }
  };

  const STEPS_DATA = [
    {
      title_fr: "Nettoyage Double",
      title_ar: "تنظيف مزدوج",
      navLabelFr: "Nettoyer",
      navLabelAr: "تنظيف",
      shortDescFr: "Purifiez votre peau en profondeur sans altérer sa barrière protectrice.",
      shortDescAr: "تنظيف عميق لبشرتكِ دون التأثير على حاجزها الطبيعي.",
      icon: "🧼",
      productIds: [15, 22],
      benefits: [
        "Élimine l'excès de sébum et le maquillage",
        "Aide à désincruster les pores et à réduire les impuretés",
        "Prévient l'apparition de comédons"
      ]
    },
    {
      title_fr: "Traitement Actif",
      title_ar: "ترطيب ومعالجة",
      navLabelFr: "Traiter",
      navLabelAr: "معالجة",
      shortDescFr: "Ciblez précisément vos imperfections, taches et ridules avec nos actifs concentrés.",
      shortDescAr: "استهدفي الشوائب والبقع والخطوط الدقيقة بدقة عالية.",
      icon: "🧪",
      productIds: [14, 7, 3],
      benefits: [
        "Hydrate intensément les couches épidermiques",
        "Estompe les taches d'hyperpigmentation",
        "Lisse visiblement le grain de peau"
      ]
    },
    {
      title_fr: "Protection solaire",
      title_ar: "حماية شمسية",
      navLabelFr: "Protéger",
      navLabelAr: "حماية",
      shortDescFr: "Défendez votre capital jeunesse contre les UVA/UVB avec un fini invisible.",
      shortDescAr: "احمي بشرتكِ من الشيخوخة المبكرة والأشعة فوق البنفسجية.",
      icon: "☀️",
      productIds: [13, 17, 1],
      benefits: [
        "Bloque efficacement les rayons UVA/UVB",
        "Fini transparent sans aucun film blanc",
        "Prévient le photovieillissement prématuré"
      ]
    },
  ];

  const activeStepInfo = activeStep >= 0 ? STEPS_DATA[activeStep] : STEPS_DATA[0];
  const stepProducts = activeStep >= 0 ? products.filter(p => activeStepInfo.productIds.includes(p.id)) : [];

  const isRTL = language === 'AR';

  return (
    <section id="skincare-routine-wizard" className="py-12 relative overflow-hidden bg-[#fffdfc] text-slate-800">
      {/* Soft Ambient Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl pointer-events-none opacity-60" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#EC4899]/5 to-transparent blur-3xl pointer-events-none opacity-60" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        


        {/* Stepper Navigation */}
        {isTestCompleted && (
          <div 
            className="relative w-full px-4"
            style={{ maxWidth: '448px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '56px' }}
          >
            {/* Connector Line - Starts and ends exactly at the mathematical center of columns 1 and 3 */}
            <div className={`absolute left-[16.66%] right-[16.66%] h-[2px] z-0 top-[22px] -translate-y-1/2 transition-all duration-300 ${isTestCompleted ? 'bg-slate-200' : 'bg-slate-100 opacity-40'}`} />
            
            <div className="relative z-10 grid grid-cols-3 w-full justify-items-center">
              {STEPS_DATA.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={idx}
                    disabled={!isTestCompleted}
                    onClick={() => isTestCompleted && setActiveStep(idx)}
                    className={`flex flex-col items-center gap-3 group focus:outline-none transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] relative ${
                      !isTestCompleted ? 'cursor-not-allowed opacity-40' : 'active:scale-95 cursor-pointer'
                    }`}
                  >
                    {/* Step Circle */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-black tracking-wider transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border ${
                      isActive
                        ? 'bg-primary border-primary text-white scale-110 shadow-[0_4px_15px_rgba(37,115,163,0.2)]'
                        : !isTestCompleted
                        ? 'bg-slate-100 border-slate-200 text-slate-400'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary hover:bg-slate-50'
                    }`}>
                      0{idx + 1}
                    </div>
                    {/* Step Label */}
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                      isActive
                        ? 'text-primary'
                        : !isTestCompleted
                        ? 'text-slate-400'
                        : 'text-slate-500 group-hover:text-primary'
                    }`}>
                      {language === 'FR' ? step.navLabelFr : step.navLabelAr}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Unified Luxury Container Module */}
        {activeStep === -1 ? (
          <RoutineDiagnosticIntro
            isRTL={isRTL}
            completed={isTestCompleted}
            onStart={triggerOpenBundleDrawer}
            onView={() => setActiveStep(0)}
            onRestart={() => { setDiagnostic(null); triggerOpenBundleDrawer(); }}
          />
        ) : (
          <div className="w-full bg-white border border-slate-200/60 rounded-[24px] p-8 md:p-12 shadow-[0_15px_40px_rgba(26,37,93,0.04)] grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-12 items-stretch transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
            
            {/* Left Side: Advisory Panel with Skincare Atmosphere */}
            <div 
              className="col-span-1 relative bg-slate-50/80 border border-slate-200/50 rounded-2xl pb-8 shadow-sm overflow-hidden flex flex-col justify-between h-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
              style={{ paddingTop: '38px', paddingLeft: '32px', paddingRight: '32px' }}
            >
              {/* Ambient Skincare Glow Radials inside left card */}
              <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-primary/4 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-[#EC4899]/3 blur-2xl pointer-events-none" />

              <div className={`relative z-10 ${isRTL ? 'text-right' : ''}`}>
                <span 
                  className="text-[9px] font-black uppercase tracking-[0.25em] text-primary block"
                  style={{ marginBottom: '14px' }}
                >
                  {language === 'FR' ? `ÉTAPE 0${activeStep + 1}` : `الخطوة 0${activeStep + 1}`}
                </span>
                
                {/* STEP TITLE: medium-sized, refined, softer weight, secondary emphasis */}
                <h3 
                  className="text-xl md:text-2xl font-black font-heading text-slate-800 leading-snug tracking-tight"
                  style={{ marginTop: '14px', marginBottom: '16px' }}
                >
                  {language === 'FR' ? activeStepInfo.title_fr : activeStepInfo.title_ar}
                </h3>
                
                {/* Exactly 1 short sentence only */}
                <p 
                  className="text-xs md:text-[13px] leading-relaxed text-slate-500 font-medium pt-1 border-b border-slate-200/50"
                  style={{ marginTop: '16px', marginBottom: '24px', paddingBottom: '16px' }}
                >
                  {language === 'FR' ? activeStepInfo.shortDescFr : activeStepInfo.shortDescAr}
                </p>

                {/* Exactly 3 clean benefit bullets */}
                <div style={{ marginTop: '24px' }}>
                  {activeStepInfo.benefits.map((benefit, bIdx) => (
                    <div 
                      key={bIdx} 
                      className={`flex items-start gap-3 text-[11px] text-slate-600 font-medium leading-relaxed ${isRTL ? 'flex-row-reverse' : ''}`}
                      style={{ marginBottom: bIdx < activeStepInfo.benefits.length - 1 ? '18px' : '0px' }}
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 shadow-sm border border-primary/20">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
                {/* Subtle Clinical Badge Stamp - Flowing naturally and horizontally centered */}
                <div className="relative z-10 flex justify-center w-full" style={{ marginTop: '28px' }}>
                  <div 
                    className="inline-flex items-center gap-1.5 bg-white border border-slate-200/60 rounded-lg text-[9px] font-black text-primary uppercase tracking-wider shadow-sm px-4 py-2"
                  >
                    <Sparkles className="w-3 h-3 fill-primary text-primary" />
                    <span>{language === 'FR' ? 'Recommandation Dermo-Lab' : 'توصية ديرمو لاب'}</span>
                  </div>
                </div>

                {/* Recommencer le test button inside left panel */}
                <div className="relative z-10 flex justify-center w-full" style={{ marginTop: '16px' }}>
                  <button 
                    onClick={() => {
                      setDiagnostic(null);
                      setActiveStep(-1);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-wider shadow-sm px-4 py-2 border border-slate-200/60 transition-all duration-300 active:scale-95 cursor-pointer w-full"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-400" />
                    <span>{language === 'FR' ? 'Recommencer le test' : 'إعادة إجراء الاختبار'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side: Perfectly Aligned Compact Product Grid */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch min-w-0">
              {stepProducts.map(product => {
                const customBadge = getProductBadge(product.id, language);

                return (
                  <div key={product.id} className="min-w-0 flex flex-col h-full">
                    <ProductCard
                      product={product}
                      onOpenQuickView={triggerOpenQuickView}
                      customBadge={customBadge}
                    />
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* Immersive CTA to open Custom Bundle Builder */}
        {activeStep >= 0 && (
          <div className="mt-20 mb-6 flex justify-center w-full relative z-10">
            <Magnetic>
              <button
                onClick={triggerOpenBundleDrawer}
                onMouseEnter={() => setIsBtnHovered(true)}
                onMouseLeave={() => setIsBtnHovered(false)}
                className="group relative inline-flex items-center gap-3 px-10 py-4.5 text-white text-xs md:text-sm font-black uppercase tracking-widest rounded-[11px] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-lg hover:shadow-primary/20"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  transition: 'all 0.3s ease'
                }}
              >
                <Sparkles className="w-4.5 h-4.5 fill-white text-white animate-pulse" />
                <span>{language === 'FR' ? 'Découvrir nos routines' : 'اكتشفي روتينات العناية'}</span>
              </button>
            </Magnetic>
          </div>
        )}

      </div>
    </section>
  );
};
