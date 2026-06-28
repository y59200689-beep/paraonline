'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Sparkles, Check, Info, Sun, Moon } from 'lucide-react';

interface Step {
  id: number;
  nameFr: string;
  nameAr: string;
  subtitleFr: string;
  subtitleAr: string;
  descFr: string;
  descAr: string;
  importanceFr: string;
  importanceAr: string;
  time: 'AM' | 'PM' | 'Both';
  activesFr: string[];
  activesAr: string[];
  benefitsFr: string[];
  benefitsAr: string[];
  color: string; // Tailored glow color class
  icon: React.ReactNode;
}

export function RoutineVisualizer() {
  const { language } = useTranslation();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [sectionVisible, setSectionVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const isRTL = language === 'AR';

  // Trigger scroll reveal when the section enters the viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const steps: Step[] = [
    {
      id: 1,
      nameFr: 'Nettoyer',
      nameAr: 'التنظيف',
      subtitleFr: 'Préparer la base',
      subtitleAr: 'تهيئة الأساس',
      descFr: 'Élimine les impuretés, l\'excès de sébum et les résidus de pollution sans décaper le film hydrolipidique de la peau.',
      descAr: 'يزيل الأتربة، الدهون الزائدة وبقايا التلوث دون إتلاف الغشاء الواقي للبشرة.',
      importanceFr: 'Nettoyer libère les pores obstrués et évite l\'accumulation bactérienne. C\'est l\'étape indispensable pour que les actifs suivants pénètrent efficacement.',
      importanceAr: 'ينظف المسام المسدودة ويمنع تراكم البكتيريا. وهي خطوة أساسية لضمان تغلغل المواد الفعالة التالية.',
      time: 'Both',
      activesFr: ['Acide Salicylique', 'Centella Asiatica', 'Glycerin'],
      activesAr: ['حمض الساليسيليك', 'سنتيلا أسياتيكا', 'الجلسرين'],
      benefitsFr: ['Régule le sébum', 'Prévient les imperfections', 'Purifie en douceur'],
      benefitsAr: ['تنظيم الدهون', 'منع ظهور الشوائب', 'تطهير لطيف للمسام'],
      color: 'rgba(20, 184, 166, 0.15)', // Teal
      icon: (
        <svg className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      id: 2,
      nameFr: 'Préparer',
      nameAr: 'التهيئة',
      subtitleFr: 'Équilibrer le pH',
      subtitleAr: 'إعادة توازن الحموضة',
      descFr: 'Le tonique rééquilibre le pH de la peau après le nettoyage et apporte une première couche d\'hydratation pour assouplir l\'épiderme.',
      descAr: 'يعيد التونر توازن درجة حموضة البشرة بعد الغسيل ويوفر طبقة ترطيب أولى لتنعيم أنسجة الجلد.',
      importanceFr: 'Une peau nettoyée a un pH déstabilisé et se comporte comme une éponge sèche. Le tonique l\'humidifie pour multiplier par 3 l\'absorption des sérums.',
      importanceAr: 'تكون حموضة البشرة غير مستقرة بعد التنظيف وتتصرف كإسفنجة جافة. يعمل التونر على ترطيبها لمضاعفة امتصاص السيروم 3 مرات.',
      time: 'Both',
      activesFr: ['Panthenol (B5)', 'Eau Thermale', 'Acide Hyaluronique'],
      activesAr: ['بانثينول (B5)', 'مياه حرارية', 'حمض الهيالورونيك'],
      benefitsFr: ['Équilibre le pH', 'Calme les rougeurs', 'Assouplit la barrière'],
      benefitsAr: ['توازن درجة الحموضة', 'تهدئة الاحمرار', 'تنعيم حاجز الجلد'],
      color: 'rgba(99, 102, 241, 0.15)', // Indigo
      icon: (
        <svg className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 13.5a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
      )
    },
    {
      id: 3,
      nameFr: 'Traiter',
      nameAr: 'العلاج',
      subtitleFr: 'Actifs concentrés',
      subtitleAr: 'مكونات نشطة مركزة',
      descFr: 'Sérums hautement concentrés formulés pour cibler directement les problématiques cutanées (imperfections, rides, taches ou teint terne).',
      descAr: 'سيروم عالي التركيز مصمم خصيصاً لاستهداف مشاكل محددة (البثور، التجاعيد، البقع الداكنة، أو البهتان).',
      importanceFr: 'C\'est l\'étape clé de correction clinique. Les molécules actives pénètrent en profondeur pour restructurer les cellules cutanées.',
      importanceAr: 'هذه هي المرحلة الأساسية للتصحيح السريري. تتغلغل الجزيئات النشطة بعمق لإعادة بناء وتجديد خلايا البشرة.',
      time: 'Both',
      activesFr: ['Retinol', 'Vitamine C', 'Acide Tranexamique', 'Niacinamide'],
      activesAr: ['ريتينول', 'فيتامين C', 'حمض الترانيكساميك', 'نياسيناميد'],
      benefitsFr: ['Atténue les taches', 'Stimule le collagène', 'Lisse le grain de peau'],
      benefitsAr: ['تقليل البقع الداكنة', 'تحفيز الكولاجين', 'تنعيم ملمس البشرة'],
      color: 'rgba(217, 119, 6, 0.15)', // Amber/Gold
      icon: (
        <svg className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 4,
      nameFr: 'Hydrater',
      nameAr: 'الترطيب',
      subtitleFr: 'Sceller l\'eau',
      subtitleAr: 'حبس الرطوبة',
      descFr: 'Renforce le film hydrolipidique et empêche la perte insensible en eau (PIE) en scellant les hydratants précédents dans la peau.',
      descAr: 'يقوي الغشاء المائي الدهني ويمنع فقدان الماء عبر البشرة من خلال حبس المرطبات السابقة داخل الجلد.',
      importanceFr: 'Sans crème hydratante, les sérums s\'évaporent dans l\'air. Les lipides et céramides de la crème réparent le ciment intercellulaire.',
      importanceAr: 'بدون كريم مرطب، تتبخر فوائد السيروم في الهواء. تعمل الدهون والسيراميد في الكريم على إصلاح الروابط بين الخلايا.',
      time: 'Both',
      activesFr: ['Ceramides', 'Squalane', 'Peptides'],
      activesAr: ['سيراميد', 'سيروم السكوالين', 'ببتيدات'],
      benefitsFr: ['Répare la barrière', 'Maintient la souplesse', 'Hydratation 24h'],
      benefitsAr: ['إصلاح حاجز البشرة', 'الحفاظ على المرونة', 'ترطيب يدوم 24 ساعة'],
      color: 'rgba(59, 130, 246, 0.15)', // Blue
      icon: (
        <svg className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 5,
      nameFr: 'Protéger',
      nameAr: 'الحماية',
      subtitleFr: 'Bouclier UV',
      subtitleAr: 'درع الأشعة فوق البنفسجية',
      descFr: 'Protège contre les rayons UVA et UVB, responsables de 80% du vieillissement cutané prématuré et de l\'hyperpigmentation.',
      descAr: 'يحمي من الأشعة فوق البنفسجية UVA و UVB، المسؤولة عن 80% من الشيخوخة المبكرة وتصبغات البشرة.',
      importanceFr: 'L\'utilisation de sérums traitants (surtout acides ou rétinol) rend la peau photosensible. Le SPF50+ est la protection absolue indispensable chaque matin.',
      importanceAr: 'استخدام السيروم العلاجي (خاصة الأحماض أو الريتينول) يجعل البشرة حساسة للضوء. واقي الشمس SPF50+ هو الدرع الواقي صباحاً.',
      time: 'AM',
      activesFr: ['Filtres UV Organiques', 'Filtres Minéraux', 'Antioxydants'],
      activesAr: ['فلاتر عضوية', 'فلاتر معدنية', 'مضادات الأكسدة'],
      benefitsFr: ['Prévient le photo-vieillissement', 'Évite les taches solaires', 'Protège des radicaux libres'],
      benefitsAr: ['منع الشيخوخة الضوئية', 'تجنب بقع الشمس الداكنة', 'حماية من الجذور الحرة'],
      color: 'rgba(245, 158, 11, 0.15)', // Gold/Amber
      icon: (
        <svg className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      )
    }
  ];

  const currentStepData = steps[activeStep];

  return (
    <section
      ref={sectionRef}
      className={`bg-[#FAFAFA] border-b border-slate-200/40 relative overflow-hidden py-10 md:py-16 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* Soft Ambient Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl pointer-events-none opacity-60" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#EC4899]/5 to-transparent blur-3xl pointer-events-none opacity-60" />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 relative z-10">
        <div className="w-full bg-white rounded-[32px] border border-slate-100/80 shadow-[0_16px_40px_rgba(0,0,0,0.015)] p-6 sm:p-8 md:p-10 overflow-hidden">
      
      {/* ========================== HEADER ========================== */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 sm:mb-14 border-b border-slate-50 pb-6">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 justify-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black text-primary bg-[#1a4731]/5 uppercase tracking-widest border border-[#1a4731]/10">
              <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
              {isRTL ? 'التسلسل الطبيعي' : 'Ordre Clinique'}
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight font-sans">
            {isRTL ? 'تسلسل خطوات روتينك اليومي المثالي' : 'L\'Ordre de votre Routine Skincare'}
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm font-semibold max-w-2xl text-left">
            {isRTL 
              ? 'تطبيق المستحضرات بالترتيب الصحيح يضمن أقصى استفادة لبشرتك ويحمي حاجزها الطبيعي.' 
              : 'Appliquer les soins dans le bon ordre clinique maximise leur efficacité sur les différentes couches de la peau.'}
          </p>
        </div>
      </div>

      {/* ========================== STEP CHAIN TRAIL ========================== */}
      <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 my-6">
        
        {/* Connection Line (Desktop only) */}
        <div className="absolute top-[38px] left-[6%] right-[6%] h-[2px] bg-slate-100/70 -z-0 hidden md:block" />
        
        {/* Connection Line (Progressive fill desktop only) */}
        <div 
          className="absolute top-[38px] h-[2px] bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out -z-0 hidden md:block"
          style={{ 
            width: `${(activeStep / (steps.length - 1)) * 88}%`,
            right: isRTL ? '6%' : 'auto',
            left: isRTL ? 'auto' : '6%',
            transformOrigin: isRTL ? 'right center' : 'left center'
          }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < activeStep;
          const isActive = idx === activeStep;
          
          return (
            <button 
              key={step.id}
              onClick={() => setActiveStep(idx)}
              className="flex-1 relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-3.5 p-3 rounded-2xl w-full md:w-auto hover:bg-slate-50/50 md:hover:bg-transparent transition-all duration-300 group cursor-pointer focus:outline-none btn-press-feedback"
              style={{
                direction: isRTL ? 'rtl' : 'ltr',
                transitionDelay: sectionVisible ? `${idx * 60}ms` : '0ms',
                opacity: sectionVisible ? 1 : 0,
                transform: sectionVisible ? 'translateY(0)' : 'translateY(16px)',
              }}
            >
              {/* Step Circle Icon with double bezel */}
              <div 
                className={`w-14 h-14 sm:w-[68px] sm:h-[68px] rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0 relative ${
                  isCompleted 
                    ? 'bg-primary border-primary text-white scale-95 shadow-[0_4px_12px_rgba(26,71,49,0.15)]' 
                    : isActive 
                      ? 'bg-white border-accent text-accent scale-105 shadow-lg ring-4 ring-accent/10' 
                      : 'bg-white border-slate-200 text-slate-400 group-hover:border-slate-300 group-hover:text-slate-600'
                }`}
                style={{
                  boxShadow: isActive ? `0 10px 25px -5px ${step.color}` : ''
                }}
              >
                {isCompleted ? (
                  <Check className="w-5.5 h-5.5 stroke-[3px]" />
                ) : (
                  step.icon
                )}

                {/* Micro Step Index Badge */}
                <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border transition-all ${
                  isActive 
                    ? 'bg-accent text-white border-accent' 
                    : isCompleted 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                  {step.id}
                </span>
              </div>

              {/* Text Blocks */}
              <div className="flex-1 md:text-center min-w-0 text-left md:text-center">
                <div className="flex items-center md:justify-center gap-1.5 justify-start">
                  <span className={`text-sm sm:text-[14.5px] font-black tracking-tight transition-colors duration-300 ${
                    isActive ? 'text-accent' : 'text-slate-800'
                  }`}>
                    {isRTL ? step.nameAr : step.nameFr}
                  </span>
                  {step.time === 'AM' && (
                    <span className="text-[8px] px-1 py-0.5 rounded-[4px] bg-amber-50 text-amber-600 font-bold border border-amber-100 scale-90 uppercase shrink-0">
                      AM
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mt-0.5 md:hidden lg:block text-left md:text-center">
                  {isRTL ? step.subtitleAr : step.subtitleFr}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ========================== FOCUS DETAIL SHOWCARD ========================== */}
      <div 
        key={activeStep}
        className="mt-12 bg-gradient-to-br from-white to-slate-50/40 border border-slate-100 rounded-[24px] p-6 sm:p-8 flex flex-col lg:flex-row gap-8 items-stretch shadow-[0_4px_20px_rgba(0,0,0,0.005)] t-panel"
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        {/* Left Side: Step Details */}
        <div className="flex-1 space-y-5 text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-[#b5905b] uppercase tracking-[0.25em] block leading-none">
              {isRTL ? `الخطوة 0${currentStepData.id}` : `Étape 0${currentStepData.id}`}
            </span>
            <h4 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-tight">
              {isRTL ? currentStepData.nameAr : currentStepData.nameFr}
              <span className="text-slate-400 font-extrabold text-sm ml-2.5 sm:ml-4 font-heading border-l border-slate-200 pl-2.5 sm:pl-4 uppercase tracking-wider">
                {isRTL ? currentStepData.subtitleAr : currentStepData.subtitleFr}
              </span>
            </h4>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
            {isRTL ? currentStepData.descAr : currentStepData.descFr}
          </p>

          {/* Benefits Checkpoints */}
          <div className="pt-2.5 space-y-2 border-t border-slate-100">
            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block mb-3">
              {isRTL ? 'الفوائد الملموسة للبشرة' : 'Bénéfices cutanés'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(isRTL ? currentStepData.benefitsAr : currentStepData.benefitsFr).map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-extrabold">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Check className="w-3 h-3 stroke-[3px]" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Scientific Context & Active Ingredients */}
        <div className="w-full lg:w-[380px] bg-[#fdfcf9] border border-[#eedfd2]/50 rounded-[20px] p-6 flex flex-col justify-between gap-6 text-left shrink-0 shadow-sm relative overflow-hidden">
          {/* Subtle design gradient accent */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-[#eedfd2]/15 blur-xl pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2 text-[#b5905b]">
              <Info className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {isRTL ? 'لماذا هذه الخطوة مهمة؟' : 'Raisonnement Clinique'}
              </span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-stone-600 font-semibold">
              {isRTL ? currentStepData.importanceAr : currentStepData.importanceFr}
            </p>
          </div>

          <div className="space-y-4 relative z-10 border-t border-[#eedfd2]/30 pt-4 mt-auto">
            {/* Actives Molecules recommendations */}
            <span className="text-[9.5px] font-black text-stone-400 uppercase tracking-widest block">
              {isRTL ? 'الجزيئات النشطة الموصى بها' : 'Molécules actives'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(isRTL ? currentStepData.activesAr : currentStepData.activesFr).map((active, idx) => (
                <span 
                  key={idx} 
                  className="px-2.5 py-1 bg-white border border-[#eedfd2]/50 text-[#b5905b] text-[10px] font-extrabold rounded-lg shadow-sm hover:border-[#b5905b]/40 transition-colors"
                >
                  {active}
                </span>
              ))}
            </div>
          </div>
          
          {/* Routine schedule clock badge */}
          <div className="flex items-center justify-between border-t border-[#eedfd2]/30 pt-4 relative z-10">
            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
              {isRTL ? 'جدول التطبيق' : 'Application'}
            </span>
            <div className="flex gap-2">
              {currentStepData.time !== 'PM' && (
                <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-[6px] border border-amber-100 text-[10px] font-black uppercase">
                  <Sun className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'صباحاً' : 'Matin'}</span>
                </div>
              )}
              {currentStepData.time !== 'AM' && (
                <div className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-[6px] border border-indigo-100 text-[10px] font-black uppercase">
                  <Moon className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'مساءً' : 'Soir'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
        </div>
      </div>
    </section>
  );
}
