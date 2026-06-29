'use client';

import React from 'react';
import { Star, MapPin, Check } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export const CustomerReviews: React.FC = () => {
  const { settings } = useSettings();
  const activeSection = settings.homepageSections?.sectionOrder?.find(s => s.type === 'customerReviews');

  const defaultReviewsRow1 = [
    { name: 'B.Khadija', nameAr: 'ب.خديجة', city: 'Casablanca', cityAr: 'الدار البيضاء', stars: 5, review: 'Livraison ultra-rapide et produits 100% authentiques. La crème Cicaplast a littéralement transformé ma peau !', reviewAr: 'توصيل سريع جداً ومنتجات أصلية 100٪. كريم سيكابلاست غيّر بشرتي تماماً!' },
    { name: 'A.Yasmine', nameAr: 'ع.ياسمين', city: 'Marrakech', cityAr: 'مراكش', stars: 5, review: 'Service client irréprochable. Je commande chaque mois et je n\'ai jamais été déçue.', reviewAr: 'خدمة عملاء لا تشوبها شائبة. أطلب كل شهر ولم أخيب أملي قط.' },
    { name: 'B.Salma', nameAr: 'ب.سلمى', city: 'Rabat', cityAr: 'الرباط', stars: 4, review: 'Prix imbattables et produits originaux garantis. Para Officinal est ma référence beauté au Maroc !', reviewAr: 'أسعار لا تُنافَس ومنتجات أصلية مضمونة.' },
    { name: 'K.Fatima-Zahra', nameAr: 'ق.فاطمة الزهراء', city: 'Tanger', cityAr: 'طنجة', stars: 5, review: 'Des produits de grande qualité à des tarifs très accessibles. Le sérum Revitalift est une merveille.', reviewAr: 'منتجات عالية الجودة بأسعار في متناول الجميع.' },
    { name: 'B.Latifa', nameAr: 'ب.لطيفة', city: 'Fès', cityAr: 'فاس', stars: 5, review: 'Emballage soigné et livraison express dès le lendemain. La qualité est toujours au rendez-vous !', reviewAr: 'تغليف أنيق وتوصيل سريع في اليوم التالي.' },
    { name: 'A.Mouna', nameAr: 'ع.منى', city: 'Agadir', cityAr: 'أكادير', stars: 4, review: 'Très bon site avec un choix incroyable. La commande arrive toujours bien emballée avec des échantillons.', reviewAr: 'موقع ممتاز مع خيارات رائعة.' },
    { name: 'T.Siham', nameAr: 'ط.سهام', city: 'Oujda', cityAr: 'وجدة', stars: 5, review: 'Le diagnostic de peau en ligne est extrêmement précis. Les produits conseillés fonctionnent super bien !', reviewAr: 'التشخيص الرقمي للبشرة دقيق جداً.' },
    { name: 'E.Laila', nameAr: 'ع.ليلى', city: 'Meknès', cityAr: 'مكناس', stars: 5, review: 'Je suis ravie de mes achats. Enfin une vraie parapharmacie en ligne sérieuse et fiable au Maroc.', reviewAr: 'سعيدة جداً بمشترياتي.' }
  ];

  const defaultReviewsRow2 = [
    { name: 'K.Ghita', nameAr: 'ق.غيثة', city: 'Casablanca', cityAr: 'الدار البيضاء', stars: 5, review: 'La livraison en 24h à Casablanca est un vrai bonheur. Les coffrets cadeaux sont magnifiques.', reviewAr: 'التوصيل خلال 24 ساعة رائع حقاً.' },
    { name: 'J.Imane', nameAr: 'ج.إيمان', city: 'Marrakech', cityAr: 'مراكش', stars: 5, review: 'Une parapharmacie de confiance. Les produits sont toujours frais avec de longues dates d\'expiration.', reviewAr: 'صيدلية موثوقة. المنتجات جديدة دائماً.' },
    { name: 'A.Oumaima', nameAr: 'ع.أميمة', city: 'Rabat', cityAr: 'الرباط', stars: 5, review: 'J\'adore les petits cadeaux et échantillons glissés dans le carton. Service d\'exception.', reviewAr: 'أعجبتني الهدايا الصغيرة والعينات المرفقة.' },
    { name: 'H.Soukaina', nameAr: 'هـ.سكينة', city: 'Tanger', cityAr: 'طنجة', stars: 4, review: 'Superbe sélection de soins capillaires. Mes cheveux sont beaucoup plus forts et brillants.', reviewAr: 'تشكيلة رائعة من مستحضرات العناية بالشعر.' },
    { name: 'N.Asmae', nameAr: 'ن.أسماء', city: 'Fès', cityAr: 'فاس', stars: 5, review: 'Toujours au top ! Je conseille ce site à toutes mes amies pour la fiabilité et le professionnalisme.', reviewAr: 'دائماً في القمة! أنصح جميع صديقاتي بهذا الموقع.' },
    { name: 'B.Houda', nameAr: 'ب.هدى', city: 'Agadir', cityAr: 'أكادير', stars: 5, review: 'Excellent suivi de commande par SMS. Je me sens en toute sécurité en achetant mes crèmes ici.', reviewAr: 'متابعة ممتازة للطلب عبر الرسائل النصية.' },
    { name: 'Z.Salma', nameAr: 'ز.سلمى', city: 'Oujda', cityAr: 'وجدة', stars: 5, review: 'Le baume Mixa Bébé pour mon enfant est parfait. Très doux pour la peau fragile.', reviewAr: 'بلسم ميكسا بيبي لطفلي ممتاز.' },
    { name: 'A.Karima', nameAr: 'ع.كريمة', city: 'Meknès', cityAr: 'مكناس', stars: 4, review: 'Des conseillères beauté adorables qui vous aident à choisir les bons produits.', reviewAr: 'مستشارات جمال رائعات يساعدنك في اختيار المنتجات.' }
  ];

  let reviewsRow1 = defaultReviewsRow1;
  let reviewsRow2 = defaultReviewsRow2;

  if (activeSection?.settings?.reviews && activeSection.settings.reviews.length > 0) {
    const list = activeSection.settings.reviews.map(r => ({
      name: r.author,
      nameAr: r.authorAr || r.author,
      city: r.role || 'Maroc',
      cityAr: r.roleAr || r.role || 'المغرب',
      stars: r.rating,
      review: r.textFr,
      reviewAr: r.textAr || r.textFr
    }));
    const half = Math.ceil(list.length / 2);
    reviewsRow1 = list.slice(0, half);
    reviewsRow2 = list.slice(half);
  }

  // Double arrays to ensure smooth infinite loop scroll
  const row1List = [...reviewsRow1, ...reviewsRow1];
  const row2List = [...reviewsRow2, ...reviewsRow2];

  return (
    <section className="section-dark border-b border-slate-800/40 relative overflow-hidden py-16 md:py-24 reveal-on-scroll">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 relative z-10 font-sans">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="eyebrow-tag eyebrow-tag-dark font-sans">
                <span className="hidden rtl:inline font-sans">آراء العملاء</span>
                <span className="inline rtl:hidden font-sans">Avis Clients</span>
              </span>
            </div>
            <h2 className="text-[22px] md:text-3xl font-black text-white leading-tight font-sans">
              <span className="hidden rtl:inline font-sans font-black">ما تقوله عميلاتنا المميّزات</span>
              <span className="inline rtl:hidden font-sans font-black">Ce que disent nos meilleures clientes</span>
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2.5 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-4 py-2 shadow-md shrink-0">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs font-black text-white">4.9/5</span>
            <span className="text-[10px] text-slate-400 font-semibold">· +2 400 avis</span>
          </div>
        </div>

        {/* Styles for Infinite Marquee Animations */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marqueeLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marqueeRight {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-marquee-left {
            display: flex;
            width: max-content;
            animation: marqueeLeft 75s linear infinite;
          }
          .animate-marquee-right {
            display: flex;
            width: max-content;
            animation: marqueeRight 75s linear infinite;
          }
          .marquee-container:hover .animate-marquee-left,
          .marquee-container:hover .animate-marquee-right {
            animation-play-state: paused;
          }
        `}} />

        {/* Infinite Scrolling Dual-Marquee Wall */}
        <div className="marquee-container flex flex-col gap-6 overflow-hidden py-2 select-none relative">
          {/* Ambient side fading gradients for seamless blend */}
          <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#080f1e] to-transparent z-20 pointer-events-none" style={{ direction: 'ltr' }} />
          <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#080f1e] to-transparent z-20 pointer-events-none" style={{ direction: 'ltr' }} />

          {/* ROW 1: Scrolling Left */}
          <div className="flex w-full overflow-hidden">
            <div className="animate-marquee-left flex gap-4">
              {row1List.map((user, idx) => (
                <div key={idx} className="flex flex-col glass-card-dark border-white/5 rounded-[20px] p-4 cursor-pointer group w-[280px] sm:w-[320px] shrink-0 text-left font-sans">
                  <div className="flex items-center gap-3 mb-3">
                    {(() => {
                      const firstLetterFr = user.name.trim().charAt(0).toUpperCase() || '?';
                      const firstLetterAr = user.nameAr.trim().charAt(0).toUpperCase() || '?';
                      const charCode = firstLetterFr.charCodeAt(0) || 0;
                      const schemes = [
                        { bg: "bg-accent/20", border: "border-accent/30", text: "text-teal-300" },
                        { bg: "bg-gold/20", border: "border-gold/30", text: "text-amber-200" },
                        { bg: "bg-indigo-950/40", border: "border-indigo-500/20", text: "text-indigo-200" },
                        { bg: "bg-emerald-950/40", border: "border-emerald-500/20", text: "text-emerald-300" },
                        { bg: "bg-purple-950/40", border: "border-purple-500/20", text: "text-purple-200" }
                      ];
                      const scheme = schemes[charCode % schemes.length];
                      return (
                        <div className={`w-11 h-11 shrink-0 rounded-[12px] flex items-center justify-center font-black border text-sm uppercase tracking-wider shadow-sm transition-transform duration-500 ease-out group-hover:scale-105 ${scheme.bg} ${scheme.border} ${scheme.text}`}>
                          <span className="hidden rtl:inline">{firstLetterAr}</span>
                          <span className="inline rtl:hidden">{firstLetterFr}</span>
                        </div>
                      );
                    })()}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                        <span className="text-[9px] font-bold text-emerald-400 leading-none">
                          <span className="hidden rtl:inline">مشترية موثوقة</span>
                          <span className="inline rtl:hidden">Acheteur vérifié</span>
                        </span>
                      </div>
                      <h4 className="text-[13px] font-black text-white leading-none truncate font-sans">
                        <span className="hidden rtl:inline">{user.nameAr}</span>
                        <span className="inline rtl:hidden">{user.name}</span>
                      </h4>
                      <div className="flex items-center gap-1 mt-1 font-sans">
                        <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span className="text-[10px] text-slate-400 font-semibold leading-none">
                          <span className="hidden rtl:inline">{user.cityAr}</span>
                          <span className="inline rtl:hidden">{user.city}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(user.stars)].map((_, i) => (<Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />))}
                    {[...Array(5 - user.stars)].map((_, i) => (<Star key={i} className="w-3 h-3 text-slate-600 fill-slate-600" />))}
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed line-clamp-3">
                    <span className="hidden rtl:inline">&ldquo;{user.reviewAr}&rdquo;</span>
                    <span className="inline rtl:hidden">&ldquo;{user.review}&rdquo;</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ROW 2: Scrolling Right */}
          <div className="flex w-full overflow-hidden">
            <div className="animate-marquee-right flex gap-4">
              {row2List.map((user, idx) => (
                <div key={idx} className="flex flex-col glass-card-dark border-white/5 rounded-[20px] p-4 cursor-pointer group w-[280px] sm:w-[320px] shrink-0 text-left font-sans">
                  <div className="flex items-center gap-3 mb-3">
                    {(() => {
                      const firstLetterFr = user.name.trim().charAt(0).toUpperCase() || '?';
                      const firstLetterAr = user.nameAr.trim().charAt(0).toUpperCase() || '?';
                      const charCode = firstLetterFr.charCodeAt(0) || 0;
                      const schemes = [
                        { bg: "bg-accent/20", border: "border-accent/30", text: "text-teal-300" },
                        { bg: "bg-gold/20", border: "border-gold/30", text: "text-amber-200" },
                        { bg: "bg-indigo-950/40", border: "border-indigo-500/20", text: "text-indigo-200" },
                        { bg: "bg-emerald-950/40", border: "border-emerald-500/20", text: "text-emerald-300" },
                        { bg: "bg-purple-950/40", border: "border-purple-500/20", text: "text-purple-200" }
                      ];
                      const scheme = schemes[charCode % schemes.length];
                      return (
                        <div className={`w-11 h-11 shrink-0 rounded-[12px] flex items-center justify-center font-black border text-sm uppercase tracking-wider shadow-sm transition-transform duration-500 ease-out group-hover:scale-105 ${scheme.bg} ${scheme.border} ${scheme.text}`}>
                          <span className="hidden rtl:inline">{firstLetterAr}</span>
                          <span className="inline rtl:hidden">{firstLetterFr}</span>
                        </div>
                      );
                    })()}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                        <span className="text-[9px] font-bold text-emerald-400 leading-none">
                          <span className="hidden rtl:inline">مشترية موثوقة</span>
                          <span className="inline rtl:hidden">Acheteur vérifié</span>
                        </span>
                      </div>
                      <h4 className="text-[13px] font-black text-white leading-none truncate font-sans">
                        <span className="hidden rtl:inline">{user.nameAr}</span>
                        <span className="inline rtl:hidden">{user.name}</span>
                      </h4>
                      <div className="flex items-center gap-1 mt-1 font-sans">
                        <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span className="text-[10px] text-slate-400 font-semibold leading-none">
                          <span className="hidden rtl:inline">{user.cityAr}</span>
                          <span className="inline rtl:hidden">{user.city}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(user.stars)].map((_, i) => (<Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />))}
                    {[...Array(5 - user.stars)].map((_, i) => (<Star key={i} className="w-3 h-3 text-slate-600 fill-slate-600" />))}
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed line-clamp-3">
                    <span className="hidden rtl:inline">&ldquo;{user.reviewAr}&rdquo;</span>
                    <span className="inline rtl:hidden">&ldquo;{user.review}&rdquo;</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
