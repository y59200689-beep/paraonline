'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShopShell } from '@/components/ShopShell';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/data';
import { useUi } from '@/context/UiContext';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  ChevronRight,
  ShieldCheck,
  FlaskConical,
  Microscope,
  Package,
  Loader2,
  Check,
  Star,
  ChevronLeft,
  Sparkles,
  Droplets,
  Sun,
  Zap,
  Heart,
  Leaf,
} from 'lucide-react';

/* ─── Brand palette ───────────────────────────────────────────────── */
const LRP_BLUE  = '#0ea5e9';
const LRP_DARK  = '#1a2744';
const LRP_NAVY  = '#0f172a';
const LRP_CREAM = '#fdf8f2';

/* ─── Sub-category definitions (the main upgrade) ───────────────── */
const RANGES = [
  {
    id: 'acne',
    name: 'EFFACLAR',
    label: 'Acné &\nImperfections',
    tagline: 'Peaux grasses, acnéiques & à imperfections',
    description: 'La gamme Effaclar est formulée pour les peaux grasses, mixtes et sujettes aux imperfections. Actifs : Acide Salicylique, Niacinamide, LHA.',
    molecules: ['Acide Salicylique', 'Niacinamide', 'LHA'],
    accent: '#2563eb',
    lightBg: '#eff6ff',
    gradient: 'from-[#1e3a8a] to-[#2563eb]',
    overlayColor: 'rgba(30,58,138,0.72)',
    keywords: ['effaclar','acné','acne','imperfection','sébum'],
    Icon: Zap,
    /* Real product photo served via API — used as card bg, fallback to gradient */
    bgStyle: { background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' },
  },
  {
    id: 'solaire',
    name: 'ANTHELIOS',
    label: 'Protection\nSolaire SPF50+',
    tagline: 'La protection solaire dermatologique N°1',
    description: 'Anthelios propose la technologie UV-Mune 400® pour filtrer les UVA longs, invisibles mais responsables du vieillissement cutané.',
    molecules: ['Mexoryl SX', 'UV-Mune 400', 'SPF 50+'],
    accent: '#ea580c',
    lightBg: '#fff7ed',
    gradient: 'from-[#9a3412] to-[#ea580c]',
    overlayColor: 'rgba(154,52,18,0.65)',
    keywords: ['anthelios','solaire','spf','sun','uv'],
    Icon: Sun,
    bgStyle: { background: 'linear-gradient(135deg,#78350f 0%,#f97316 100%)' },
  },
  {
    id: 'cicatrisation',
    name: 'CICAPLAST',
    label: 'Cicatrisation\n& Réparation',
    tagline: 'Soin réparateur pour les peaux abîmées',
    description: 'Cicaplast Baume B5+ répare intensément les peaux irritées, craquelées ou post-procédure dermatologique. Actif : Panthénol B5.',
    molecules: ['Panthénol B5', 'Bisabolol', 'Manganèse'],
    accent: '#16a34a',
    lightBg: '#f0fdf4',
    gradient: 'from-[#14532d] to-[#16a34a]',
    overlayColor: 'rgba(20,83,45,0.68)',
    keywords: ['cicaplast','cicatri','repair','baume','b5'],
    Icon: Heart,
    bgStyle: { background: 'linear-gradient(135deg,#14532d 0%,#4ade80 100%)' },
  },
  {
    id: 'taches',
    name: 'MELA B3',
    label: 'Taches\n& Éclat',
    tagline: 'Correction des taches pigmentaires et éclat',
    description: 'La gamme Mela B3 cible les taches brunes et les irrégularités de teint grâce au trio Niacinamide + Acide Tranexamique + Rétinol.',
    molecules: ['Niacinamide', 'Ac. Tranexamique', 'Rétinol'],
    accent: '#7c3aed',
    lightBg: '#faf5ff',
    gradient: 'from-[#4c1d95] to-[#7c3aed]',
    overlayColor: 'rgba(76,29,149,0.70)',
    keywords: ['mela','tache','pigment','éclat'],
    Icon: Sparkles,
    bgStyle: { background: 'linear-gradient(135deg,#4c1d95 0%,#a855f7 100%)' },
  },
  {
    id: 'secheresse',
    name: 'LIPIKAR',
    label: 'Sécheresse\n& Eczéma',
    tagline: 'Hydratation intense pour peaux très sèches',
    description: 'Lipikar reconstitue le film lipidique des peaux sèches à très sèches et atopiques. Actif exclusif AP+M pour réduire le prurit.',
    molecules: ['AP+M', 'Niacinamide', 'Huile de Karité'],
    accent: '#d97706',
    lightBg: '#fffbeb',
    gradient: 'from-[#92400e] to-[#d97706]',
    overlayColor: 'rgba(146,64,14,0.65)',
    keywords: ['lipikar','eczéma','sèche','atopique','ap+','lavant','lavante'],
    Icon: Droplets,
    bgStyle: { background: 'linear-gradient(135deg,#78350f 0%,#fbbf24 100%)' },
  },
  {
    id: 'sensibles',
    name: 'TOLERIANE',
    label: 'Peaux\nSensibles',
    tagline: 'Soins doux pour peaux sensibles & réactives',
    description: 'Toleriane est la gamme de référence pour les peaux sensibles, réactives et allergiques. Formule ultra-tolérante sans conservateurs.',
    molecules: ['Neurosensine', 'Prébiologiques', 'Eau Thermale'],
    accent: '#0284c7',
    lightBg: '#f0f9ff',
    gradient: 'from-[#075985] to-[#0284c7]',
    overlayColor: 'rgba(7,89,133,0.68)',
    keywords: ['toleriane','sensible','allergi','réactive'],
    Icon: Leaf,
    bgStyle: { background: 'linear-gradient(135deg,#0c4a6e 0%,#38bdf8 100%)' },
  },
];

/* ─── Active ingredients (new section) ──────────────────────────── */
const ACTIFS = [
  {
    id: 'niacinamide',
    name: 'Niacinamide',
    desc: 'Réduit les pores dilatés, unifie le teint et régule la production de sébum. Cet actif polyvalent agit sur les taches brunes et l\'éclat.',
    keywords: ['niacinamide','mela','effaclar','toleriane'],
  },
  {
    id: 'salicylic',
    name: 'Ac. Salicylique',
    desc: 'Exfoliant BHA qui pénètre dans les pores pour les désobstruer, éliminer les comédons et prévenir les récidives d\'imperfections.',
    keywords: ['effaclar','salicylique','acide','imperfection'],
  },
  {
    id: 'hyaluronic',
    name: 'Ac. Hyaluronique',
    desc: 'Hydratant puissant qui attire et retient l\'eau dans les couches profondes de la peau, pour un effet repulpant et lissant immédiat.',
    keywords: ['hydraphase','hyalu','sérum','hydra'],
  },
  {
    id: 'vitaminC',
    name: 'Vitamine C Pure',
    desc: 'Antioxydant clinique qui neutralise les radicaux libres, stimule le collagène et révèle un éclat naturel dès les premières applications.',
    keywords: ['pure vitamin','vitamine c','sérum','redermic'],
  },
  {
    id: 'retinol',
    name: 'Rétinol',
    desc: 'Dérivé de vitamine A qui accélère le renouvellement cellulaire, lisse les rides profondes et améliore la texture de la peau.',
    keywords: ['retinol','redermic','anti-age','sérum'],
  },
];

/* ─── Trust claims ───────────────────────────────────────────────── */
const TRUST_CLAIMS = [
  {
    num: '01', Icon: ShieldCheck,
    title: 'TOUS LES PRODUITS SONT HYPOALLERGÉNIQUES.',
    body: 'Nos formules sont élaborées sans conservateurs ou parfums allergisants potentiels. Chaque produit fait l\'objet de tests dermatologiques rigoureux pour garantir une tolérance maximale.',
  },
  {
    num: '02', Icon: Microscope,
    title: 'TESTÉS SUR DES PEAUX TRÈS SENSIBLES.',
    body: 'Les produits font l\'objet d\'essais cliniques approfondis sur un panel de sujets ayant une peau sensible, réactive ou atopique pour confirmer leur efficacité.',
  },
  {
    num: '03', Icon: FlaskConical,
    title: 'À LA JUSTE DOSE ACTIVE.',
    body: 'Nous nous engageons à n\'utiliser que les concentrations optimales d\'actifs dermatologiques, dosées pour maximiser l\'efficacité tout en évitant les risques d\'irritation.',
  },
  {
    num: '04', Icon: Package,
    title: 'PROTECTION DE LA FORMULE JUSQU\'AU BOUT.',
    body: 'L\'emballage est rigoureusement étudié pour assurer l\'intégrité de la formule. Un système airless empêche toute contamination et garantit la pureté des actifs.',
  },
];

const SKIN_TABS = [
  { id: 'all',       label: 'Toutes les gammes' },
  { id: 'acne',      label: 'Acné'              },
  { id: 'solaire',   label: 'Protection solaire' },
  { id: 'taches',    label: 'Anti-taches'       },
  { id: 'antiage',   label: 'Anti-âge & Sérums' },
  { id: 'secheresse',label: 'Sécheresse'        },
  { id: 'sensibles', label: 'Peaux sensibles'   },
];

const SORT_OPTIONS = [
  { value: 'popular',   label: 'Popularité'      },
  { value: 'price-asc', label: 'Prix croissant'   },
  { value: 'price-desc',label: 'Prix décroissant' },
  { value: 'rating',    label: 'Meilleures notes' },
];

/* ─── Helpers ────────────────────────────────────────────────────── */
const matchByKeywords = (p: Product, kwds: string[]) => {
  const text = `${p.title ?? ''} ${(p.tags ?? []).join(' ')} ${p.category ?? ''}`.toLowerCase();
  return kwds.some(k => text.includes(k));
};

const matchTab = (p: Product, tabId: string) => {
  if (tabId === 'all') return true;
  const range = RANGES.find(r => r.id === tabId);
  return range ? matchByKeywords(p, range.keywords) : true;
};

const sortProducts = (list: Product[], opt: string) => {
  const arr = [...list];
  if (opt === 'price-asc')  return arr.sort((a,b) => a.price - b.price);
  if (opt === 'price-desc') return arr.sort((a,b) => b.price - a.price);
  if (opt === 'rating')     return arr.sort((a,b) => (b.rating||5) - (a.rating||5));
  return arr.sort((a,b) => (b.reviews||0) - (a.reviews||0));
};

const firstImage = (p: Product): string => {
  const imgs = (p as any).images || (p as any).imageUrls || [];
  if (imgs.length) return imgs[0];
  return (p as any).image || (p as any).imageUrl || '';
};

/* ─── Component ──────────────────────────────────────────────────── */
export default function LaRochePosayCustomPage() {
  const { setDiagnosticOpen } = useUi();

  const [products, setProducts]         = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeRange, setActiveRange]   = useState<string | null>(null);
  const [activeTab, setActiveTab]       = useState('all');
  const [activeActif, setActiveActif]   = useState('niacinamide');
  const [maxPrice, setMaxPrice]         = useState(1500);
  const [sortOption, setSortOption]     = useState('popular');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  /* Fetch all LRP products */
  useEffect(() => {
    let dead = false;
    fetch('/api/products?vendor=La+Roche-Posay&limit=500')
      .then(r => r.json())
      .then(d => { if (!dead && d.success) setProducts(d.products ?? []); })
      .catch(() => {})
      .finally(() => { if (!dead) setLoading(false); });
    return () => { dead = true; };
  }, []);

  /* Range card image — first product image per range */
  const rangeImages = useMemo(() => {
    const map: Record<string, string> = {};
    RANGES.forEach(rng => {
      const p = products.find(pr => matchByKeywords(pr, rng.keywords));
      if (p) map[rng.id] = firstImage(p);
    });
    return map;
  }, [products]);

  /* Actif products */
  const actifProducts = useMemo(() => {
    const actif = ACTIFS.find(a => a.id === activeActif) || ACTIFS[0];
    return sortProducts(products.filter(p => matchByKeywords(p, actif.keywords)), 'popular').slice(0, 4);
  }, [products, activeActif]);

  /* Essentials carousel (tab-filtered) */
  const essentialProducts = useMemo(() =>
    sortProducts(products.filter(p => matchTab(p, activeTab)), 'popular').slice(0, 10),
    [products, activeTab]
  );

  /* Effaclar hero product */
  const effaclarProduct = useMemo(() =>
    products.find(p => (p.title ?? '').toLowerCase().includes('effaclar duo')),
    [products]
  );

  /* Catalog (range-filtered or all) */
  const catalogProducts = useMemo(() => {
    let list = activeRange
      ? products.filter(p => matchByKeywords(p, RANGES.find(r => r.id === activeRange)!.keywords))
      : products;
    list = list.filter(p => p.price <= maxPrice);
    return sortProducts(list, sortOption);
  }, [products, activeRange, maxPrice, sortOption]);

  const scrollCarousel = (dir: 'left' | 'right') => {
    carouselRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  const selectRange = (id: string) => {
    const next = activeRange === id ? null : id;
    setActiveRange(next);
    setActiveTab(next || 'all');
    setTimeout(() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  };

  const activeRangeObj = RANGES.find(r => r.id === activeRange);
  const activeActifObj = ACTIFS.find(a => a.id === activeActif) || ACTIFS[0];

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <ShopShell>
      <main style={{ fontFamily: "'Inter','Helvetica Neue',sans-serif", background: '#fff' }}>

        {/* ══════════════════════════════════════════════════════════
            §1. HERO
        ══════════════════════════════════════════════════════════ */}
        {/* ══════════════════════════════════════════════════════════
            §1. HERO (CINEMATIC BRAND FLAGSHIP HERO)
        ══════════════════════════════════════════════════════════ */}
        <section className="relative bg-[#091727] py-12 lg:py-20 overflow-hidden border-b border-slate-800">
          {/* Background Thermal Water Splash Graphic Overlay */}
          <div
            className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1920&q=80')`,
            }}
          />
          {/* Dark Navy Radial & Linear Gradients for 100% Readable White Text */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#071220] via-[#091b30]/95 to-sky-950/40 pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[1280px] mx-auto px-5 lg:px-10 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

              {/* Left Column: Dark Mode High-Impact Copy */}
              <div className="lg:col-span-6 space-y-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  <Sparkles className="w-3.5 h-3.5" /> LABORATOIRE DERMATOLOGIQUE · FRANCE
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-black leading-[1.05] tracking-tight text-white">
                  CHANGER LA VIE<br />
                  DE TOUTES LES<br />
                  <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">PEAUX</span>
                </h1>

                <p className="text-sm lg:text-base text-slate-300 font-medium leading-relaxed max-w-lg">
                  Le soin dermatologique N°1 recommandé par plus de 90 000 dermatologues dans le monde. Formules d'exception enrichies à l'eau thermale apaisante de La Roche-Posay.
                </p>

                {/* Authority Row: Red N°1 Seal + Primary Sky-Blue Button */}
                <div className="flex flex-wrap items-center gap-5 pt-2">
                  <div className="flex items-center gap-3 bg-white/10 border border-white/15 px-4 py-2.5 rounded-2xl backdrop-blur-md">
                    <span className="text-3xl font-black text-red-500 leading-none">N°1</span>
                    <div className="text-left">
                      <p className="text-[11px] font-black text-white uppercase leading-none">MARQUE DERMATOLOGIQUE</p>
                      <p className="text-[9px] font-bold text-sky-300 mt-0.5">MONDIALE</p>
                    </div>
                  </div>

                  <Link
                    href="#ranges"
                    className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    DÉCOUVRIR LES GAMMES <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Clinical Trust Claims */}
                <div className="pt-6 border-t border-white/10 flex flex-wrap gap-y-2.5 gap-x-6 text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-sky-400 stroke-[3]" /> 100% Hypoallergénique
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-sky-400 stroke-[3]" /> Eau Thermale de La Roche-Posay
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-sky-400 stroke-[3]" /> Testé Peaux Sensibles
                  </span>
                </div>

                <p className="text-[9px] text-slate-400">*Source: IQVIA survey, 90,000 dermatologists worldwide, 2023</p>
              </div>

              {/* Right Column: Cinematic Thermal Water Splash & Flagship Renders */}
              <div className="lg:col-span-6 relative">
                <div className="relative flex flex-col items-center">
                  
                  {/* Floating 3 Flagship Products on Water Splash Backdrop */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full items-end justify-center py-4">
                    {[
                      {
                        range: 'EFFACLAR',
                        tag: 'Acné & Imperfections',
                        accent: '#38bdf8',
                        prod: products.find(p => (p.title ?? '').toLowerCase().includes('effaclar duo + m 40 ml') || (p.title ?? '').toLowerCase().includes('effaclar duo')),
                        h: 'h-48 lg:h-56',
                      },
                      {
                        range: 'ANTHELIOS',
                        tag: 'Protection Solaire',
                        accent: '#fb923c',
                        prod: products.find(p => (p.title ?? '').toLowerCase().includes('anthelios ecran spf 50+ gel') || (p.title ?? '').toLowerCase().includes('anthelios')),
                        h: 'h-52 lg:h-60',
                      },
                      {
                        range: 'CICAPLAST',
                        tag: 'Réparation Cutanée',
                        accent: '#4ade80',
                        prod: products.find(p => (p.title ?? '').toLowerCase().includes('cicaplast b5 baume gm 100 ml') || (p.title ?? '').toLowerCase().includes('cicaplast b5 baume mm 40 ml')),
                        h: 'h-44 lg:h-52',
                        overrideImg: 'https://paraofficinal.store/wp-content/uploads/2025/12/La-Roche-Posay-ProductPage-Damaged-Cicaplast-Baume-B5-100ml-3337872413018-Front.png',
                      },
                    ].map((item, idx) => {
                      const imgUrl = item.overrideImg || (item.prod ? firstImage(item.prod) : '');
                      return (
                        <div
                          key={idx}
                          onClick={() => selectRange(RANGES[idx]?.id || 'acne')}
                          className="group relative flex flex-col items-center text-center cursor-pointer transition-all duration-500 hover:-translate-y-2 bg-white/10 border border-white/15 rounded-3xl p-3.5 backdrop-blur-md hover:bg-white/15 hover:border-sky-400/50"
                        >
                          {/* Floating range badge */}
                          <div className="mb-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                            <p className="text-[10px] font-black" style={{ color: item.accent }}>
                              {item.range}
                            </p>
                            <p className="text-[8px] text-slate-300 font-bold hidden sm:block">
                              {item.tag}
                            </p>
                          </div>

                          {/* Product bottle standing in water aura */}
                          <div className={`w-full ${item.h} flex items-center justify-center relative p-2 bg-white/5 rounded-2xl border border-white/10`}>
                            <div className="absolute inset-x-2 bottom-0 h-4 bg-sky-400/20 rounded-full blur-md group-hover:bg-sky-400/40 transition-colors" />
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={item.range}
                                className="max-h-full max-w-[85%] object-contain drop-shadow-[0_15px_30px_rgba(56,189,248,0.3)] group-hover:scale-110 transition-all duration-500"
                              />
                            ) : (
                              <div className="w-16 h-28 rounded-xl flex items-center justify-center text-white text-[9px] font-bold" style={{ background: item.accent }}>
                                {item.range}
                              </div>
                            )}
                          </div>

                          {/* Price Tag below */}
                          {item.prod && (
                            <div className="mt-2.5 px-3 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-[10px] font-mono font-bold group-hover:bg-sky-500 group-hover:text-white transition-colors">
                              {item.prod.price} DH
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Range Chips Bar */}
                  <div className="mt-4 flex flex-wrap gap-1.5 justify-center w-full pt-4 border-t border-white/10">
                    {RANGES.map(r => (
                      <button
                        key={r.id}
                        onClick={() => selectRange(r.id)}
                        className="text-[10px] font-extrabold px-3 py-1 rounded-full border border-white/15 bg-white/5 text-slate-300 cursor-pointer transition-all hover:bg-sky-500 hover:text-white hover:border-sky-500"
                        style={activeRange === r.id ? { background: r.accent, color: 'white', borderColor: r.accent } : undefined}
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            §2. RANGES — NOS GAMMES PAR PRÉOCCUPATION (main upgrade)
        ══════════════════════════════════════════════════════════ */}
        <section id="ranges" className="py-14 bg-white border-b border-slate-100">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-10">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-2" style={{ color: LRP_BLUE }}>Dermatologie clinique</p>
                <h2 className="text-2xl lg:text-3xl font-black leading-tight" style={{ color: LRP_DARK }}>
                  NOS GAMMES PAR PRÉOCCUPATION
                </h2>
              </div>
              {activeRange && (
                <button onClick={() => { setActiveRange(null); setActiveTab('all'); }}
                  className="text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer hover:bg-red-50 transition"
                  style={{ borderColor: '#dc2626', color: '#dc2626' }}>
                  × Effacer le filtre
                </button>
              )}
            </div>

            {/* 3×2 bento grid — White Cards with Centered Product Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {RANGES.map(rng => {
                const img = rangeImages[rng.id];
                const isActive = activeRange === rng.id;
                const count = products.filter(p => matchByKeywords(p, rng.keywords)).length;
                const RngIcon = rng.Icon;
                return (
                  <button
                    key={rng.id}
                    onClick={() => selectRange(rng.id)}
                    className="group relative bg-white border rounded-3xl p-5 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between overflow-hidden cursor-pointer"
                    style={{
                      borderColor: isActive ? rng.accent : '#e2e8f0',
                      boxShadow: isActive ? `0 10px 30px ${rng.accent}20` : undefined,
                    }}
                  >
                    {/* Top Header Row */}
                    <div className="flex items-center justify-between mb-3 w-full">
                      <span
                        className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border"
                        style={{
                          background: `${rng.accent}12`,
                          color: rng.accent,
                          borderColor: `${rng.accent}30`,
                        }}
                      >
                        <RngIcon className="w-3.5 h-3.5" />
                        {rng.name}
                      </span>
                      
                      {isActive ? (
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ background: rng.accent }}>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {count} prods
                        </span>
                      )}
                    </div>

                    {/* Centered Product Image Container with 4-directional Margins */}
                    <div className="w-full bg-slate-50/80 border border-slate-100 rounded-2xl p-6 flex items-center justify-center h-48 my-2 relative overflow-hidden group-hover:bg-slate-100/60 transition-colors duration-300">
                      {img ? (
                        <img
                          src={img}
                          alt={rng.label}
                          className="max-h-36 max-w-[80%] object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-20 h-28 rounded-xl flex items-center justify-center" style={{ background: rng.accent }}>
                          <span className="text-[9px] font-black text-white text-center">{rng.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Details (Dark readable typography on White) */}
                    <div className="mt-2 space-y-2">
                      <h3 className="text-base font-black text-slate-900 leading-snug whitespace-pre-line tracking-tight group-hover:text-sky-600 transition-colors">
                        {rng.label}
                      </h3>
                      
                      <p className="text-xs text-slate-500 font-medium line-clamp-1 leading-relaxed">
                        {rng.tagline}
                      </p>

                      {/* Molecule Badges */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex gap-1.5 flex-wrap">
                          {rng.molecules.slice(0, 2).map(m => (
                            <span
                              key={m}
                              className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60"
                            >
                              {m}
                            </span>
                          ))}
                        </div>

                        <span className="text-[10px] font-black text-sky-600 group-hover:translate-x-0.5 transition-transform">
                          Voir →
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Range detail panel — slides in when a range is selected */}
            {activeRangeObj && (
              <div
                className="mt-4 rounded-2xl p-6 lg:p-8 flex flex-col sm:flex-row gap-6 items-start"
                style={{ background: activeRangeObj.lightBg, border: `1.5px solid ${activeRangeObj.accent}30` }}
              >
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: activeRangeObj.accent }}>{activeRangeObj.name}</p>
                  <h3 className="text-xl font-black mb-2" style={{ color: LRP_DARK }}>{activeRangeObj.label.replace('\n', ' ')}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{activeRangeObj.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {activeRangeObj.molecules.map(m => (
                      <span key={m} className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                        style={{ borderColor: activeRangeObj.accent + '60', color: activeRangeObj.accent, background: activeRangeObj.accent + '12' }}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <button
                    onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition hover:opacity-90"
                    style={{ background: activeRangeObj.accent }}
                  >
                    Voir les produits <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>





        {/* ══════════════════════════════════════════════════════════
            §6. STATS BANNER (REDESIGNED)
        ══════════════════════════════════════════════════════════ */}
        <section className="py-16 bg-[#0f172a] border-y border-slate-800 relative overflow-hidden">
          {/* Subtle background glow circles */}
          <div className="absolute top-1/2 left-10 -translate-y-1/2 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 right-10 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[1280px] mx-auto px-5 lg:px-10 relative z-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-800">
              <div>
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-sky-500/15 text-sky-400 border border-sky-400/30 mb-2">
                  <Microscope className="w-3.5 h-3.5" /> RÉSULTATS CLINIQUES PROUVÉS
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  EFFICACITÉ DERMATOLOGIQUE MESURÉE
                </h2>
              </div>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Études cliniques menées sous contrôle dermatologique strict sur des sujets à peau sensible.
              </p>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Product Spotlight Card (4 cols) */}
              <div className="lg:col-span-4 bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center relative group overflow-hidden backdrop-blur-md">
                <div className="absolute inset-0 bg-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />
                
                {effaclarProduct && firstImage(effaclarProduct) ? (
                  <img
                    src={firstImage(effaclarProduct)}
                    alt="Effaclar"
                    className="h-36 lg:h-40 object-contain drop-shadow-[0_20px_30px_rgba(56,189,248,0.25)] group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-24 h-32 bg-white/10 rounded-2xl border border-sky-400/30 flex items-center justify-center p-3 text-center">
                    <span className="text-xs font-black text-sky-300">EFFACLAR DUO+M</span>
                  </div>
                )}
                
                <div className="mt-3 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 bg-sky-400/10 px-3 py-1 rounded-full border border-sky-400/20">
                    Soin Référence
                  </span>
                  <p className="text-xs font-extrabold text-white mt-1.5">EFFACLAR DUO+M</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Soin Triple Correction Anti-Imperfections</p>
                </div>
              </div>

              {/* 3 Metric Cards (8 cols) */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  {
                    num: '100%',
                    percent: 100,
                    label: 'PÉNÉTRATION DES BOUTONS',
                    desc: 'Formule à pénétration profonde testée sous contrôle dermatologique.',
                    tag: 'Action Rapide',
                    bullets: ['Élimine les comédons', 'Agit au cœur des pores'],
                  },
                  {
                    num: '-38%',
                    percent: 38,
                    label: 'RÉDUCTION DES IMPERFECTIONS',
                    desc: 'Diminution visible des lésions rétentionnelles et inflammatoires dès 7 jours.',
                    tag: 'Résultat 7 Jours',
                    bullets: ['Réduit les marques', 'Prévient les récidives'],
                  },
                  {
                    num: '-25%',
                    percent: 25,
                    label: 'TOLÉRANCE MAXIMALE',
                    desc: 'Réduction significative des irritations et rougeurs sur peaux très réactives.',
                    tag: 'Haute Tolérance',
                    bullets: ['0% alcool / parfum', 'Hypoallergénique'],
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/10 hover:border-sky-400/40 rounded-3xl p-5 flex flex-col justify-start gap-3.5 hover:bg-white/[0.08] transition-all duration-300 group"
                  >
                    {/* Top Tag & Indicator */}
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 group-hover:border-sky-400/30 group-hover:text-sky-300 transition-colors">
                        {stat.tag}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] font-mono text-emerald-400 font-bold">ACTIF</span>
                      </div>
                    </div>

                    {/* Metric gradient number */}
                    <div>
                      <p className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent leading-none mb-2">
                        {stat.num}
                      </p>

                      <h3 className="text-xs font-black text-white leading-snug tracking-tight">
                        {stat.label}
                      </h3>
                    </div>

                    {/* Glowing Progress Bar */}
                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-1000 group-hover:shadow-[0_0_12px_rgba(56,189,248,0.8)]"
                          style={{ width: `${stat.percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Description (directly below, no huge gap) */}
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {stat.desc}
                    </p>

                    {/* Clinical Feature Bullets */}
                    <div className="pt-3 border-t border-white/5 space-y-1.5">
                      {stat.bullets.map((b, bi) => (
                        <div key={bi} className="flex items-center gap-2 text-[10px] text-slate-400">
                          <Check className="w-3 h-3 text-sky-400 shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>



        {/* ══════════════════════════════════════════════════════════
            §9. BRAND TRUST CLAIMS (REDESIGNED)
        ══════════════════════════════════════════════════════════ */}
        <section className="py-20 bg-slate-50/70 border-t border-slate-100 relative overflow-hidden">
          {/* Subtle background blur accent circles */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[1280px] mx-auto px-5 lg:px-10 relative z-10">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-sky-100/80 text-sky-600 border border-sky-200/50">
                <ShieldCheck className="w-3.5 h-3.5" /> CHARTE DE SÉCURITÉ DERMATOLOGIQUE
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: LRP_DARK }}>
                NOS 4 ENGAGEMENTS FONDAMENTAUX
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                Chaque formule La Roche-Posay répond à des exigences cliniques très strictes pour garantir une tolérance et une efficacité optimales.
              </p>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TRUST_CLAIMS.map((c, i) => {
                const Icon = c.Icon;
                return (
                  <div
                    key={i}
                    className="group relative bg-white border border-slate-100 rounded-3xl p-7 shadow-lg shadow-slate-100/80 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-sky-500/10 hover:border-sky-300/60 flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Top row: Icon + Ghost number */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-400/30 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <span className="text-3xl font-black font-mono text-slate-200 group-hover:text-sky-300 transition-colors duration-300">
                          {c.num}
                        </span>
                      </div>

                      {/* Content */}
                      <h3 className="text-base font-black leading-snug mb-3 tracking-tight group-hover:text-sky-600 transition-colors duration-300" style={{ color: LRP_DARK }}>
                        {c.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-slate-500 font-normal">
                        {c.body}
                      </p>
                    </div>

                    {/* Bottom accent glow bar */}
                    <div className="mt-6 pt-2">
                      <div className="h-1 w-full bg-gradient-to-r from-sky-400 to-blue-600 rounded-full opacity-30 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            §10. FULL CATALOG
        ══════════════════════════════════════════════════════════ */}
        <section id="catalog" className="py-12 bg-white border-t border-slate-100">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-black" style={{ color: LRP_DARK }}>
                  {activeRangeObj ? activeRangeObj.name : 'TOUS LES PRODUITS'}
                  <span className="text-lg ml-2 font-normal" style={{ color: activeRangeObj ? activeRangeObj.accent : LRP_BLUE }}>
                    {activeRangeObj ? `— ${activeRangeObj.label.replace('\n',' ')}` : 'La Roche-Posay'}
                  </span>
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">{loading ? 'Chargement…' : `${catalogProducts.length} produits trouvés`}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileFilterOpen(true)}
                  className="flex lg:hidden items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer bg-white hover:bg-slate-50 transition"
                  style={{ borderColor: '#e2e8f0', color: '#374151' }}>
                  <SlidersHorizontal className="w-4 h-4" style={{ color: LRP_BLUE }} /> Filtres
                </button>
                <div className="relative">
                  <select value={sortOption} onChange={e => setSortOption(e.target.value)}
                    className="w-48 px-3.5 py-2.5 text-xs font-bold bg-white border rounded-xl outline-none cursor-pointer appearance-none pr-8"
                    style={{ borderColor: '#e2e8f0', color: '#374151' }}>
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex gap-8 items-start">
              {/* Desktop sidebar */}
              <aside className="hidden lg:block w-52 shrink-0 sticky top-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prix max</h3>
                    <span className="text-xs font-black text-gray-700 font-mono">{maxPrice} DH</span>
                  </div>
                  <input type="range" min={20} max={1500} step={10} value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: LRP_BLUE }} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Gamme</h3>
                  <button onClick={() => setActiveRange(null)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
                    style={activeRange === null ? { background: '#eff6ff', color: LRP_BLUE } : { color: '#64748b' }}>
                    <span>Toutes</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">{products.length}</span>
                  </button>
                  {RANGES.map(rng => {
                    const cnt = products.filter(p => matchByKeywords(p, rng.keywords)).length;
                    if (!cnt) return null;
                    const isA = activeRange === rng.id;
                    return (
                      <button key={rng.id} onClick={() => setActiveRange(isA ? null : rng.id)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
                        style={isA ? { background: '#eff6ff', color: LRP_BLUE } : { color: '#64748b' }}>
                        <span>{rng.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">{cnt}</span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              {/* Product grid */}
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                    {Array.from({ length: 9 }).map((_,i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-slate-100 rounded-2xl h-60 mb-3" />
                        <div className="bg-slate-100 rounded h-4 mb-2 w-3/4" />
                        <div className="bg-slate-100 rounded h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : catalogProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                    {catalogProducts.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-20 gap-4 text-slate-400">
                    <Search className="w-8 h-8" />
                    <p className="text-sm font-bold text-slate-600">Aucun produit trouvé</p>
                    <button onClick={() => { setActiveRange(null); setMaxPrice(1500); }}
                      className="px-5 py-2.5 rounded-lg text-xs font-bold text-white cursor-pointer"
                      style={{ background: LRP_BLUE }}>Réinitialiser</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Mobile Filter Drawer ───────────────────────────────── */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
            <div className="relative w-80 max-w-[90vw] h-full bg-white shadow-2xl flex flex-col overflow-y-auto z-50">
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
                <span className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" style={{ color: LRP_BLUE }} /> Filtres
                </span>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prix maximum</h3>
                    <span className="text-xs font-black text-gray-700 font-mono">{maxPrice} DH</span>
                  </div>
                  <input type="range" min={20} max={1500} step={10} value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: LRP_BLUE }} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Gamme</h3>
                  {[{ id: null as string | null, name: 'Toutes', count: products.length },
                    ...RANGES.map(r => ({ id: r.id, name: r.name, count: products.filter(p => matchByKeywords(p, r.keywords)).length }))
                  ].filter(x => x.count > 0).map(item => (
                    <button key={String(item.id)}
                      onClick={() => { setActiveRange(item.id); setMobileFilterOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
                      style={activeRange === item.id ? { background: '#eff6ff', color: LRP_BLUE } : { color: '#64748b' }}>
                      <span>{item.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">{item.count}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-6 py-5 border-t border-slate-100 flex gap-3">
                <button onClick={() => { setActiveRange(null); setMaxPrice(1500); setMobileFilterOpen(false); }}
                  className="flex-1 py-2.5 border rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
                  style={{ borderColor: '#e2e8f0' }}>Effacer</button>
                <button onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer"
                  style={{ background: LRP_BLUE }}>Appliquer</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </ShopShell>
  );
}
