'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Product } from '@/lib/data';
import { useProducts } from '@/context/ProductsContext';
import { Check, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useUi } from '@/context/UiContext';
import { Magnetic } from './Magnetic';

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
  const [isIntroBtnHovered, setIsIntroBtnHovered] = useState(false);
  
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
    <section id="skincare-routine-wizard" className="py-24 relative overflow-hidden bg-[#FAFAFA] border-b border-slate-200/40 text-slate-800 reveal-on-scroll">
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
          <div className="w-full bg-white border border-slate-200/60 rounded-[24px] p-8 md:p-12 shadow-[0_15px_40px_rgba(26,37,93,0.04)] grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] min-h-[480px]">
            
            {/* Left Column: Premium Intro */}
            <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className={`inline-flex items-center gap-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm px-3.5 py-1.5 ${
                isTestCompleted
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700'
                  : 'bg-[#EC4899]/10 border border-[#EC4899]/15 text-[#EC4899]'
              }`}>
                <Sparkles className={`w-3.5 h-3.5 animate-pulse ${isTestCompleted ? 'fill-emerald-600 text-emerald-600' : 'fill-[#EC4899] text-[#EC4899]'}`} />
                <span>{isTestCompleted
                  ? (language === 'FR' ? 'Routine Personnalisée Prête ✓' : 'روتينكِ المخصص جاهز ✓')
                  : (language === 'FR' ? 'Diagnostic IA Disponible' : 'متاح تشخيص الذكاء الاصطناعي')
                }</span>
              </div>
              
              <h3 className="text-2xl md:text-3.5xl font-black font-heading text-slate-800 leading-tight tracking-tight">
                {language === 'FR' 
                  ? 'Découvrez votre routine idéale en 3 étapes'
                  : 'اكتشفي روتينكِ المثالي في 3 خطوات'}
              </h3>
              
              <p className="text-xs md:text-[13px] text-slate-500 leading-relaxed font-medium">
                {language === 'FR'
                  ? 'Notre outil prend en compte votre type de peau, vos besoins et votre exposition au soleil pour vous proposer une routine personnalisée.'
                  : 'تأخذ أداتنا بعين الاعتبار نوع بشرتكِ واحتياجاتها وتعرّضكِ للشمس لاقتراح روتين عناية مخصص.'}
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { 
                    fr: "Questions simples sur votre peau",
                    ar: "أسئلة بسيطة عن بشرتكِ"
                  },
                  { 
                    fr: "Routine personnalisée selon vos réponses",
                    ar: "روتين مخصص حسب إجاباتكِ"
                  },
                  { 
                    fr: "Produits proposés selon vos besoins",
                    ar: "منتجات مقترحة حسب احتياجاتكِ"
                  }
                ].map((bullet, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 text-[11.5px] font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sm border border-primary/25">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-slate-600">{language === 'FR' ? bullet.fr : bullet.ar}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                {isTestCompleted ? (
                  <>
                    {/* Primary: View routine */}
                    <button
                      onClick={() => setActiveStep(0)}
                      className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-md hover:shadow-emerald-600/20"
                      style={{ backgroundColor: '#059669', color: '#ffffff' }}
                    >
                      <span>{language === 'FR' ? 'Voir ma routine →' : 'عرض روتيني ←'}</span>
                    </button>
                    {/* Secondary: Retake */}
                    <button
                      onClick={() => { setDiagnostic(null); triggerOpenBundleDrawer(); }}
                      className="inline-flex items-center gap-2 px-5 py-3.5 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 hover:border-primary/30 hover:text-primary bg-white transition-all duration-200 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{language === 'FR' ? 'Refaire le diagnostic' : 'إعادة التشخيص'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={triggerOpenBundleDrawer}
                    onMouseEnter={() => setIsIntroBtnHovered(true)}
                    onMouseLeave={() => setIsIntroBtnHovered(false)}
                    className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-md hover:shadow-primary/20 animate-fade-in animate-pulse"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <span>{language === 'FR' ? "Lancer le Diagnostic de Routine 🔬" : 'بدء تشخيص الروتين 🔬'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Interactive Dermo-IA Diagnostic Console */}
            <div 
              onClick={triggerOpenBundleDrawer}
              className="col-span-1 relative flex flex-col items-center justify-center w-full h-full min-h-[360px] bg-slate-50 border border-slate-200/40 rounded-[24px] p-6 overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(37,115,163,0.08)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group cursor-pointer"
            >
              {/* Luxury ambient light leak behind console */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 via-transparent to-[#EC4899]/5 rounded-full blur-3xl opacity-70 group-hover:scale-115 transition-transform duration-700 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#38BDF8]/5 via-transparent to-[#10B981]/5 rounded-full blur-3xl opacity-70 group-hover:scale-115 transition-transform duration-700 pointer-events-none" />
              
              {/* Scan target grid lines */}
              <div className="absolute inset-0 bg-[#FAFAFA] opacity-[0.02] border border-slate-200/30" />
              
              {/* Glassmorphic console body */}
              <div className="relative flex flex-col items-center gap-6 z-10 w-full">
                
                <div className="relative flex h-52 w-48 flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_18px_44px_rgba(15,39,71,0.1)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-sky-200 group-hover:shadow-[0_24px_56px_rgba(15,39,71,0.14)]">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-sky-500 to-blue-600" />
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-sky-100 bg-sky-50 text-sky-700">
                    <Sparkles className="h-9 w-9" aria-hidden="true" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-800">Dermo IA</p>
                    <p className="text-[10px] font-semibold leading-relaxed text-slate-500">
                      {language === 'FR' ? 'Questionnaire personnalisé' : 'استبيان مخصص'}
                    </p>
                  </div>
                </div>

                {/* Status and Action text logs */}
                <div className="space-y-2 w-full text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 shadow-sm rounded-full">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-700">
                      {language === 'FR' ? "Lancer le Diagnostic IA" : "بدء تشخيص الذكاء الاصطناعي"}
                    </span>
                  </div>
                  
                  <p className="text-[11px] font-medium text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                    {language === 'FR' 
                      ? "Répondez à quelques questions pour recevoir une routine fondée sur les informations produit disponibles."
                      : "أجيبي عن بعض الأسئلة للحصول على روتين مبني على معلومات المنتجات المتاحة."}
                  </p>
                </div>

              </div>
            </div>

          </div>
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
                className="group relative inline-flex items-center gap-3 px-10 py-4.5 text-white text-xs md:text-sm font-black uppercase tracking-widest rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-lg hover:shadow-primary/20"
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
