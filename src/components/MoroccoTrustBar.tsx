'use client';

import React from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { Truck, CreditCard, ShieldCheck, MessageSquare, ArrowUpRight } from 'lucide-react';

export const MoroccoTrustBar: React.FC = () => {
  const { language } = useTranslation();
  const { settings } = useSettings();
  
  const storeWhatsApp = settings?.storeWhatsApp || '212660808080';

  const trustItems = [
    {
      id: 'shipping',
      icon: Truck,
      titleFR: 'Livraison Rapide Maroc',
      titleAR: 'شحن سريع بالمغرب',
      descFR: 'Gratuite sur Casablanca & Rabat sous 24h, et partout au Maroc sous 48h.',
      descAR: 'مجاني في الدار البيضاء والرباط خلال 24 ساعة، وفي جميع أنحاء المغرب خلال 48 ساعة.',
      highlight: false,
    },
    {
      id: 'cod',
      icon: CreditCard,
      titleFR: 'Paiement à la Livraison',
      titleAR: 'الدفع عند الاستلام',
      descFR: 'Paiement 100% sécurisé en espèces ou par carte bancaire lors de la réception.',
      descAR: 'دفع آمن 100٪ عند الاستلام نقدًا أو بالبطاقة البنكية عند استلام طلبكِ.',
      highlight: false,
    },
    {
      id: 'authenticity',
      icon: ShieldCheck,
      titleFR: '100% Authentique',
      titleAR: 'أصلي 100٪',
      descFR: 'Produits certifiés d\'origine, importés directement de Séoul (K-Beauty) et de France.',
      descAR: 'منتجات أصلية معتمدة، مستوردة مباشرة من سيول (كوريا) وفرنسا.',
      highlight: false,
    },
    {
      id: 'whatsapp',
      icon: MessageSquare,
      titleFR: 'Conseil & Support WhatsApp',
      titleAR: 'دعم و استشارة واتساب',
      descFR: 'Des experts K-Beauty et conseillers disponibles 7j/7 pour vous guider.',
      descAR: 'خبراء العناية بالبشرة ومستشارون متوفرون 7 أيام في الأسبوع لمساعدتكِ.',
      highlight: true,
      actionUrl: `https://wa.me/${storeWhatsApp}?text=Bonjour, je souhaite avoir des conseils de soin.`,
    },
  ];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-slate-50/50 dark:bg-slate-950/10">
      {/* Background ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-slate-200/20 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Section Header (Vertical stack - Stacked structure) */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16 space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
            {language === 'AR' ? (
              <>
                خدماتنا و <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">ضمانات الثقة المحلية</span>
              </>
            ) : (
              <>
                Nos Engagements de <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Confiance Locale</span>
              </>
            )}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {language === 'AR'
              ? 'نهتم برضاكِ من خلال تقديم تجربة تسوق آمنة وسريعة متوافقة تمامًا مع احتياجاتكِ في المغرب.'
              : 'Parce que votre satisfaction est notre priorité absolue, nous vous garantissons un service irréprochable adapté au marché marocain.'
            }
          </p>
        </div>

        {/* Dynamic Trust Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.map((item) => {
            const IconComponent = item.icon;
            const title = language === 'AR' ? item.titleAR : item.titleFR;
            const desc = language === 'AR' ? item.descAR : item.descFR;

            const CardContent = (
              <>
                <div className="flex justify-between items-start mb-4">
                  {/* Icon outer container */}
                  <div className={`p-2.5 rounded-xl flex items-center justify-center transition-colors duration-500 ${
                    item.highlight
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  } group-hover:bg-emerald-500 group-hover:text-white`}>
                    <IconComponent className="w-5 h-5 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                  </div>
                  
                  {/* Click indicator for interactive cards */}
                  {item.actionUrl && (
                    <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-slate-600 transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-500" />
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white transition-colors duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {desc}
                  </p>
                </div>
              </>
            );

            // Container class with double-bezel concentric curves styling
            const cardClasses = `group relative h-full flex flex-col justify-between text-left p-1.5 rounded-[24px] bg-slate-200/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 shadow-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-md hover:border-emerald-500/20 dark:hover:border-emerald-500/30 ${
              item.actionUrl ? 'cursor-pointer' : ''
            }`;

            const innerClasses = "w-full h-full rounded-[calc(24px-6px)] bg-white dark:bg-slate-900 shadow-inner p-5 flex flex-col justify-between transition-colors duration-500";

            if (item.actionUrl) {
              return (
                <a
                  key={item.id}
                  href={item.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClasses}
                >
                  <div className={innerClasses}>
                    {CardContent}
                  </div>
                </a>
              );
            }

            return (
              <div key={item.id} className={cardClasses}>
                <div className={innerClasses}>
                  {CardContent}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
