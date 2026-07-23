'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShopShell } from '@/components/ShopShell';
import { useTranslation } from '@/context/LanguageContext';
import { useUi } from '@/context/UiContext';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
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
  Star,
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
        className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden font-sans"
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        {/* Ambient Glowing Background Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12)_0%,rgba(14,165,233,0.05)_45%,transparent_70%)] pointer-events-none z-0" />
        <div className="absolute top-[800px] left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[1400px] right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-20 lg:space-y-32">

          {/* ──────────────── 1. HERO SECTION ──────────────── */}
          <section className="text-center space-y-8 pt-4">
            {/* Micro Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>
                {language === 'AR' ? 'المؤسسة الطبية للتجميل بالمرطب' : 'Maison de Parapharmacie Clinique & Officinale'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
              {language === 'AR' ? (
                <>
                  نُعيد تعريف <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">العناية بالبشرة</span> في المغرب بدقة علمية وأمان تام
                </>
              ) : (
                <>
                  Redéfinir la <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Dermo-Cosmétique</span> au Maroc avec Vigueur Scientifique
                </>
              )}
            </h1>

            {/* Narrative Spine Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
              {language === 'AR'
                ? 'فارما أوفيسينال ص.م هي المنصة الرائدة في المغرب في مجال الصيدلة البديلة والجمال السريري. نجمع بين الخبرة الصيدلانية الأوروبية ومفهوم التشخيص الذكي بالذكاء الاصطناعي لضمان أفضل نتائج لجميع أنواع البشرة.'
                : 'Pionnier de la parapharmacie officinale connectée au Maroc. Nous fusionnons la rigueur pharmacologique européenne avec l\'innovation technologique et l\'accessibilité logistique sur l\'ensemble du territoire national.'}
            </p>

            {/* Key Metrics Deck */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 max-w-5xl mx-auto">
              {[
                {
                  value: '100%',
                  labelFr: 'Produits Authentiques',
                  labelAr: 'منتجات أصلية 100%',
                  descFr: 'Directement des laboratoires',
                  descAr: 'مباشرة من المختبرات',
                  icon: ShieldCheck,
                  color: 'text-emerald-400'
                },
                {
                  value: '50 000+',
                  labelFr: 'Peaux Accompagnées',
                  labelAr: 'أكثر من 50,000 عميلة',
                  descFr: 'Dans tout le Royaume',
                  descAr: 'في جميع أنحاء المغرب',
                  icon: Users,
                  color: 'text-teal-400'
                },
                {
                  value: '24/48h',
                  labelFr: 'Livraison Express COD',
                  labelAr: 'توصيل سريع وسري',
                  descFr: 'Dans les 12 régions',
                  descAr: 'في 12 جهة بالمغرب',
                  icon: Truck,
                  color: 'text-cyan-400'
                },
                {
                  value: '90+',
                  labelFr: 'Marques Prestataires',
                  labelAr: 'ماركة عالمية معتمدة',
                  descFr: 'Curation dermatologique',
                  descAr: 'اختبارات سريرية مؤكدة',
                  icon: Award,
                  color: 'text-amber-400'
                }
              ].map((stat, idx) => {
                const StatIcon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl hover:border-slate-700 transition duration-300 text-left relative overflow-hidden group"
                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                  >
                    <div className="flex items-center justify-between mb-3" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                      <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${stat.color}`}>
                        {stat.value}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-300 group-hover:scale-110 transition duration-300">
                        <StatIcon className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-xs font-bold text-white font-heading">
                      {language === 'AR' ? stat.labelAr : stat.labelFr}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
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
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {language === 'AR' ? 'فلسفتنا والتزامنا' : 'NOTRE RENAISSANCE & ENGAGEMENT'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-tight">
                {language === 'AR' ? 'لماذا تختار فارما أوفيسينال؟' : 'Pourquoi Choisir Para Officinal S.A ?'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                {language === 'AR'
                  ? 'ثلاثة ركائز أساسية تجعلنا الخيار الأول والآمن لكل من يبحث عن صحة ونضارة بشرته.'
                  : 'Trois piliers fondamentaux qui font de notre maison le partenaire dermo-cosmétique le plus fiable au Maroc.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar 1 */}
              <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between space-y-6 group hover:border-emerald-500/40 transition duration-500 shadow-2xl">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition duration-300">
                    <Microscope className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-white font-heading tracking-tight">
                    {language === 'AR' ? '1. حفظ وتخزين طبي صارم' : '1. Chaîne du Froid & Stockage Officinal'}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {language === 'AR'
                      ? 'نوفر مستودعات معقمة ومراقبة حرارياً بين 15°C و 25°C للحفاظ على كفاءة المواد الفعالة الحساسة مثل الريتينول وفيتامين C وحمض الهيالورونيك.'
                      : 'Nos entrepôts sont thermo-régulés entre 15°C et 25°C. Nous préservons l\'intégrité moléculaire des principes actifs sensibles (Vitamine C, Rétinol, Céramides) contre les variations de chaleur.'}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[11px] font-mono text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'AR' ? 'معايير النظافة الصيدلانية' : 'Protocoles d\'Hygiène Stérile'}</span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between space-y-6 group hover:border-teal-500/40 transition duration-500 shadow-2xl">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition duration-300">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-white font-heading tracking-tight">
                    {language === 'AR' ? '2. تشخيص البشرة بالذكاء الاصطناعي' : '2. Diagnostic de Peau Clinique par IA'}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {language === 'AR'
                      ? 'مطور بالتعاون مع خبراء الجلدية. تحليل فوري لنوع البشرة والمشاكل (حب الشباب، التصبغات، الجفاف) لتقديم روتين شخصي بدقة متناهية.'
                      : 'Développé en synergie avec des praticiens dermatologues. Notre algorithme exclusif analyse votre profil cutané et génère votre ordonnance de soins personnalisée en 60 secondes.'}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[11px] font-mono text-teal-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{language === 'AR' ? 'توصيات دقيقة ومخصصة' : 'Recommandations Ultra-Ciblées'}</span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between space-y-6 group hover:border-cyan-500/40 transition duration-500 shadow-2xl">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition duration-300">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-white font-heading tracking-tight">
                    {language === 'AR' ? '3. أصالة وموثوقية مضاعفة' : '3. Traçabilité & Authenticité Certifiée'}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {language === 'AR'
                      ? 'جميع المستحضرات يتم استيرادها مباشرة من الموزعين الرسميين المعتمدين مع مراقبة صارمة لتواريخ الصلاحية وأرقام الشحنات.'
                      : 'Chaque référence est directement sourcée auprès des filiales laboratoires officielles (La Roche-Posay, CeraVe, Vichy, Bioderma, Avene, SVR). 0% contrefaçon garanti.'}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[11px] font-mono text-cyan-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{language === 'AR' ? 'موزع رسمي معتمد بالمغرب' : 'Distributeur Agréé Maroc'}</span>
                </div>
              </div>
            </div>
          </section>


          {/* ──────────────── 3. CORE VALUES GRID ──────────────── */}
          <section className="space-y-12">
            <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                  {language === 'AR' ? 'مبادؤنا الأخلاقية' : 'CHARTE DE CONFIANCE'}
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-tight mt-1">
                  {language === 'AR' ? 'قيمنا الأساسية الاربع' : 'Nos 4 Engagement Majeurs'}
                </h2>
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
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
                  gradient: 'from-emerald-500/20 to-teal-500/5',
                  border: 'hover:border-emerald-500/40'
                },
                {
                  titleFr: '2. Expédition Sécurisée',
                  titleAr: '2. شحن آمن وسريع',
                  descFr: 'Emballage anti-chocs hermétique scellé avec paiement à la livraison.',
                  descAr: 'تغليف محكم ضد الصدمات مع إمكانية الدفع عند الاستلام.',
                  icon: Lock,
                  gradient: 'from-teal-500/20 to-cyan-500/5',
                  border: 'hover:border-teal-500/40'
                },
                {
                  titleFr: '3. Conciergerie WhatsApp',
                  titleAr: '3. استشارة واتساب خاصة',
                  descFr: 'Support dermo-conseil disponible 6j/7 pour vous orienter.',
                  descAr: 'فريق مستشارات التجميل متواجد طيلة الأسبوع لإجابة استفساراتكِ.',
                  icon: MessageSquareCheck,
                  gradient: 'from-cyan-500/20 to-blue-500/5',
                  border: 'hover:border-cyan-500/40'
                },
                {
                  titleFr: '4. Transparence & Équité',
                  titleAr: '4. شفافية وأسعار عادلة',
                  descFr: 'Prix justes, remises fidélité cumulables et cadeaux officinaux.',
                  descAr: 'أسعار مناسبة، نقاط مكافآت هدايا عينات مع كل طلبية.',
                  icon: HeartHandshake,
                  gradient: 'from-amber-500/20 to-emerald-500/5',
                  border: 'hover:border-amber-500/40'
                }
              ].map((val, idx) => {
                const ValIcon = val.icon;
                return (
                  <div
                    key={idx}
                    className={`p-6 rounded-2xl bg-gradient-to-b ${val.gradient} bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl transition duration-300 ${val.border} space-y-4 text-left`}
                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400">
                      <ValIcon className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white font-heading">
                      {language === 'AR' ? val.titleAr : val.titleFr}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">
                      {language === 'AR' ? val.descAr : val.descFr}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>


          {/* ──────────────── 4. CLINICAL COMMITTEE & EXPERTS ──────────────── */}
          <section className="space-y-12">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {language === 'AR' ? 'الفريق الطبي والإداري' : 'EXPERTISES ET DIRECTION'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-tight">
                {language === 'AR' ? 'فريق الخبرة الصيدلانية' : 'Notre Comité Scientifique & Direction'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                {language === 'AR'
                  ? 'نخبة من الدكاترة والمتخصصين يقودون تطوير الخدمات لضمان أرقى المعايير الصحية.'
                  : 'Des professionnels de santé et dermo-conseillers chevronnés au service de votre bien-être.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Dr. Soukaina Amrani',
                  roleFr: 'Docteure en Pharmacie & Directrice Scientifique',
                  roleAr: 'دكتورة في الصيدلة ومديرة الإشراف العلمي',
                  bioFr: 'Spécialiste en dermo-pharmacie et formulation clinique. Elle supervise la sélection rigoureuse de chaque ingrédient et produit du catalogue.',
                  bioAr: 'متخصصة في التركيبات الجلدية والعلوم الصيدلانية. تشرف على اختيار واختبار كل مستحضر في كتالوج المنتجات.',
                  avatarBg: 'from-emerald-500 to-teal-700',
                  initials: 'SA'
                },
                {
                  name: 'Dr. Youssef Mahir',
                  roleFr: 'Fondateur & Chief Executive Officer',
                  roleAr: 'المؤسس والرئيس التنفيذي',
                  bioFr: 'Pionnier de la santé digitale au Maroc. Il dirige le développement des technologies de dermo-diagnostic IA et l\'expansion nationale.',
                  bioAr: 'رائد التكنولوجيا الصحية بالمغرب. يقود تطوير برمجيات التشخيص الذكي والتوسع في أنحاء المملكة.',
                  avatarBg: 'from-teal-500 to-cyan-700',
                  initials: 'YM'
                },
                {
                  name: 'Sara Mansouri',
                  roleFr: 'Responsable Conciergerie Client & Qualité',
                  roleAr: 'مسؤولة الجودة ورعاية العملاء',
                  bioFr: 'Experte en conseil dermo-cosmétique. Elle encadre l\'équipe de support pour garantir une réponse personnalisée sous 10 minutes.',
                  bioAr: 'خبيرة في العناية الشخصية بالبشرة. تقود فريق خدمة العملاء لتقديم إرشادات فورية بدقة وحرص.',
                  avatarBg: 'from-cyan-500 to-blue-700',
                  initials: 'SM'
                }
              ].map((member, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4 hover:border-slate-700 transition duration-300 text-left relative overflow-hidden group shadow-xl"
                  style={{ textAlign: isRTL ? 'right' : 'left' }}
                >
                  <div className="flex items-center gap-4" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.avatarBg} text-slate-950 font-black text-lg flex items-center justify-center shrink-0 shadow-lg`}>
                      {member.initials}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white font-heading">
                        {member.name}
                      </h4>
                      <p className="text-[11px] font-mono font-semibold text-emerald-400 mt-0.5">
                        {language === 'AR' ? member.roleAr : member.roleFr}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal pt-2 border-t border-slate-800/60">
                    {language === 'AR' ? member.bioAr : member.bioFr}
                  </p>
                </div>
              ))}
            </div>
          </section>


          {/* ──────────────── 5. INFRASTRUCTURE & NATIONAL COVERAGE ──────────────── */}
          <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800 backdrop-blur-2xl relative overflow-hidden space-y-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{language === 'AR' ? 'التغطية الوطنية الشاملة' : 'PRESENCE DANS 12 REGIONS'}</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-tight leading-tight">
                  {language === 'AR'
                    ? 'من الدار البيضاء إلى العيون: خدماتنا تصل حتى باب بيتكِ'
                    : 'Une Infrastructure Logistique Sécurisée dans Tout le Maroc'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {language === 'AR'
                    ? 'نعتمد شباك توزيع سريح محكم التغليف ومغطى ضد الصدمات للوصول إلى كبريات المدن (الرباط، فاس، طنجة، مراكش، أكادير، وجدة) والقرى النائية بنفس معايير السرعة والأمان.'
                    : 'Notre réseau logistique dessert les 12 régions du Maroc avec desemballages isothermes certifiés. De Casablanca à Laâyoune, vos soins arrivent scellés et intacts sous 24 à 48 heures.'}
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
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>{language === 'AR' ? city.labelAr : city.labelFr}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-inner">
                <h4 className="text-sm font-bold text-white font-heading border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'AR' ? 'معلومات المقر الرئيسي' : 'Siège Social & Infoline'}</span>
                </h4>
                <div className="space-y-3 text-xs text-slate-300 font-normal">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">PARA OFFICINAL S.A</p>
                      <p className="text-slate-400 text-[11px]">Bd Al Massira Al Khadra, Maarif, Casablanca 20330, Maroc</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <p className="text-[11px]">Du Lundi au Samedi: 09h00 – 18h00 (GMT+1)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageSquareCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <p className="text-[11px] font-mono text-emerald-400 font-bold">Support WhatsApp: +212 6 60 80 80 80</p>
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* ──────────────── 6. CTA BANNER ──────────────── */}
          <section className="text-center bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 rounded-3xl p-8 sm:p-14 relative overflow-hidden space-y-6 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)] pointer-events-none" />

            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'AR' ? 'بدء تجربة العناية الشخصية' : 'EXPÉRIENCE DERMO-PERSONNALISÉE'}</span>
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-tight max-w-2xl mx-auto leading-tight">
              {language === 'AR'
                ? 'هل أنتِ جاهزة لاكتشاف الروتين المثالي لبشرتكِ؟'
                : 'Prête à Révéler la Santé Éclatante de Votre Peau ?'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              {language === 'AR'
                ? 'ابدئي التشخيص المجاني الآن أو تصفحي قائمة منتجاتنا المعتمدة من أكبر المختبرات العالمية.'
                : 'Bénéficiez immédiatement de notre Dermo-Diagnostic par IA ou découvrez nos rituels cliniques en boutique.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setDiagnosticOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>{language === 'AR' ? 'تشخيص البشرة المجاني' : 'Démarrer le Dermo-Diagnostic IA'}</span>
              </button>

              <Link
                href="/products"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-500 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{language === 'AR' ? 'تصفح جميع المنتجات' : 'Explorer la Boutique'}</span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </section>

        </div>
      </div>
    </ShopShell>
  );
}
