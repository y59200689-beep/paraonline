'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShopShell } from '@/components/ShopShell';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/data';
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
} from 'lucide-react';

/* ─── Brand palette ───────────────────────────────────────────────── */
const LRP_BLUE    = '#0ea5e9';
const LRP_DARK    = '#1a2744';
const LRP_NAVY    = '#0f172a';
const LRP_CREAM   = '#fdf8f2';

/* ─── Tab definitions ────────────────────────────────────────────── */
const SKIN_TABS = [
  { id: 'all',       label: 'Toutes les gammes' },
  { id: 'sensibles', label: 'Peaux sensibles'   },
  { id: 'acne',      label: 'Acné'              },
  { id: 'antiage',   label: 'Anti-âge'          },
  { id: 'solaire',   label: 'Protection solaire' },
];

/* ─── Category tiles ─────────────────────────────────────────────── */
const CATEGORY_TILES = [
  { id: 'solaire',      label: 'PROTECTION SOLAIRE',           sub: 'ANTHELIOS', accent: '#f97316', bg: '#fff8f0', keywords: ['anthelios','solaire','spf','sun'] },
  { id: 'acne',         label: 'PEAUX GRASSES & ACNÉIQUES',    sub: 'EFFACLAR',  accent: '#2563eb', bg: '#eff6ff', keywords: ['effaclar','acné','acne','imperfection'] },
  { id: 'cicatrisation',label: 'CICATRISATION',                sub: 'CICAPLAST', accent: '#16a34a', bg: '#f0fdf4', keywords: ['cicaplast','cicatri','repair','baume'] },
  { id: 'secheresse',   label: 'SÉCHERESSE & ECZÉMA',          sub: 'LIPIKAR',   accent: '#d97706', bg: '#fffbeb', keywords: ['lipikar','eczéma','sèche','atopique','ap+'] },
  { id: 'fermete',      label: 'RIDE & PERTE DE FERMETÉ',      sub: 'SÉRUMS & SOINS', accent: '#7c3aed', bg: '#faf5ff', keywords: ['retinol','redermic','hyalu b5','sérum','pure vitamin'] },
  { id: 'taches',       label: 'TACHES PIGMENTAIRES',          sub: 'MELA B3',   accent: '#db2777', bg: '#fdf2f8', keywords: ['mela','tache','pigment'] },
  { id: 'sensibles',    label: 'PEAUX SENSIBLES & ALLERGIQUES',sub: 'TOLERIANE', accent: '#0284c7', bg: '#f0f9ff', keywords: ['toleriane','sensible','allergi'] },
  { id: 'hydra',        label: 'PEAUX DÉSHYDRATÉES',           sub: 'HYDRAPHASE',accent: '#059669', bg: '#ecfdf5', keywords: ['hydraphase','hydra','déshydra'] },
  { id: 'makeup',       label: 'MAQUILLAGE PEAUX SENSIBLES',   sub: '',           accent: '#c026d3', bg: '#fdf4ff', keywords: ['maquillage','mascara','fond de teint','makeup','toleriane teint'] },
  { id: 'toilette',     label: 'TOILETTE PEAUX SENSIBLES',     sub: '',           accent: '#475569', bg: '#f8fafc', keywords: ['toilette','gel nettoyant','mousse nettoyante','huile nettoyante','nettoyant doux'] },
];

/* ─── Trust claims ───────────────────────────────────────────────── */
const TRUST_CLAIMS = [
  {
    num: '01', Icon: ShieldCheck,
    title: 'TOUS LES PRODUITS SONT HYPOALLERGÉNIQUES.',
    body: 'Nos formules sont élaborées sans conservateurs ou parfums allergisants potentiels. Chaque produit fait l\'objet de tests dermatologiques rigoureux pour garantir une tolérance maximale, même sur les peaux les plus exigeantes.',
  },
  {
    num: '02', Icon: Microscope,
    title: 'TESTÉS SUR DES PEAUX TRÈS SENSIBLES.',
    body: 'Les produits font l\'objet d\'essais cliniques approfondis menés sur un panel de sujets ayant une peau sensible, réactive ou atopique, afin de confirmer leur efficacité et leur haute tolérance au quotidien.',
  },
  {
    num: '03', Icon: FlaskConical,
    title: 'À LA JUSTE DOSE ACTIVE.',
    body: 'Nous nous engageons à n\'utiliser que les concentrations optimales d\'actifs dermatologiques, soigneusement sélectionnées et dosées pour maximiser l\'efficacité tout en évitant les risques d\'irritation.',
  },
  {
    num: '04', Icon: Package,
    title: 'PROTECTION DE LA FORMULE JUSQU\'AU BOUT.',
    body: 'L\'emballage est rigoureusement étudié pour assurer l\'intégrité de la formule. Un système airless empêche toute contamination et garantit la pureté des actifs jusqu\'à la fin de l\'utilisation.',
  },
];

const SORT_OPTIONS = [
  { value: 'popular',   label: 'Popularité'        },
  { value: 'price-asc', label: 'Prix croissant'     },
  { value: 'price-desc',label: 'Prix décroissant'   },
  { value: 'rating',    label: 'Meilleures notes'   },
];

/* ─── Helpers ────────────────────────────────────────────────────── */
const matchTileKeywords = (p: Product, tile: typeof CATEGORY_TILES[0]) => {
  const text = `${p.title ?? ''} ${p.description ?? ''} ${(p.tags ?? []).join(' ')} ${p.category ?? ''}`.toLowerCase();
  return tile.keywords.some(k => text.includes(k));
};

const matchTab = (p: Product, tabId: string) => {
  if (tabId === 'all') return true;
  const tile = CATEGORY_TILES.find(t => t.id === tabId);
  return tile ? matchTileKeywords(p, tile) : true;
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
  const [products, setProducts]           = useState<Product[]>([]);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState('all');
  const [activeTile, setActiveTile]       = useState<string | null>(null);
  const [maxPrice, setMaxPrice]           = useState(1500);
  const [sortOption, setSortOption]       = useState('popular');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  /* Fetch */
  useEffect(() => {
    let dead = false;
    setLoading(true);
    fetch('/api/products?vendor=La+Roche-Posay&limit=500')
      .then(r => r.json())
      .then(d => { if (!dead && d.success) setProducts(d.products ?? []); })
      .catch(() => {})
      .finally(() => { if (!dead) setLoading(false); });
    return () => { dead = true; };
  }, []);

  /* Per-category hero images — first product image found per tile */
  const tileImages = useMemo(() => {
    const map: Record<string, string> = {};
    CATEGORY_TILES.forEach(tile => {
      const match = products.find(p => matchTileKeywords(p, tile));
      if (match) map[tile.id] = firstImage(match);
    });
    return map;
  }, [products]);

  /* Hero mosaic — pick one product per unique category */
  const heroProducts = useMemo(() => {
    const seen = new Set<string>();
    const out: { title: string; img: string; accent: string }[] = [];
    for (const tile of CATEGORY_TILES) {
      if (out.length >= 6) break;
      const p = products.find(pr => matchTileKeywords(pr, tile));
      if (p && !seen.has(tile.id)) {
        seen.add(tile.id);
        out.push({ title: tile.sub || tile.label, img: firstImage(p), accent: tile.accent });
      }
    }
    return out;
  }, [products]);

  /* Effaclar spotlight product */
  const effaclarProduct = useMemo(() =>
    products.find(p => (p.title ?? '').toLowerCase().includes('effaclar duo')),
    [products]
  );

  /* Essentials grid */
  const essentialProducts = useMemo(() =>
    sortProducts(products.filter(p => matchTab(p, activeTab)), 'popular').slice(0, 8),
    [products, activeTab]
  );

  /* Full catalog */
  const catalogProducts = useMemo(() => {
    let list = activeTile
      ? products.filter(p => matchTileKeywords(p, CATEGORY_TILES.find(t => t.id === activeTile)!))
      : products;
    list = list.filter(p => p.price <= maxPrice);
    return sortProducts(list, sortOption);
  }, [products, activeTile, maxPrice, sortOption]);

  const scrollCarousel = (dir: 'left' | 'right') => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  };

  /* ── render ──────────────────────────────────────────────────── */
  return (
    <ShopShell>
      <main className="min-h-screen bg-white" style={{ fontFamily: "'Inter','Helvetica Neue',sans-serif" }}>

        {/* ══════════════════════════════════════════════════════════
            1. HERO
        ══════════════════════════════════════════════════════════ */}
        <section style={{ background: LRP_CREAM, borderBottom: '1px solid #ede8e0' }}>
          <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-10 lg:py-14">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-0">

              {/* Left: text */}
              <div className="lg:w-[42%] space-y-5 z-10">
                {/* tagline */}
                <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: LRP_BLUE }}>
                  La Roche-Posay · Laboratoire Dermatologique
                </p>

                <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-black leading-[1.0] tracking-tight" style={{ color: LRP_DARK }}>
                  CHANGER<br />LA VIE DE<br />TOUTES<br />LES PEAUX
                </h1>

                {/* N°1 badge */}
                <div className="inline-flex items-start gap-3 bg-white border border-gray-200 shadow px-4 py-3 rounded-xl max-w-[270px]">
                  <span className="text-3xl font-black leading-none mt-0.5" style={{ color: '#dc2626' }}>N°1</span>
                  <p className="text-[11px] font-semibold leading-snug" style={{ color: LRP_DARK }}>
                    RECOMMANDÉE PAR<br />
                    <strong>LES DERMATOLOGUES</strong><br />
                    DANS LE MONDE<sup className="text-[8px]">*</sup>
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <Link
                    href="#catalog"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white transition hover:opacity-90 active:scale-95"
                    style={{ background: LRP_BLUE }}
                  >
                    Découvrir la gamme <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="#essentiels"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold border-2 transition hover:bg-slate-50"
                    style={{ borderColor: LRP_DARK, color: LRP_DARK }}
                  >
                    Les essentiels
                  </Link>
                </div>
                <p className="text-[9px] text-gray-400">*Source: IQVIA survey, dermatologists, 2023</p>
              </div>

              {/* Right: product mosaic */}
              <div className="lg:w-[58%] flex items-center justify-end">
                {loading ? (
                  <div className="w-full max-w-[520px] h-56 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                  </div>
                ) : (
                  <div className="relative w-full max-w-[520px]">
                    {/* decorative blob */}
                    <div className="absolute inset-0 rounded-[40px] opacity-20 blur-3xl" style={{ background: LRP_BLUE }} />
                    <div className="relative grid grid-cols-3 gap-3">
                      {heroProducts.map((item, i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center justify-between rounded-2xl overflow-hidden border bg-white shadow-sm transition-transform hover:scale-[1.03] hover:shadow-md"
                          style={{ borderColor: `${item.accent}35`, minHeight: 130 }}
                        >
                          {item.img ? (
                            <img
                              src={item.img}
                              alt={item.title}
                              className="w-full h-[90px] object-contain p-2"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-[90px] flex items-center justify-center" style={{ background: item.accent + '18' }}>
                              <span className="text-2xl">🧴</span>
                            </div>
                          )}
                          <div className="px-2 pb-2 w-full text-center">
                            <p className="text-[9px] font-black leading-tight" style={{ color: LRP_DARK }}>{item.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            2. EFFACLAR DUO+M BANNER
        ══════════════════════════════════════════════════════════ */}
        <section className="py-6 px-5 lg:px-10">
          <div className="max-w-[1280px] mx-auto rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 shadow-lg">
            {/* dark left */}
            <div
              className="flex flex-col justify-center px-8 py-10 space-y-4"
              style={{ background: 'linear-gradient(135deg,#0c1b36 0%,#1e3a6e 100%)' }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: '#60a5fa' }}>
                La Roche-Posay · Laboratoire Dermatologique
              </p>
              <h2 className="text-4xl lg:text-5xl font-black text-white leading-none">
                EFFACLAR<br />
                <span style={{ color: '#93c5fd' }}>DUO+M</span>
              </h2>
              <div className="flex items-end gap-3">
                <span className="text-7xl font-black leading-none" style={{ color: '#38bdf8' }}>3H</span>
                <div className="text-sm font-bold text-white/80 pb-2 leading-snug">
                  Effet visible<br />dès <strong className="text-white">3H*</strong>
                </div>
              </div>
              <p className="text-base font-extrabold text-white leading-snug">
                VISIBLEMENT LES BOUTONS<br />ATTEINTS ET RÉDUITS
              </p>
              <p className="text-xs text-white/60 leading-relaxed max-w-xs">
                Soin Correcteur, Désincrustant, Anti-Marques, Anti-Récidive.
                Efficacité prouvée cliniquement sur les imperfections sévères et persistantes.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Anti-boutons', 'Anti-marques', 'Anti-récidive'].map(tag => (
                  <span key={tag} className="text-[10px] font-bold px-2.5 py-1 rounded-full border text-white/90" style={{ borderColor: '#60a5fa60' }}>{tag}</span>
                ))}
              </div>
              <p className="text-[9px] text-white/30">*Scorage clinique après 3h, 22 sujets.</p>
              <Link href="#catalog" className="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border border-white/25 text-white hover:bg-white/10 transition">
                Découvrir Effaclar <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* light right — product photo */}
            <div
              className="relative flex items-center justify-center px-8 py-10"
              style={{ background: 'linear-gradient(135deg,#dbeafe 0%,#eff6ff 100%)' }}
            >
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-30" style={{ background: '#bfdbfe' }} />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-20" style={{ background: '#93c5fd' }} />
              </div>
              {effaclarProduct && firstImage(effaclarProduct) ? (
                <img
                  src={firstImage(effaclarProduct)}
                  alt={effaclarProduct.title}
                  className="relative z-10 h-52 lg:h-64 object-contain drop-shadow-2xl"
                />
              ) : (
                <div className="relative z-10 w-36 h-48 rounded-2xl bg-white border-2 flex flex-col items-center justify-center gap-2 shadow-xl" style={{ borderColor: LRP_BLUE }}>
                  <div className="w-8 h-8 rounded" style={{ background: LRP_BLUE }} />
                  <p className="text-[10px] font-black text-center" style={{ color: LRP_DARK }}>EFFACLAR<br /><span style={{ color: '#38bdf8' }}>DUO+M</span></p>
                  <p className="text-[8px] text-gray-400 text-center">SOIN CORRECTEUR GLOBAL</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            3. LES ESSENTIELS — tabs + product grid
        ══════════════════════════════════════════════════════════ */}
        <section id="essentiels" style={{ background: '#f8fafc', borderTop: '1px solid #e8ecf0' }} className="py-10">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-10">
            <div className="text-center mb-6">
              <h2 className="text-2xl lg:text-3xl font-black" style={{ color: LRP_DARK }}>LES ESSENTIELS À LA ROCHE-POSAY</h2>
            </div>

            {/* Tab pills */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {SKIN_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer border"
                  style={activeTab === tab.id
                    ? { background: LRP_BLUE, color: 'white', borderColor: LRP_BLUE }
                    : { background: 'white', color: '#475569', borderColor: '#cbd5e1' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Carousel arrows + product row */}
            <div className="relative">
              <button onClick={() => scrollCarousel('left')} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center hover:bg-slate-50 transition cursor-pointer">
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button onClick={() => scrollCarousel('right')} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center hover:bg-slate-50 transition cursor-pointer">
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>

              {loading ? (
                <div className="flex gap-4 overflow-hidden">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse shrink-0 w-[220px]">
                      <div className="bg-slate-100 rounded-2xl h-56 mb-3" />
                      <div className="bg-slate-100 rounded h-4 mb-2 w-3/4" />
                      <div className="bg-slate-100 rounded h-3 w-1/3" />
                    </div>
                  ))}
                </div>
              ) : essentialProducts.length > 0 ? (
                <div ref={carouselRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
                  {essentialProducts.map(p => (
                    <div key={p.id} className="snap-start shrink-0 w-[220px] sm:w-[240px]">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400">
                  <Search className="w-8 h-8 mx-auto mb-3" />
                  <p className="text-sm">Aucun produit pour cette gamme.</p>
                </div>
              )}
            </div>

            {!loading && essentialProducts.length > 0 && (
              <div className="text-center mt-8">
                <Link href="#catalog" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold border-2 transition hover:bg-slate-50" style={{ borderColor: LRP_BLUE, color: LRP_BLUE }}>
                  Voir tous les produits <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            4. STATS BANNER (Effaclar)
        ══════════════════════════════════════════════════════════ */}
        <section style={{ background: '#bfdbfe', borderTop: '1px solid #93c5fd' }}>
          <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-10">
            <div className="flex flex-col lg:flex-row items-stretch divide-y lg:divide-y-0 lg:divide-x divide-blue-300">

              {/* Effaclar product image */}
              <div className="flex items-center justify-center py-6 lg:py-0 lg:pr-8 lg:w-[180px] shrink-0">
                {effaclarProduct && firstImage(effaclarProduct) ? (
                  <img src={firstImage(effaclarProduct)} alt="Effaclar DUO+M" className="h-32 object-contain drop-shadow-lg" />
                ) : (
                  <div className="w-20 h-28 bg-white rounded-xl flex items-center justify-center shadow" style={{ border: `2px solid ${LRP_BLUE}` }}>
                    <span className="text-[9px] font-black text-center" style={{ color: LRP_DARK }}>EFFACLAR<br />DUO+M</span>
                  </div>
                )}
              </div>

              {/* Stat 1 */}
              <div className="flex-1 flex flex-col justify-center px-8 py-6">
                <p className="text-5xl lg:text-6xl font-black leading-none" style={{ color: '#1e3a5f' }}>100%</p>
                <p className="text-sm font-black mt-1 leading-snug" style={{ color: '#1e3a5f' }}>PÉNÉTRATION<br />DES BOUTONS</p>
                <p className="text-xs mt-2 leading-relaxed" style={{ color: '#1d4ed8' }}>Formule à pénétration profonde testée cliniquement pour atteindre les boutons au cœur de l'imperfection.</p>
              </div>

              {/* Stat 2 */}
              <div className="flex-1 flex flex-col justify-center px-8 py-6">
                <p className="text-5xl lg:text-6xl font-black leading-none" style={{ color: '#1e3a5f' }}>-38%</p>
                <p className="text-sm font-black mt-1 leading-snug" style={{ color: '#1e3a5f' }}>IMPERFECTIONS<br /><span className="font-normal text-xs">visibles</span></p>
                <p className="text-xs mt-2 leading-relaxed" style={{ color: '#1d4ed8' }}>Réduction visible des imperfections dès la première semaine d'utilisation continue.</p>
              </div>

              {/* Stat 3 */}
              <div className="flex-1 flex flex-col justify-center px-8 py-6">
                <p className="text-5xl lg:text-6xl font-black leading-none" style={{ color: '#1e3a5f' }}>-25%</p>
                <p className="text-sm font-black mt-1 leading-snug" style={{ color: '#1e3a5f' }}>IRRITATIONS<br /><span className="font-normal text-xs">sur peaux sensibles</span></p>
                <p className="text-xs mt-2 leading-relaxed" style={{ color: '#1d4ed8' }}>Tolérance exceptionnelle confirmée sur les peaux les plus sensibles et réactives.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            5. EFFACLAR product spotlight (2-column)
        ══════════════════════════════════════════════════════════ */}
        {effaclarProduct && (
          <section className="py-10 bg-white border-t border-slate-100">
            <div className="max-w-[1280px] mx-auto px-5 lg:px-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center min-h-[280px]">
                  {firstImage(effaclarProduct) ? (
                    <img src={firstImage(effaclarProduct)} alt={effaclarProduct.title} className="h-64 object-contain p-4" />
                  ) : (
                    <div className="w-40 h-52 bg-blue-100 rounded-xl" />
                  )}
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: LRP_BLUE }}>EFFACLAR</p>
                  <h3 className="text-2xl lg:text-3xl font-black leading-tight" style={{ color: LRP_DARK }}>
                    {effaclarProduct.title}
                  </h3>
                  {effaclarProduct.description && (
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-4">{effaclarProduct.description}</p>
                  )}
                  {effaclarProduct.rating && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" style={{ color: i < Math.round(effaclarProduct.rating!) ? '#f59e0b' : '#e2e8f0' }} />
                      ))}
                      <span className="text-xs text-slate-400 ml-1">({effaclarProduct.reviews || 0} avis)</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black" style={{ color: LRP_DARK }}>{effaclarProduct.price} DH</span>
                    {effaclarProduct.comparePrice && effaclarProduct.comparePrice > effaclarProduct.price && (
                      <span className="text-sm text-slate-400 line-through">{effaclarProduct.comparePrice} DH</span>
                    )}
                  </div>
                  <Link
                    href={`/products/${effaclarProduct.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white transition hover:opacity-90"
                    style={{ background: LRP_BLUE }}
                  >
                    Acheter maintenant <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════
            6. CATEGORY TILES GRID
        ══════════════════════════════════════════════════════════ */}
        <section className="py-10 bg-white border-t border-slate-100">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black" style={{ color: LRP_DARK }}>NOS GAMMES DE SOINS</h2>
              {activeTile && (
                <button
                  onClick={() => setActiveTile(null)}
                  className="text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer transition hover:bg-red-50"
                  style={{ borderColor: '#dc2626', color: '#dc2626' }}
                >
                  × Effacer le filtre
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {CATEGORY_TILES.map(tile => {
                const isActive = activeTile === tile.id;
                const count    = products.filter(p => matchTileKeywords(p, tile)).length;
                const imgSrc   = tileImages[tile.id];
                return (
                  <button
                    key={tile.id}
                    onClick={() => {
                      setActiveTile(isActive ? null : tile.id);
                      setTimeout(() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }), 80);
                    }}
                    className="relative group flex flex-col items-start text-left rounded-2xl border-2 transition-all duration-200 cursor-pointer overflow-hidden hover:shadow-lg hover:scale-[1.025] active:scale-[0.98]"
                    style={{
                      background: isActive ? tile.accent : tile.bg,
                      borderColor: isActive ? tile.accent : `${tile.accent}50`,
                    }}
                  >
                    {/* Product image */}
                    <div className="w-full h-28 flex items-center justify-center p-3 relative">
                      {imgSrc ? (
                        <img src={imgSrc} alt={tile.label} className="h-24 w-full object-contain" loading="lazy" />
                      ) : (
                        <div className="w-16 h-20 rounded-xl" style={{ background: `${tile.accent}25` }} />
                      )}
                      {isActive && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center bg-white/30">
                          <Check className="w-3 h-3 text-white stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div className="px-3 pb-3 w-full">
                      <p className="text-[11px] font-black leading-tight" style={{ color: isActive ? 'white' : LRP_DARK }}>
                        {tile.label}
                      </p>
                      {tile.sub && (
                        <p className="text-[10px] font-semibold mt-0.5" style={{ color: isActive ? 'rgba(255,255,255,0.75)' : tile.accent }}>
                          {tile.sub}
                        </p>
                      )}
                      {count > 0 && (
                        <span
                          className="inline-block mt-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: isActive ? 'rgba(255,255,255,0.2)' : `${tile.accent}18`,
                            color: isActive ? 'white' : tile.accent,
                          }}
                        >
                          {count} produits
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            7. BRAND TRUST CLAIMS
        ══════════════════════════════════════════════════════════ */}
        <section style={{ background: '#f5efdf', borderTop: '1px solid #dfd7c5' }} className="py-12">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-10">
            <h2 className="text-xl font-black mb-8" style={{ color: LRP_DARK }}>NOS ENGAGEMENTS</h2>
            {/* 2×2 grid with dividers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: '#c9bfaa' }}>
              {TRUST_CLAIMS.map((c, i) => {
                const Icon = c.Icon;
                return (
                  <div key={i} className="flex flex-col gap-4 p-8" style={{ background: '#f5efdf' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-gray-400">{c.num}</span>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: LRP_DARK }}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-black leading-tight" style={{ color: LRP_DARK }}>{c.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-600">{c.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            8. FULL CATALOG
        ══════════════════════════════════════════════════════════ */}
        <section id="catalog" className="py-12 bg-white border-t border-slate-100">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-10">

            {/* Header row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-black" style={{ color: LRP_DARK }}>
                  {activeTile
                    ? (CATEGORY_TILES.find(t => t.id === activeTile)?.label || 'Produits')
                    : 'TOUS LES PRODUITS LA ROCHE-POSAY'}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {loading ? 'Chargement…' : `${catalogProducts.length} produits trouvés`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="flex lg:hidden items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer bg-white transition hover:bg-slate-50"
                  style={{ borderColor: '#e2e8f0', color: '#374151' }}
                >
                  <SlidersHorizontal className="w-4 h-4" style={{ color: LRP_BLUE }} />
                  Filtres
                </button>
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={e => setSortOption(e.target.value)}
                    className="w-48 px-3.5 py-2.5 text-xs font-bold bg-white border rounded-xl outline-none cursor-pointer appearance-none pr-8"
                    style={{ borderColor: '#e2e8f0', color: '#374151' }}
                  >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Layout: sidebar + grid */}
            <div className="flex gap-8 items-start">

              {/* Desktop sidebar */}
              <aside className="hidden lg:block w-56 shrink-0 sticky top-6 space-y-6">
                {/* Price */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prix max</h3>
                    <span className="text-xs font-black text-gray-700 font-mono">{maxPrice} DH</span>
                  </div>
                  <input type="range" min={20} max={1500} step={10} value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: LRP_BLUE }}
                  />
                </div>

                {/* Gamme */}
                <div className="space-y-1.5">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Gamme</h3>
                  <button
                    onClick={() => setActiveTile(null)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
                    style={activeTile === null ? { background: '#eff6ff', color: LRP_BLUE } : { color: '#64748b' }}
                  >
                    <span>Toutes</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">{products.length}</span>
                  </button>
                  {CATEGORY_TILES.map(tile => {
                    const count = products.filter(p => matchTileKeywords(p, tile)).length;
                    if (!count) return null;
                    const isActive = activeTile === tile.id;
                    return (
                      <button key={tile.id}
                        onClick={() => setActiveTile(isActive ? null : tile.id)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
                        style={isActive ? { background: '#eff6ff', color: LRP_BLUE } : { color: '#64748b' }}
                      >
                        <span>{tile.sub || tile.label.split(' ')[0]}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              {/* Product grid */}
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-slate-100 rounded-2xl h-60 mb-3" />
                        <div className="bg-slate-100 rounded h-4 mb-2 w-3/4" />
                        <div className="bg-slate-100 rounded h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : catalogProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                    {catalogProducts.map(p => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-20 gap-4 text-slate-400">
                    <Search className="w-8 h-8" />
                    <p className="text-sm font-bold text-slate-600">Aucun produit trouvé</p>
                    <button onClick={() => { setActiveTile(null); setMaxPrice(1500); }}
                      className="px-5 py-2.5 rounded-lg text-xs font-bold text-white cursor-pointer"
                      style={{ background: LRP_BLUE }}>
                      Réinitialiser
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Mobile Filter Drawer ────────────────────────────────── */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
            <div className="relative w-80 max-w-[90vw] h-full bg-white shadow-2xl flex flex-col overflow-y-auto z-50">
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
                <span className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" style={{ color: LRP_BLUE }} />
                  Filtres
                </span>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* Price */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prix maximum</h3>
                    <span className="text-xs font-black text-gray-700 font-mono">{maxPrice} DH</span>
                  </div>
                  <input type="range" min={20} max={1500} step={10} value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: LRP_BLUE }}
                  />
                </div>

                {/* Gamme */}
                <div className="space-y-1.5">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Gamme</h3>
                  {[{ id: null, label: 'Toutes', count: products.length },
                    ...CATEGORY_TILES.map(t => ({ id: t.id, label: t.sub || t.label, count: products.filter(p => matchTileKeywords(p, t)).length }))
                  ].filter(x => x.count > 0).map(item => (
                    <button key={String(item.id)}
                      onClick={() => { setActiveTile(item.id as string | null); setMobileFilterOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
                      style={activeTile === item.id ? { background: '#eff6ff', color: LRP_BLUE } : { color: '#64748b' }}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">{item.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-6 py-5 border-t border-slate-100 flex gap-3">
                <button onClick={() => { setActiveTile(null); setMaxPrice(1500); setMobileFilterOpen(false); }}
                  className="flex-1 py-2.5 border rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
                  style={{ borderColor: '#e2e8f0' }}>
                  Effacer
                </button>
                <button onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer"
                  style={{ background: LRP_BLUE }}>
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </ShopShell>
  );
}
