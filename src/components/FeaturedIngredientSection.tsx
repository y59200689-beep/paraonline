'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/context/LanguageContext';
import { ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { ProductCard } from './ProductCard';

/* ─── Brand config ──────────────────────────────────────────────── */
const BRANDS = [
  {
    id: 'cerave',
    nameFr: 'CeraVe',
    nameAr: 'سيرافي',
    subtitleFr: 'Dermo-Cosmétique',
    subtitleAr: 'ديرمو-تجميلية',
    descFr:
      'Développé avec des dermatologues, CeraVe propose des formules enrichies aux 3 céramides essentiels et acide hyaluronique pour restaurer la barrière protectrice de la peau.',
    descAr:
      'تم تطويره مع أطباء الجلد، يحتوي على 3 سيراميدات أساسية وحمض الهيالورونيك لاستعادة وحماية حاجز البشرة الواقي.',
    image: '/images/cerave_brand_showcase.png',
    href: '/brand/cerave',
    glowClass: 'from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-600 dark:text-blue-400',
    badgeBorder: 'border-blue-500/15',
    badgeIcon: 'text-blue-500',
    subtitleColor: 'text-cyan-400',
    gradientText: 'bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent',
    vendorQuery: 'CeraVe',
    filterFn: (p: any) => {
      const v = (p.vendor || '').toLowerCase();
      const t = (p.title || p.nameFr || '').toLowerCase();
      return v === 'cerave' || t.includes('cerave');
    },
  },
  {
    id: 'laroche',
    nameFr: 'La Roche-Posay',
    nameAr: 'لا روش بوزاي',
    subtitleFr: 'Dermo-Cosmétique',
    subtitleAr: 'ديرمو-تجميلية',
    descFr:
      "Développée avec des dermatologues, La Roche-Posay propose des formules innovantes avec l'Eau Thermale pour les peaux les plus sensibles.",
    descAr:
      'طورت بالشراكة مع أطباء الجلد، توفر La Roche-Posay حلولاً مبتكرة لأكثر الحالات الجلدية حساسية بفضل مياه Eau Thermale الفريدة.',
    image: '/images/larochposay_brand_showcase.png',
    href: '/brand/la-roche-posay',
    glowClass: 'from-orange-500/5 to-rose-500/5 dark:from-orange-500/10 dark:to-rose-500/10',
    badgeBg: 'bg-orange-500/10',
    badgeText: 'text-orange-600 dark:text-orange-400',
    badgeBorder: 'border-orange-500/15',
    badgeIcon: 'text-orange-500',
    subtitleColor: 'text-orange-400',
    gradientText: 'bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent',
    vendorQuery: 'La+Roche-Posay',
    filterFn: (p: any) => {
      const v = (p.vendor || '').toLowerCase();
      const t = (p.title || p.nameFr || '').toLowerCase();
      return v.includes('la roche') || v.includes('laroche') || t.includes('la roche') || t.includes('laroche');
    },
  },
  {
    id: 'avene',
    nameFr: 'Avène',
    nameAr: 'أفين',
    subtitleFr: 'Eau Thermale',
    subtitleAr: 'الماء الحراري',
    descFr: "Formulée avec l'Eau Thermale d'Avène aux propriétés apaisantes et anti-irritantes uniques, la gamme Avène est spécialement conçue pour les peaux les plus sensibles et réactives.",
    descAr: 'تمتلك أفين قوة الماء الحراري ذو الخصائص المهدئة، وهي مخصصة للبشرة الأكثر حساسية وتفاعلاً مع العوامل الخارجية.',
    image: '/images/avene_brand_showcase.png',
    href: '/brand/avene',
    glowClass: 'from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-600 dark:text-rose-400',
    badgeBorder: 'border-rose-500/15',
    badgeIcon: 'text-rose-500',
    subtitleColor: 'text-rose-400',
    gradientText: 'bg-gradient-to-r from-rose-500 to-pink-400 bg-clip-text text-transparent',
    vendorQuery: 'Avene',
    filterFn: (p: any) => {
      const v = (p.vendor || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const t = (p.title || p.nameFr || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return v.includes('avene') || t.includes('avene');
    },
  },
  {
    id: 'vichy',
    nameFr: 'Vichy',
    nameAr: 'فيشي',
    subtitleFr: 'Eau Thermale Volcanique',
    subtitleAr: 'الماء الحراري البركاني',
    descFr: "Enrichi en 15 minéraux rares de l'Eau Thermale de Vichy, la gamme combine innovation dermatologique et haute performance pour traiter efficacement les signes du vieillissement et protéger la peau au quotidien.",
    descAr: 'مدعوم بـ 15 معدناً نادراً من مياه فيشي الحرارية، تجمع بين الابتكار الجلدي والأداء العالي لمعالجة علامات التقدم في السن.',
    image: '/images/vichy_brand_showcase.png',
    href: '/brand/vichy',
    glowClass: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    badgeBorder: 'border-emerald-500/15',
    badgeIcon: 'text-emerald-600',
    subtitleColor: 'text-emerald-400',
    gradientText: 'bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent',
    vendorQuery: 'Vichy',
    filterFn: (p: any) => {
      const v = (p.vendor || '').toLowerCase();
      const t = (p.title || p.nameFr || '').toLowerCase();
      return v.includes('vichy') || t.includes('vichy');
    },
  },
  {
    id: 'bioderma',
    nameFr: 'Bioderma',
    nameAr: 'بيوديرما',
    subtitleFr: 'Biologie Dermatologique',
    subtitleAr: 'علم الأحياء الجلدية',
    descFr: 'Pionnier de la biologie dermatologique, Bioderma développe des solutions qui respectent le biome cutané — de la célèbre eau micellaire Sensibio H2O aux gammes Sebium et Hydrabio, pour chaque type de peau.',
    descAr: 'رائد علم الأحياء الجلدية، يطور بيوديرما حلولاً تحترم ميكروبيوم الجلد — من ماء ميسلار Sensibio إلى مجموعات Sebium وHydrabio.',
    image: '/images/bioderma_brand_showcase.png',
    href: '/brand/bioderma',
    glowClass: 'from-pink-500/5 to-amber-500/5 dark:from-pink-500/10 dark:to-amber-500/10',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-700 dark:text-amber-400',
    badgeBorder: 'border-amber-500/15',
    badgeIcon: 'text-amber-600',
    subtitleColor: 'text-amber-400',
    gradientText: 'bg-gradient-to-r from-amber-600 to-pink-500 bg-clip-text text-transparent',
    vendorQuery: 'Bioderma',
    filterFn: (p: any) => {
      const v = (p.vendor || '').toLowerCase();
      const t = (p.title || p.nameFr || '').toLowerCase();
      return v.includes('bioderma') || t.includes('bioderma') || t.includes('sensibio') || t.includes('sebium') || t.includes('hydrabio');
    },
  },
  {
    id: 'eucerin',
    nameFr: 'Eucerin',
    nameAr: 'يوسيرين',
    subtitleFr: 'Soin Dermatologique Allemand',
    subtitleAr: 'عناية جلدية ألمانية',
    descFr: 'Fondé sur 130 ans d’expertise clinique allemande, Eucerin développe des formules médicalement éprouvées — Hyaluron-Filler, DermoPure et UreaRepair — pour traiter les problématiques cutanées les plus complexes.',
    descAr: 'بخبرة 130 عاماً في علم الجلد الألماني، تطور يوسيرين تركيبات مثبتة طبياً لمعالجة أصعب مشكلات البشرة.',
    image: '/images/eucerin_brand_showcase.png',
    href: '/brand/eucerin',
    glowClass: 'from-indigo-500/5 to-blue-600/5 dark:from-indigo-500/10 dark:to-blue-600/10',
    badgeBg: 'bg-indigo-500/10',
    badgeText: 'text-indigo-700 dark:text-indigo-400',
    badgeBorder: 'border-indigo-500/15',
    badgeIcon: 'text-indigo-600',
    subtitleColor: 'text-indigo-400',
    gradientText: 'bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent',
    vendorQuery: 'Eucerin',
    filterFn: (p: any) => {
      const v = (p.vendor || '').toLowerCase();
      const t = (p.title || p.nameFr || '').toLowerCase();
      return v.includes('eucerin') || t.includes('eucerin');
    },
  },
] as const;

/* ─── Single brand row ──────────────────────────────────────────── */
function BrandRow({ brand, isAR }: { brand: (typeof BRANDS)[number]; isAR: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [brandProducts, setBrandProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products?vendor=${brand.vendorQuery}&limit=100`)
      .then((r) => r.json())
      .then((data) => {
        setBrandProducts((data.products ?? []).filter(brand.filterFn));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [brand.vendorQuery]);

  const scroll = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 items-stretch">

      {/* Brand card */}
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200/50 dark:border-white/10 shadow-xl min-h-[460px] lg:min-h-full group">
        <Image
          src={brand.image}
          alt={isAR ? brand.nameAr : brand.nameFr}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent flex flex-col justify-end p-6 md:p-8">
          <div className="space-y-3">
            <span className={`inline-block text-[9.5px] font-black uppercase tracking-[0.2em] ${brand.subtitleColor}`}>
              {isAR ? brand.subtitleAr : brand.subtitleFr}
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-none">
              {isAR ? brand.nameAr : brand.nameFr}
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed font-medium max-w-xs">
              {isAR ? brand.descAr : brand.descFr}
            </p>
            <div className="pt-2">
              <a
                href={brand.href}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-slate-950 rounded-full text-xs font-bold shadow-md hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                {isAR ? 'اكتشف المجموعة' : 'Découvrir la gamme'}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Product carousel */}
      <div className="lg:col-span-2 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            {!loading && (
              isAR
                ? `${brand.nameAr} — ${brandProducts.length} منتج`
                : `${brand.nameFr} — ${brandProducts.length} produit${brandProducts.length !== 1 ? 's' : ''}`
            )}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all cursor-pointer outline-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all cursor-pointer outline-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 flex-1"
        >
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="snap-start shrink-0 w-[112px] sm:w-[270px] md:w-[290px] animate-pulse">
                <div className="bg-slate-100 dark:bg-slate-900/60 rounded-xl sm:rounded-2xl h-[180px] sm:h-[380px]" />
              </div>
            ))
          ) : brandProducts.length > 0 ? (
            brandProducts.map((product, idx) => (
              <div key={product.id} className="snap-start shrink-0 w-[112px] sm:w-[270px] md:w-[290px]">
                <ProductCard product={product} singleImage priority={idx < 3} compact />
              </div>
            ))
          ) : (
            <div className="w-full flex items-center justify-center py-20 text-slate-400 italic text-sm">
              {isAR ? 'لا توجد منتجات متوفرة' : 'Aucun produit disponible'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Section ───────────────────────────────────────────────────── */
export const FeaturedIngredientSection: React.FC = () => {
  const { language } = useTranslation();
  const isAR = language === 'AR';

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-white dark:bg-slate-950/10">
      {/* Soft ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/3 via-transparent to-orange-500/3 pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 relative z-10 space-y-8 md:space-y-10">

        {/* Section header */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/10">
            <Award className="w-3 h-3" />
            {isAR ? 'ماركات الأسبوع المميزة' : 'MARQUES VEDETTES DE LA SEMAINE'}
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
            {isAR ? 'تركيز على الماركات الرائدة في الأمراض الجلدية' : 'Spotlight Dermo-Clinique de la Semaine'}
          </h2>
        </div>

        {/* CeraVe */}
        <BrandRow brand={BRANDS[0]} isAR={isAR} />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-700 shrink-0">&amp;</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
        </div>

        {/* La Roche-Posay */}
        <BrandRow brand={BRANDS[1]} isAR={isAR} />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-700 shrink-0">&amp;</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
        </div>

        {/* Avène */}
        <BrandRow brand={BRANDS[2]} isAR={isAR} />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-700 shrink-0">&amp;</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
        </div>

        {/* Vichy */}
        <BrandRow brand={BRANDS[3]} isAR={isAR} />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-700 shrink-0">&amp;</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
        </div>

        {/* Bioderma */}
        <BrandRow brand={BRANDS[4]} isAR={isAR} />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-700 shrink-0">&amp;</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
        </div>

        {/* Eucerin */}
        <BrandRow brand={BRANDS[5]} isAR={isAR} />

      </div>
    </section>
  );
};
