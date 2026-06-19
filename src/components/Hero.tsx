'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { ArrowLeft, ArrowRight, Sparkles, Shield, Activity } from 'lucide-react';

interface HeroProps {
  onOpenDiagnostic: () => void;
  onSelectCategory: (category: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDiagnostic, onSelectCategory }) => {
  const { language } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const SLIDES = [
    {
      id: 1,
      bgImage: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1600&auto=format&fit=crop',
      icon: <Sparkles className="w-4 h-4 text-accent" />,
      tag_fr: 'SÉLECTION PREMIUM',
      tag_ar: 'تشكيلة فاخرة',
      subtitle_fr: 'COSMÉTIQUES CORÉENS EXCLUSIFS',
      subtitle_ar: 'مستحضرات التجميل الكورية الحصرية',
      title_fr: 'Le Secret de la Peau de Verre Coréenne ✨',
      title_ar: 'سر البشرة الزجاجية الكورية ✨',
      desc_fr: 'Découvrez notre collection K-Beauty officielle : Anua, Beauty of Joseon, Skin1004. Formules hypoallergéniques et actifs brevetés pour un teint parfait.',
      desc_ar: 'اكتشفي مجموعتنا الكورية الرسمية: أنوا، بيوتي أوف جوسون. تركيبات لطيفة ومكونات نشطة لبشرة متوهجة.',
      cta_fr: 'Acheter K-Beauty',
      cta_ar: 'تسوقي الجمال الكوري',
      ctaAction: () => onSelectCategory('kbeauty'),
    },
    {
      id: 2,
      bgImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=1600&auto=format&fit=crop',
      icon: <Shield className="w-4 h-4 text-secondary" />,
      tag_fr: 'PROTECTION CLINIQUE SPF 50+',
      tag_ar: 'حماية سريرية SPF 50+',
      subtitle_fr: 'SOLAIRES DE DERNIÈRE GÉNÉRATION',
      subtitle_ar: 'واقيات شمس الجيل الأحدث',
      title_fr: 'Défense Solaire Maximale & Ultra-Fluide ☀️',
      title_ar: 'حماية قصوى من الشمس ☀️',
      desc_fr: 'Garnier Super UV, Beauty of Joseon, Bioderma Photoderm. SPF 50+ PA++++ fini invisible. Commandez avant midi pour une livraison le jour même !',
      desc_ar: 'غارنييه، بيوتي أوف جوسون، بيوديرما. حماية SPF 50+ بملمس غير مرئي. اطلبي قبل الظهر للتوصيل in نفس اليوم!',
      cta_fr: 'Découvrir nos Solaires',
      cta_ar: 'اكتشفي واقيات الشمس',
      ctaAction: () => onSelectCategory('solaire'),
    },
    {
      id: 3,
      bgImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1600&auto=format&fit=crop',
      icon: <Activity className="w-4 h-4 text-accent" />,
      tag_fr: 'INNOVATION DERMO-CORNER',
      tag_ar: 'ابتكار ركن الجلدية',
      subtitle_fr: 'DIAGNOSTIC DERMATOLOGIQUE PAR IA',
      subtitle_ar: 'تشخيص جلدي بالذكاء الاصطناعي',
      title_fr: 'Votre routine clinique sur-mesure ⚡',
      title_ar: 'روتينك الجلدي المخصص بدقة ⚡',
      desc_fr: 'Notre algorithme clinique analyse votre type de peau et formule une routine matin/soir recommandée par nos pharmaciens avec 15% de réduction exclusive !',
      desc_ar: 'خوارزميتنا السريرية تحلل بشرتكِ وتركّب روتيناً موصى به من صيادلتنا مع خصم حصري 15٪!',
      cta_fr: 'Démarrer mon Diagnostic (-15%)',
      cta_ar: 'ابدئي التشخيص (خصم 15%-)',
      ctaAction: onOpenDiagnostic,
    },
  ];

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide(p => (p + 1) % SLIDES.length), 7000);
    return () => clearInterval(t);
  }, [SLIDES.length]);

  const isRTL = language === 'AR';

  return (
    <section className="relative w-full h-[580px] md:h-[640px] overflow-hidden bg-slate-900">
      {SLIDES.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{ backgroundImage: `url(${slide.bgImage})`, transform: isActive ? 'scale(1.03)' : 'scale(1)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
            </div>

            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl w-full mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">
                <div
                  className={`max-w-[600px] text-white space-y-5 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  } ${isRTL ? 'text-right ml-auto mr-0' : ''}`}
                >
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black tracking-widest text-accent ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {slide.icon}
                    <span>{language === 'FR' ? slide.tag_fr : slide.tag_ar}</span>
                  </div>

                  <span className="block text-xs font-extrabold tracking-[0.2em] text-secondary">
                    {language === 'FR' ? slide.subtitle_fr : slide.subtitle_ar}
                  </span>

                  <h1 className="text-3xl md:text-5xl font-black font-heading leading-tight">
                    {language === 'FR' ? slide.title_fr : slide.title_ar}
                  </h1>

                  <p className="text-sm text-gray-300 leading-relaxed font-light">
                    {language === 'FR' ? slide.desc_fr : slide.desc_ar}
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={slide.ctaAction}
                      className="group inline-flex items-center gap-2 px-7 py-3.5 bg-accent hover:bg-accent/80 text-white text-sm font-black uppercase tracking-wider rounded-xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-md"
                    >
                      <span>{language === 'FR' ? slide.cta_fr : slide.cta_ar}</span>
                      <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation arrows */}
      <div className="absolute bottom-8 right-8 z-20 flex gap-2">
        <button
          onClick={() => setCurrentSlide(p => (p - 1 + SLIDES.length) % SLIDES.length)}
          className="p-2.5 bg-white/10 hover:bg-accent border border-white/20 text-white rounded-xl backdrop-blur-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCurrentSlide(p => (p + 1) % SLIDES.length)}
          className="p-2.5 bg-white/10 hover:bg-accent border border-white/20 text-white rounded-xl backdrop-blur-md transition-all"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-8 left-8 z-20 flex gap-2 items-center">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className="relative w-10 h-1 bg-white/20 rounded-full overflow-hidden"
          >
            <div className={`absolute inset-0 bg-accent rounded-full transition-all ${i === currentSlide ? 'w-full duration-[7000ms]' : 'w-0'}`} />
          </button>
        ))}
      </div>
    </section>
  );
};
