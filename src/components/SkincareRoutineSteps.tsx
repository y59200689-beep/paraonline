'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Product } from '@/lib/data';
import { useProducts } from '@/context/ProductsContext';
import { Check, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useUi } from '@/context/UiContext';
import { Magnetic } from './Magnetic';

const placeholderSvg = "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='100%' height='100%'><rect width='100%' height='100%' fill='#f1f5f9'/><path d='M150 100a40 40 0 1 0 40 40 40 40 0 0 0-40-40zm0 60a20 20 0 1 1 20-20 20 20 0 0 1-20 20z' fill='#94a3b8'/><path d='M180 180h-60a10 10 0 0 0-10 10v10h80v-10a10 10 0 0 0-10-10z' fill='#94a3b8'/><text x='150' y='230' font-family='sans-serif' font-size='12' font-weight='bold' fill='#64748b' text-anchor='middle'>Image Indisponible</text></svg>");

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
  return lang === 'FR' ? (badges[id]?.fr || "Soin Clinique") : (badges[id]?.ar || "عناية سريرية");
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
    if (isTestCompleted && activeStep === -1) {
      setActiveStep(0);
    } else if (!isTestCompleted && activeStep !== -1) {
      setActiveStep(-1);
    }
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
        "Désincruste les pores en profondeur à 100%",
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
      title_fr: "Protection Clinique",
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

      <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 relative z-10">
        
        {/* Section Header */}
        <div 
          className="flex flex-col items-center text-center space-y-4 w-full"
          style={{ maxWidth: '768px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '56px', marginTop: '24px' }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-primary/15 rounded-[5px] text-[9px] font-black text-primary uppercase tracking-[0.2em] shadow-sm">
            <Sparkles className="w-3 h-3 fill-primary stroke-none" />
            <span>{language === 'FR' ? 'Rituel Clinique Haute Performance' : 'طقوس عيادية عالية الأداء'}</span>
          </div>
          <h2 
            className="text-3.5xl md:text-[36px] font-black font-heading text-slate-800 leading-tight tracking-tight text-center w-full"
            style={{ marginBottom: '12px' }}
          >
            {language === 'FR' ? 'Votre Routine "Glass Skin" en 3 Étapes' : 'روتينكِ للبشرة الزجاجية في 3 خطوات'}
          </h2>
          <p className="text-xs md:text-[13px] text-slate-500 leading-relaxed font-medium text-center w-full">
            {language === 'FR'
              ? 'Trois gestes fondamentaux recommandés par nos pharmaciens pour purifier, traiter et protéger votre visage au quotidien.'
              : 'ثلاث خطوات أساسية يوصي بها صيادلتنا لتطهير ومعالجة وحماية بشرتكِ يومياً.'}
          </p>
        </div>

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
              <div className="inline-flex items-center gap-1.5 bg-[#EC4899]/10 border border-[#EC4899]/15 rounded-lg text-[9px] font-black text-[#EC4899] uppercase tracking-wider shadow-sm px-3.5 py-1.5">
                <Sparkles className="w-3.5 h-3.5 fill-[#EC4899] text-[#EC4899] animate-pulse" />
                <span>{language === 'FR' ? 'Diagnostic IA Disponible' : 'متاح تشخيص الذكاء الاصطناعي'}</span>
              </div>
              
              <h3 className="text-2xl md:text-3.5xl font-black font-heading text-slate-800 leading-tight tracking-tight">
                {language === 'FR' 
                  ? 'Découvrez votre routine idéale en 3 étapes'
                  : 'اكتشفي روتينكِ المثالي في 3 خطوات'}
              </h3>
              
              <p className="text-xs md:text-[13px] text-slate-500 leading-relaxed font-medium">
                {language === 'FR'
                  ? 'Notre algorithme dermo-clinique croise votre type de peau, vos préoccupations majeures et votre niveau d\'exposition environnementale pour concevoir un rituel de soin ultra-personnalisé, validé par nos pharmaciens.'
                  : 'يقوم خوارزميتنا الجلدية السريرية بدمج نوع بشرتكِ، ومشاكلها المحددة، وتعرضها البيئي لتصميم روتين عناية شخصي للغاية معتمد من قبل صيادلتنا.'}
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { 
                    fr: "Analyse spectrale IA instantanée par caméra", 
                    ar: "تحليل طيفي فوري بالذكاء الاصطناعي عبر الكاميرا" 
                  },
                  { 
                    fr: "Ordonnance clinique sur-mesure validée par nos pharmaciens", 
                    ar: "وصفة علاجية مخصصة معتمدة من صيادلتنا" 
                  },
                  { 
                    fr: "15% de réduction immédiate + Cadeau offert sur votre pack", 
                    ar: "خصم فوري 15% + هدية مجانية على مجموعتكِ المخصصة" 
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

              <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center">
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
                
                {/* Scientific Screen Console */}
                <div className="relative w-48 h-60 rounded-2xl bg-gradient-to-b from-[#080d19] via-[#0f172a] to-[#080d19] border border-slate-800 group-hover:border-[#38BDF8]/50 flex flex-col justify-between items-center p-3 overflow-hidden shadow-[0_20px_50px_rgba(8,13,25,0.7),0_0_30px_rgba(56,189,248,0.05)] group-hover:shadow-[0_20px_50px_rgba(8,13,25,0.8),0_0_40px_rgba(56,189,248,0.15)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] select-none">
                  
                  {/* Grid overlay */}
                  <div 
                    className="absolute inset-0 opacity-[0.08] pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(rgba(56, 189, 248, 0.8) 1.2px, transparent 1.2px)',
                      backgroundSize: '10px 10px'
                    }}
                  />

                  {/* Laser Sweeper Bar */}
                  <div className="absolute left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent shadow-[0_0_20px_#38BDF8] animate-scan z-20" />
                  
                  {/* Console Header Status */}
                  <div className="w-full flex items-center justify-between z-10 px-1 pt-0.5">
                    <div className="flex items-center gap-1">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                      </span>
                      <span className="text-[7.5px] font-black uppercase text-[#10B981] tracking-wider leading-none">SYS: ONLINE</span>
                    </div>
                    <span className="text-[7.5px] font-mono text-[#38BDF8]/60 tracking-wider">FPS 60 // AI.v4</span>
                  </div>

                  {/* Center HUD Vector System */}
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    
                    {/* Rotating Biometric Outer Ring */}
                    <svg viewBox="0 0 100 100" className="absolute w-full h-full text-[#38BDF8]/10 animate-spin-slow pointer-events-none">
                      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1" strokeDasharray="6 8" fill="none" />
                      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" fill="none" />
                    </svg>

                    {/* Rotating Counter-Ring (Green) */}
                    <svg viewBox="0 0 100 100" className="absolute w-[84%] h-[84%] text-[#10B981]/15 animate-spin-reverse pointer-events-none">
                      <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="1" strokeDasharray="10 15 2 2" fill="none" />
                    </svg>

                    {/* Face Target Graphic */}
                    <svg
                      viewBox="0 0 100 100"
                      className="w-20 h-20 text-[#38BDF8]/30 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)] group-hover:scale-105 transition-transform duration-500 pointer-events-none z-10"
                    >
                      <path
                        d="M 50 15 C 32 15 25 35 25 55 C 25 75 38 85 50 85 C 62 85 75 75 75 55 C 75 35 68 15 50 15 Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <line x1="30" y1="45" x2="70" y2="45" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />
                      <line x1="50" y1="15" x2="50" y2="85" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />
                    </svg>

                    {/* Active nodes */}
                    <div className="absolute top-[28%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38BDF8] animate-pulse" />
                    <div className="absolute top-[48%] left-[34%] w-1.5 h-1.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]" />
                    <div className="absolute top-[48%] right-[34%] w-1.5 h-1.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]" />
                    <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />

                    {/* Laser Target Reticles */}
                    <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#38BDF8]/60" />
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#38BDF8]/60" />
                    <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#38BDF8]/60" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#38BDF8]/60" />
                  </div>

                  {/* Console Footer Metadata */}
                  <div className="w-full flex flex-col items-center gap-1 z-10">
                    <span className="text-[7px] font-black uppercase text-[#38BDF8] tracking-[0.25em] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-2 py-0.5 rounded shadow-sm">
                      DERMO-IA v4.1
                    </span>
                    <span className="text-[6px] font-mono text-slate-500 tracking-widest group-hover:text-[#38BDF8]/60 transition-colors">
                      [ SCAN READY : CLICK TO START ]
                    </span>
                  </div>

                </div>

                {/* Status and Action text logs */}
                <div className="space-y-2 w-full text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 shadow-sm rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/70 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-700">
                      {language === 'FR' ? "Lancer le Diagnostic IA" : "بدء تشخيص الذكاء الاصطناعي"}
                    </span>
                  </div>
                  
                  <p className="text-[11px] font-medium text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                    {language === 'FR' 
                      ? "Cliquez pour analyser votre peau en direct et déverrouiller votre rituel sur-mesure." 
                      : "انقري لتحليل بشرتكِ مباشرة واكتشاف روتينكِ العلاجي المخصص."}
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
                <span>{language === 'FR' ? 'Créer ma Routine sur-mesure (-15% & Cadeau) 🎁' : 'صممي روتينكِ العلاجي (-15% وهدية مجانية) 🎁'}</span>
              </button>
            </Magnetic>
          </div>
        )}

      </div>
    </section>
  );
};
