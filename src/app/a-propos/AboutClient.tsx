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
            <p className="mx-auto max-w-5xl text-lg font-medium leading-relaxed text-white drop-shadow-md sm:text-xl lg:text-[30px] lg:leading-[1.45]">
              {language === 'AR'
                ? 'أنشأنا صيدليتنا الإلكترونية بفكرة بسيطة: أن نجعل العناية بأنفسكم سهلة، مع منتجات عالية الجودة ونصائح من مختصين.'
                : 'Nous avons créé notre parapharmacie en ligne avec une idée simple : vous permettre de prendre soin de vous facilement, avec des produits de qualité et des conseils de professionnels.'}
            </p>
              </div>
            </div>

          </section>

          <section className="mx-auto w-full max-w-[1500px]" aria-labelledby="about-story-title">
            <div className="grid overflow-hidden rounded-[2rem] border border-teal-900/10 bg-white shadow-[0_24px_70px_rgba(20,55,61,0.08)] lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.5fr)]">
              <div className="relative flex flex-col justify-between overflow-hidden bg-[#EAF5F3] p-8 sm:p-10 lg:p-14">
                <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full border-[28px] border-white/50" aria-hidden="true" />
                <div className="relative">
                  <span className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
                    {language === 'AR' ? 'من نحن' : 'Notre approche'}
                  </span>
                  <h2 id="about-story-title" className="mt-5 max-w-sm font-heading text-3xl font-black leading-tight tracking-tight text-[#17343C] sm:text-4xl lg:text-5xl">
                    {language === 'AR' ? 'اعتنوا بأنفسكم، ونحن نهتم باحتياجاتكم' : <>PRENEZ SOIN DE VOUS, <span className="text-[#3B99A3]">NOUS PRENONS SOIN DE VOS BESOINS</span></>}
                  </h2>
                </div>
                <div className="relative mt-10 h-1 w-20 rounded-full bg-gradient-to-r from-[#3B99A3] to-[#DB8292]" aria-hidden="true" />
              </div>
              <div className="space-y-7 p-8 text-[15px] leading-[1.85] text-slate-600 sm:p-10 sm:text-base lg:p-14">
                {language === 'AR' ? (
                  <>
                    <p>تأسست صيدليتنا الإلكترونية على يد فريق من الصيادلة والمستشارين المدربين في مستحضرات العناية بالبشرة. نضع خبرتنا بين أيديكم لمساعدتكم على اختيار المنتجات التي تناسب احتياجاتكم حقًا.</p>
                    <p>نطمح إلى تقديم تجربة تتجاوز بيع المنتجات، تقوم على النصيحة والمرافقة. فريقنا يصغي إليكم، ويساعدكم على فهم احتياجاتكم واختيار المنتجات وروتين العناية الأنسب لكم.</p>
                    <p>نولي جودة المنتجات وموثوقية النصائح ورضا عملائنا اهتمامًا خاصًا، لتكون تجربتكم بسيطة ومطمئنة وممتعة.</p>
                    <p>ستجدون في موقعنا منتجات للجمال والنظافة والعناية بالوجه والجسم والشعر والحماية من الشمس والرفاهية والأمومة والعناية بالطفل، إلى جانب أساسيات يومية أخرى.</p>
                  </>
                ) : (
                  <>
                    <p>Notre parapharmacie est créée par une équipe de <strong className="font-semibold text-[#17343C]">pharmaciens et de conseillers formés en dermo-cosmétique.</strong> Nous mettons notre expertise à votre disposition pour vous accompagner dans vos choix et vous aider à trouver les produits qui correspondent réellement à vos besoins.</p>
                    <p className="border-l-2 border-[#DB8292] pl-5">Au-delà de la vente de produits, nous souhaitons vous offrir une véritable expérience de conseil et d’accompagnement. Notre équipe est à votre écoute pour vous aider à mieux comprendre vos besoins, vous orienter vers les produits les plus adaptés et vous accompagner dans le choix de votre routine.</p>
                    <p>Nous accordons une attention particulière à la qualité des produits, la fiabilité des conseils et la satisfaction de nos clients, afin de créer une expérience simple, rassurante et agréable.</p>
                    <p>Vous trouverez sur notre site une sélection de produits dédiés à la beauté, l’hygiène, les soins du visage et du corps, les cheveux, la protection solaire, le bien-être, la maternité et les soins de bébé, ainsi que de nombreux autres essentiels du quotidien.</p>
                  </>
                )}
              </div>
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
                  image: '/images/about-diagnostic-face-scan.webp',
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
                  actionFr: 'Nous contacter',
                  actionAr: 'اتصلوا بنا',
                  href: '/contact',
                },
              ].map((benefit, index) => {
                const Icon = benefit.icon;
                const actionLabel = language === 'AR' ? benefit.actionAr : benefit.actionFr;
                return (
                  <article key={benefit.number} className={`${styles.commitment} ${styles[`commitment${index + 1}`]}`}>
                    <div className={styles.coverImageWrap} aria-hidden="true">
                      <Image src={benefit.image} alt="" fill sizes="(max-width: 640px) 390px, (max-width: 1000px) 480px, 480px" className={styles.coverImage} />
                    </div>
                    <span className={styles.iconBadge} aria-hidden="true"><Icon size={30} strokeWidth={1.7} /></span>
                    <span className={styles.numberBadge} aria-hidden="true">{benefit.number}</span>
                    <div className={styles.coverSpacer} aria-hidden="true" />
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
