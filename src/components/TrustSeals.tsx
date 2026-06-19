'use client';

import React from 'react';
import { useTranslation } from '../context/LanguageContext';
import { ShieldCheck, MessageCircle, Truck, CreditCard, ArrowRight, Sparkles } from 'lucide-react';

export const TrustSeals: React.FC = () => {
  const { language } = useTranslation();
  const isRTL = language === 'AR';

  const SEALS = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-accent" />,
      title_fr: "Produits 100% Authentiques",
      title_ar: "منتجات أصلية 100٪",
      desc_fr: "Importés directement de laboratoires coréens et européens certifiés. Aucun risque d'imitation.",
      desc_ar: "مستوردة مباشرة من مختبرات كورية وأوروبية معتمدة. لا توجد أي منتجات مقلدة.",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]",
      iconBg: "bg-accent/10 border-accent/20",
    },
    {
      icon: <MessageCircle className="w-5 h-5 text-whatsapp" />,
      title_fr: "Conseil Pharmacien Offert",
      title_ar: "استشارة صيدلانية مجانية",
      desc_fr: "Des questions sur votre routine ? Nos conseillers certifiés vous guident instantanément sur WhatsApp.",
      desc_ar: "لديكِ أسئلة عن روتينكِ؟ خبراؤنا يجيبونكِ ويوجهونكِ فوراً على الواتساب.",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(37,211,102,0.2)]",
      iconBg: "bg-whatsapp/10 border-whatsapp/20",
      action: () => window.open('https://wa.me/212660000000', '_blank'),
      actionText_fr: "Discuter sur WhatsApp",
      actionText_ar: "تحدثي معنا الآن",
    },
    {
      icon: <Truck className="w-5 h-5 text-secondary" />,
      title_fr: "Livraison Express en 3H",
      title_ar: "توصيل سريع خلال 3 ساعات",
      desc_fr: "Commandez avant midi et recevez vos produits le jour même à Tanger, Rabat, Fès et Casablanca.",
      desc_ar: "اطلبي قبل الظهر واستلمي منتجاتكِ في نفس اليوم بطنجة، الرباط، فاس والدار البيضاء.",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(249,168,212,0.2)]",
      iconBg: "bg-secondary/10 border-secondary/20",
    },
    {
      icon: <CreditCard className="w-5 h-5 text-primary" />,
      title_fr: "Paiement 100% Sécurisé",
      title_ar: "دفع آمن 100٪ عند الاستلام",
      desc_fr: "Réglez en espèces à la livraison (COD) après inspection, ou par carte bancaire CMI.",
      desc_ar: "ادفعي نقداً عند الاستلام بعد معاينة طلبكِ، أو عبر البطاقة البنكية مع مركز النقديات CMI.",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]",
      iconBg: "bg-primary/10 border-primary/20",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-background via-white to-muted border-t border-b border-border/20">
      {/* Soft background decor for luxury aesthetics */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 relative z-10">
        
        {/* Subtle section label */}
        <div className="flex flex-col items-center text-center mb-14 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-accent/10 rounded-full text-[9px] font-black text-accent uppercase tracking-[0.2em] shadow-sm">
            <Sparkles className="w-3 h-3 fill-accent stroke-none" />
            <span>{language === 'FR' ? "Nos Engagements d'Excellence" : "التزاماتنا بالتميز"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {SEALS.map((seal, i) => (
            <div
              key={i}
              onClick={seal.action}
              className={`group relative rounded-2xl py-8 px-6 bg-white border border-slate-100 shadow-[0_4px_20px_rgba(131,24,67,0.01)] hover:shadow-[0_20px_45px_rgba(139,92,246,0.06)] ${seal.glowColor} transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1.5 active:scale-[0.98] flex flex-col justify-between h-auto ${
                seal.action 
                  ? 'cursor-pointer hover:border-[#25d366]/30' 
                  : 'cursor-default hover:border-accent/20'
              }`}
            >
              <div className="space-y-4.5">
                {/* Premium Squircle Icon Container */}
                <div className={`w-10 h-10 rounded-lg ${seal.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-sm`}>
                  {seal.icon}
                </div>
                
                <div className={`space-y-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <h3 className="text-[13px] md:text-[14px] font-black text-primary-dark leading-snug tracking-tight">
                    {language === 'FR' ? seal.title_fr : seal.title_ar}
                  </h3>
                  <p className="text-[11px] md:text-[12px] leading-relaxed text-foreground/75 font-medium">
                    {language === 'FR' ? seal.desc_fr : seal.desc_ar}
                  </p>
                </div>
              </div>

              {seal.action && (
                <div className={`mt-5 pt-4 border-t border-slate-50 flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
                  <div className={`inline-flex items-center gap-1.5 px-4 py-2 bg-[#25d366]/10 border border-[#25d366]/10 hover:bg-[#25d366] hover:text-white text-[#129141] font-black uppercase tracking-wider text-[9px] rounded-lg transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-95 shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span>{language === 'FR' ? seal.actionText_fr : seal.actionText_ar}</span>
                    <ArrowRight className={`w-3 h-3 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
