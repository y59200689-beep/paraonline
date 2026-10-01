'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShopShell } from '@/components/ShopShell';
import { useTranslation } from '@/context/LanguageContext';
import { useUi } from '@/context/UiContext';
import styles from './AboutCommitments.module.css';
import {
  ShieldCheck,
  Sparkles,
  Truck,
  PackageSearch,
  Headset,
  Banknote,
  HeartHandshake,
  ArrowRight,
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full w-full h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08)_0%,rgba(14,165,233,0.03)_45%,transparent_70%)] pointer-events-none z-0" />

        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-20 space-y-16 lg:space-y-28">

          {/* ──────────────── 1. HERO SECTION ──────────────── */}
          <section className="relative left-1/2 w-screen -translate-x-1/2 text-center">
            <div className="relative flex min-h-[520px] flex-col items-center justify-end overflow-hidden px-5 pb-24 pt-48 sm:min-h-[580px] sm:pb-28 lg:min-h-[640px]">
              <Image
                src="/images/about-para-divine-storefront.jpg"
                alt="Façade de la parapharmacie Para Divine"
                fill
                priority
                sizes="100vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-slate-950/10 to-slate-950/80" aria-hidden="true" />
              <div className="relative z-10 flex flex-col items-center gap-5">
            {/* Micro Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/90 px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest text-teal-900 shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-teal-700" />
              <span>
                {language === 'AR' ? 'العناية والجمال' : 'Parapharmacie et soins beauté'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="mx-auto max-w-4xl font-heading text-4xl font-black leading-[1.1] tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
              {language === 'AR' ? (
                <>
                  نُعيد تعريف <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">العناية بالبشرة</span> في المغرب بدقة علمية وأمان تام
                </>
              ) : (
                <>Qui Somme Nous?</>
              )}
            </h1>

            {/* Narrative Spine Subtitle */}
            <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-white/95 sm:text-base lg:text-lg">
              {language === 'AR'
                ? 'Para Divine هو متجركم للعناية بالبشرة والجمال في المغرب، مع اختيارات تناسب روتينكم اليومي.'
                : 'Para Divine est votre boutique de soins et de beauté au Maroc, avec une sélection pensée pour vos routines quotidiennes.'}
            </p>
              </div>
            </div>

            {/* Key Metrics Deck */}
            <div className="relative z-20 mx-auto -mt-14 grid w-full grid-cols-2 gap-4 px-4 sm:gap-5 sm:px-6 md:grid-cols-4 lg:-mt-16 lg:gap-6 lg:px-8">
              {[
                {
                  value: 'SÉLECTION',
                  labelFr: 'Marques disponibles',
                  labelAr: 'علامات متوفرة',
                  descFr: 'Pour vos routines',
                  descAr: 'لروتينكِ اليومي',
                  icon: PackageSearch,
                  color: 'text-emerald-600'
                },
                {
                  value: 'A\u202FDOMICILE',
                  labelFr: 'Livraison a Domicile',
                  labelAr: 'توصيل في المغرب',
                  descFr: 'Selon la zone de livraison',
                  descAr: 'حسب منطقة التوصيل',
                  icon: Truck,
                  color: 'text-teal-600'
                },
                {
                  value: 'SUPPORT',
                  labelFr: 'Équipe disponible',
                  labelAr: 'فريق متاح',
                  descFr: 'Pour vous accompagner',
                  descAr: 'لمرافقتكِ',
                  icon: Headset,
                  color: 'text-cyan-600'
                },
                {
                  value: 'COD',
                  labelFr: 'Paiement à la livraison',
                  labelAr: 'الدفع عند التسليم',
                  descFr: 'Selon les options proposées',
                  descAr: 'حسب الخيارات المتاحة',
                  icon: Banknote,
                  color: 'text-amber-600'
                }
              ].map((stat, idx) => {
                const StatIcon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="group relative min-h-36 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_16px_40px_rgba(16,41,45,0.14)] transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5"
                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                  >
                    <div className="flex items-center justify-between mb-3" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                      <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${stat.color}`}>
                        {stat.value}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-110 transition duration-300">
                        <StatIcon className={`w-5 h-5 ${stat.color}`} strokeWidth={1.8} aria-hidden="true" />
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


          {/* ──────────────── 2. OUR THREE COMMITMENTS ──────────────── */}
          <section className={styles.section} aria-labelledby="commitments-title">
            <div className={styles.heading}>
              <h2 id="commitments-title" className={styles.title}>
                {language === 'AR' ? 'التزاماتنا الثلاثة الأساسية' : <>Nos 3 <span>Engagements</span> Majeurs</>}
              </h2>
              <p className={styles.intro}>
                {language === 'AR'
                  ? 'ثلاثة التزامات توجه اختيارنا لمنتجاتكم ومرافقتكم في كل خطوة.'
                  : 'Trois engagements qui guident notre sélection et notre accompagnement au quotidien.'}
              </p>
              <span className={styles.headingRule} aria-hidden="true" />
            </div>

            <div className={styles.grid}>
              {[
                {
                  number: '01',
                  titleFr: 'Une large sélection de produits',
                  titleAr: 'مجموعة واسعة من المنتجات',
                  descriptionFr: 'Découvrez une gamme variée de produits de parapharmacie soigneusement sélectionnés pour répondre à vos besoins en santé, beauté, hygiène et bien-être.',
                  descriptionAr: 'اكتشفوا مجموعة متنوعة من منتجات البارافارماسي المختارة بعناية لتلبية احتياجاتكم في الصحة والجمال والنظافة والرفاهية.',
                  icon: ShieldCheck,
                  image: '/images/diagnostic/dermo-research-still-life.png',
                  imageAlt: 'Sérum et soins de parapharmacie',
                  actionFr: 'Découvrir les produits',
                  actionAr: 'اكتشفوا المنتجات',
                  href: '/products',
                },
                {
                  number: '02',
                  titleFr: 'Un diagnostic de peau en ligne',
                  titleAr: 'تشخيص البشرة عبر الإنترنت',
                  descriptionFr: 'Bénéficiez d’un diagnostic personnalisé de votre peau directement en ligne afin de mieux identifier vos besoins et vous orienter vers une routine adaptée.',
                  descriptionAr: 'استفيدوا من تشخيص مخصص لبشرتكم عبر الإنترنت لتحديد احتياجاتكم بشكل أفضل وإرشادكم إلى روتين مناسب.',
                  icon: Sparkles,
                  image: '/images/skin_diagnostic_scan.webp',
                  imageAlt: 'Analyse personnalisée de la peau',
                  actionFr: 'Faire mon diagnostic',
                  actionAr: 'ابدأوا التشخيص',
                  href: null,
                },
                {
                  number: '03',
                  titleFr: 'Un service de qualité, avant et après votre achat',
                  titleAr: 'خدمة مميزة قبل الشراء وبعده',
                  descriptionFr: 'Notre équipe vous accompagne à chaque étape, de la prise de conseil et de commande jusqu’au suivi après-vente, pour vous garantir une expérience simple, fiable et satisfaisante.',
                  descriptionAr: 'يرافقكم فريقنا في كل مرحلة، من الاستشارة وتقديم الطلب إلى المتابعة بعد البيع، لنضمن لكم تجربة سهلة وموثوقة ومُرضية.',
                  icon: HeartHandshake,
                  image: '/images/about-para-divine-storefront.jpg',
                  imageAlt: 'Parapharmacie Para Divine',
                  actionFr: 'Nous contacter',
                  actionAr: 'اتصلوا بنا',
                  href: '/contact',
                },
              ].map((benefit, index) => {
                const Icon = benefit.icon;
                const actionLabel = language === 'AR' ? benefit.actionAr : benefit.actionFr;
                return (
                  <article key={benefit.number} className={`${styles.commitment} ${styles[`commitment${index + 1}`]}`}>
                    <div className={styles.portraitWrap}>
                      <div className={styles.portrait}>
                        <Image src={benefit.image} alt={benefit.imageAlt} fill sizes="(max-width: 640px) 180px, 220px" className={styles.portraitImage} />
                      </div>
                      <span className={styles.iconBadge} aria-hidden="true"><Icon size={30} strokeWidth={1.7} /></span>
                      <span className={styles.numberBadge} aria-hidden="true">{benefit.number}</span>
                    </div>
                    <h3 className={styles.cardTitle}>
                      {language === 'AR' ? benefit.titleAr : benefit.titleFr}
                    </h3>
                    <p className={styles.cardDescription}>
                      {language === 'AR' ? benefit.descriptionAr : benefit.descriptionFr}
                    </p>
                    {benefit.href ? (
                      <Link className={styles.action} href={benefit.href} aria-label={actionLabel} title={actionLabel}>
                        <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
                      </Link>
                    ) : (
                      <button className={styles.action} type="button" onClick={() => setDiagnosticOpen(true)} aria-label={actionLabel} title={actionLabel}>
                        <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </section>


        </div>
      </div>
    </ShopShell>
  );
}
