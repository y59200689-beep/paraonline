'use client';

import React from 'react';
import Link from 'next/link';
import { ShopShell } from '@/components/ShopShell';
import { useTranslation } from '@/context/LanguageContext';
import { useUi } from '@/context/UiContext';
import {
  ShieldCheck,
  Sparkles,
  Award,
  Truck,
  HeartHandshake,
  Microscope,
  Lock,
  Stethoscope,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Clock,
  Users,
  Building2,
  MessageSquareCheck
} from 'lucide-react';

export function AboutClient() {
  const { language } = useTranslation();
  const { setDiagnosticOpen } = useUi();
  const isRTL = language === 'AR';

  return (
    <ShopShell>
      <div
        className="min-h-screen bg-[#FAF9F6] text-slate-900 selection:bg-emerald-500 selection:text-white relative overflow-hidden font-sans"
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        {/* Subtle Ambient Top Radial Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08)_0%,rgba(14,165,233,0.03)_45%,transparent_70%)] pointer-events-none z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-16 lg:space-y-28">

          {/* ──────────────── 1. HERO SECTION ──────────────── */}
          <section className="text-center space-y-8 pt-4">
            {/* Micro Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200/80 rounded-full text-emerald-800 text-xs font-mono font-bold tracking-widest uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>
                {language === 'AR' ? 'المؤسسة الطبية للتجميل بالمرطب' : 'Maison de Parapharmacie Clinique & Officinale'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
              {language === 'AR' ? (
                <>
                  نُعيد تعريف <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">العناية بالبشرة</span> في المغرب بدقة علمية وأمان تام
                </>
              ) : (
                <>
                  Redéfinir la <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Dermo-Cosmétique</span> au Maroc avec Vigueur Scientifique
                </>
              )}
            </h1>

            {/* Narrative Spine Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
              {language === 'AR'
                ? 'فارما أوفيسينال ص.م هي المنصة الرائدة في المغرب في مجال الصيدلة البديلة والجمال السريري. نجمع بين الخبرة الصيدلانية الأوروبية ومفهوم التشخيص الذكي بالذكاء الاصطناعي لضمان أفضل نتائج لجميع أنواع البشرة.'
                : 'Pionnier de la parapharmacie officinale connectée au Maroc. Nous fusionnons la rigueur pharmacologique européenne avec l\'innovation technologique et l\'accessibilité logistique sur l\'ensemble du territoire national.'}
            </p>

            {/* Key Metrics Deck */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 max-w-5xl mx-auto">
              {[
                {
                  value: '100%',
                  labelFr: 'Produits Authentiques',
                  labelAr: 'منتجات أصلية 100%',
                  descFr: 'Directement des laboratoires',
                  descAr: 'مباشرة من المختبرات',
                  icon: ShieldCheck,
                  color: 'text-emerald-600'
                },
                {
                  value: '50 000+',
                  labelFr: 'Peaux Accompagnées',
                  labelAr: 'أكثر من 50,000 عميلة',
                  descFr: 'Dans tout le Royaume',
                  descAr: 'في جميع أنحاء المغرب',
                  icon: Users,
                  color: 'text-teal-600'
                },
                {
                  value: '24/48h',
                  labelFr: 'Livraison Express COD',
                  labelAr: 'توصيل سريع وسري',
                  descFr: 'Dans les 12 régions',
                  descAr: 'في 12 جهة بالمغرب',
                  icon: Truck,
                  color: 'text-cyan-600'
                },
                {
                  value: '90+',
                  labelFr: 'Marques Prestataires',
                  labelAr: 'ماركة عالمية معتمدة',
                  descFr: 'Curation dermatologique',
                  descAr: 'اختبارات سريرية مؤكدة',
                  icon: Award,
                  color: 'text-amber-600'
                }
              ].map((stat, idx) => {
                const StatIcon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-md hover:shadow-lg transition duration-300 text-left relative overflow-hidden group"
                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                  >
                    <div className="flex items-center justify-between mb-3" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                      <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${stat.color}`}>
                        {stat.value}
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:scale-110 transition duration-300">
                        <StatIcon className="w-4.5 h-4.5 text-slate-700" />
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-900 font-heading">
                      {language === 'AR' ? stat.labelAr : stat.labelFr}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      {language === 'AR' ? stat.descAr : stat.descFr}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>


          {/* ──────────────── 2. OUR STORY & BRAND PILLARS (BENTO) ──────────────── */}
          <section className="space-y-10">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-100/70 px-3.5 py-1 rounded-full border border-emerald-200">
                {language === 'AR' ? 'فلسفتنا والتزامنا' : 'NOTRE RENAISSANCE & ENGAGEMENT'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-heading tracking-tight">
                {language === 'AR' ? 'لماذا تختار فارما أوفيسينال؟' : 'Pourquoi Choisir Para Officinal S.A ?'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                {language === 'AR'
                  ? 'ثلاثة ركائز أساسية تجعلنا الخيار الأول والآمن لكل من يبحث عن صحة ونضارة بشرته.'
                  : 'Trois piliers fondamentaux qui font de notre maison le partenaire dermo-cosmétique le plus fiable au Maroc.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar 1 */}
              <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md flex flex-col justify-between space-y-6 group hover:border-emerald-500/40 hover:shadow-xl transition duration-500">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition duration-300">
                    <Microscope className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 font-heading tracking-tight">
                    {language === 'AR' ? '1. حفظ وتخزين طبي صارم' : '1. Chaîne du Froid & Stockage Officinal'}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {language === 'AR'
                      ? 'نوفر مستودعات معقمة ومراقبة حرارياً بين 15°C و 25°C للحفاظ على كفاءة المواد الفعالة الحساسة مثل الريتينول وفيتامين C وحمض الهيالورونيك.'
                      : 'Nos entrepôts sont thermo-régulés entre 15°C et 25°C. Nous préservons l\'intégrité moléculaire des principes actifs sensibles (Vitamine C, Rétinol, Céramides) contre les variations de chaleur.'}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] font-mono text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'AR' ? 'معايير النظافة الصيدلانية' : 'Protocoles d\'Hygiène Stérile'}</span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md flex flex-col justify-between space-y-6 group hover:border-teal-500/40 hover:shadow-xl transition duration-500">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-105 transition duration-300">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 font-heading tracking-tight">
                    {language === 'AR' ? '2. تشخيص البشرة بالذكاء الاصطناعي' : '2. Diagnostic de Peau Clinique par IA'}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {language === 'AR'
                      ? 'مطور بالتعاون مع خبراء الجلدية. تحليل فوري لنوع البشرة والمشاكل (حب الشباب، التصبغات، الجفاف) لتقديم روتين شخصي بدقة متناهية.'
                      : 'Développé en synergie avec des praticiens dermatologues. Notre algorithme exclusif analyse votre profil cutané et génère votre ordonnance de soins personnalisée en 60 secondes.'}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] font-mono text-teal-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{language === 'AR' ? 'توصيات دقيقة ومخصصة' : 'Recommandations Ultra-Ciblées'}</span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md flex flex-col justify-between space-y-6 group hover:border-cyan-500/40 hover:shadow-xl transition duration-500">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition duration-300">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 font-heading tracking-tight">
                    {language === 'AR' ? '3. أصالة وموثوقية مضاعفة' : '3. Traçabilité & Authenticité Certifiée'}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {language === 'AR'
                      ? 'جميع المستحضرات يتم استيرادها مباشرة من الموزعين الرسميين المعتمدين مع مراقبة صارمة لتواريخ الصلاحية وأرقام الشحنات.'
                      : 'Chaque référence est directement sourcée auprès des filiales laboratoires officielles (La Roche-Posay, CeraVe, Vichy, Bioderma, Avene, SVR). 0% contrefaçon garanti.'}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] font-mono text-cyan-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>{language === 'AR' ? 'موزع رسمي معتمد بالمغرب' : 'Distributeur Agréé Maroc'}</span>
                </div>
              </div>
            </div>
          </section>


          {/* ──────────────── 3. CORE VALUES GRID ──────────────── */}
          <section className="space-y-12">
            <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase">
                  {language === 'AR' ? 'مبادؤنا الأخلاقية' : 'CHARTE DE CONFIANCE'}
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-heading tracking-tight mt-1">
                  {language === 'AR' ? 'قيمنا الأساسية الاربع' : 'Nos 4 Engagements Majeurs'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-sm">
                {language === 'AR'
                  ? 'التزامنا اليومي نحو كل عميلة تبحث عن الجودة والسلامة والنتائج الحقيقية.'
                  : 'Notre charte éthique appliquée à chaque étape de votre parcours d\'achat.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  titleFr: '1. Ingrédients Validés',
                  titleAr: '1. مكونات معتمدة طبياً',
                  descFr: 'Formules testées dermatologiquement sans composants controversés.',
                  descAr: 'تركيبات مجربة سريرياً ومناسبة حتى للبشرة الأكثر حساسية.',
                  icon: Stethoscope,
                  gradient: 'bg-emerald-50/50 border-emerald-100',
                  border: 'hover:border-emerald-400'
                },
                {
                  titleFr: '2. Expédition Sécurisée',
                  titleAr: '2. شحن آمن وسريع',
                  descFr: 'Emballage anti-chocs hermétique scellé avec paiement à la livraison.',
                  descAr: 'تغليف محكم ضد الصدمات مع إمكانية الدفع عند الاستلام.',
                  icon: Lock,
                  gradient: 'bg-teal-50/50 border-teal-100',
                  border: 'hover:border-teal-400'
                },
                {
                  titleFr: '3. Conciergerie WhatsApp',
                  titleAr: '3. استشارة واتساب خاصة',
                  descFr: 'Support dermo-conseil disponible 6j/7 pour vous orienter.',
                  descAr: 'فريق مستشارات التجميل متواجد طيلة الأسبوع لإجابة استفساراتكِ.',
                  icon: MessageSquareCheck,
                  gradient: 'bg-cyan-50/50 border-cyan-100',
                  border: 'hover:border-cyan-400'
                },
                {
                  titleFr: '4. Transparence & Équité',
                  titleAr: '4. شفافية وأسعار عادلة',
                  descFr: 'Prix justes, remises fidélité cumulables et cadeaux officinaux.',
                  descAr: 'أسعار مناسبة، نقاط مكافآت هدايا عينات مع كل طلبية.',
                  icon: HeartHandshake,
                  gradient: 'bg-amber-50/50 border-amber-100',
                  border: 'hover:border-amber-400'
                }
              ].map((val, idx) => {
                const ValIcon = val.icon;
                return (
                  <div
                    key={idx}
                    className={`p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition duration-300 ${val.border} space-y-4 text-left`}
                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-emerald-600">
                      <ValIcon className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 font-heading">
                      {language === 'AR' ? val.titleAr : val.titleFr}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {language === 'AR' ? val.descAr : val.descFr}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>


          {/* ──────────────── 4. INFRASTRUCTURE & NATIONAL COVERAGE ──────────────── */}
          <section className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-xl relative overflow-hidden space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'AR' ? 'التغطية الوطنية الشاملة' : 'PRESENCE DANS 12 REGIONS'}</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-slate-900 font-heading tracking-tight leading-tight">
                  {language === 'AR'
                    ? 'من الدار البيضاء إلى العيون: خدماتنا تصل حتى باب بيتكِ'
                    : 'Une Infrastructure Logistique Sécurisée dans Tout le Maroc'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {language === 'AR'
                    ? 'نعتمد شباك توزيع سريع محكم التغليف ومغطى ضد الصدمات للوصول إلى كبريات المدن (الرباط، فاس، طنجة، مراكش، أكادير، وجدة) والقرى النائية بنفس معايير السرعة والأمان.'
                    : 'Notre réseau logistique dessert les 12 régions du Maroc avec des emballages isothermes certifiés. De Casablanca à Laâyoune, vos soins arrivent scellés et intacts sous 24 à 48 heures.'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                  {[
                    { labelFr: 'Casablanca & Rabat', labelAr: 'الدار البيضاء والرباط' },
                    { labelFr: 'Marrakech & Agadir', labelAr: 'مراكش وأكادير' },
                    { labelFr: 'Tanger & Tétouan', labelAr: 'طنجة وتطوان' },
                    { labelFr: 'Fès & Meknès', labelAr: 'فاس ومكناس' },
                    { labelFr: 'Oujda & Nador', labelAr: 'وجدة والناظور' },
                    { labelFr: 'Provinces du Sud', labelAr: 'الأقاليم الجنوبية' }
                  ].map((city, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>{language === 'AR' ? city.labelAr : city.labelFr}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 shadow-inner">
                <h4 className="text-sm font-bold text-slate-900 font-heading border-b border-slate-200 pb-3 flex items-center gap-2">
                  <Building2 className="w-4.5 h-4.5 text-emerald-600" />
                  <span>{language === 'AR' ? 'معلومات المقر الرئيسي' : 'Siège Social & Infoline'}</span>
                </h4>
                <div className="space-y-3.5 text-xs text-slate-700 font-normal">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">PARA OFFICINAL S.A</p>
                      <p className="text-slate-500 text-[11px]">Bd Al Massira Al Khadra, Maarif, Casablanca 20330, Maroc</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                    <p className="text-[11px] text-slate-600 font-medium">Du Lundi au Samedi: 09h00 – 18h00 (GMT+1)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageSquareCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <p className="text-[11px] font-mono text-emerald-700 font-bold">Support WhatsApp: +212 6 60 80 80 80</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </ShopShell>
  );
}
