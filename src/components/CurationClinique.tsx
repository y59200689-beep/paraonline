'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/data';
import { useTranslation } from '@/context/LanguageContext';
import { ShoppingCart, ArrowRight, Sparkles, Zap, Droplets, Star, Shield, FlaskConical } from 'lucide-react';
import { useCart } from '@/context/CartContext';

// ─── Concern Definitions ─────────────────────────────────────────────────────

interface Concern {
  key: string;
  icon: React.ReactNode;
  labelFr: string;
  labelAr: string;
  taglineFr: string;
  taglineAr: string;
  accentColor: string;
  accentText: string;
  accentBorder: string;
  accentDot: string;
  keywords: string[];
  ingredientKeywords: string[];
}

const CONCERNS: Concern[] = [
  {
    key: 'acne',
    icon: <Zap size={16} strokeWidth={1.8} />,
    labelFr: 'Acné & Imperfections',
    labelAr: 'حب الشباب والشوائب',
    taglineFr: 'BHA · Centella · Niacinamide',
    taglineAr: 'BHA · سنتيلا · نياسيناميد',
    accentColor: 'bg-emerald-50',
    accentText: 'text-emerald-700',
    accentBorder: 'border-emerald-200',
    accentDot: '#059669',
    keywords: ['acné', 'acne', 'imperfection', 'bouton', 'sebum', 'pore', 'purifi', 'comedone', 'blackhead', 'point noir', 'séb'],
    ingredientKeywords: ['salicylic', 'benzoyl', 'sulfur', 'centella', 'niacinamide'],
  },
  {
    key: 'spots',
    icon: <Sparkles size={16} strokeWidth={1.8} />,
    labelFr: 'Éclat & Anti-taches',
    labelAr: 'نضارة البشرة والبقع',
    taglineFr: 'Vitamine C · Tranexamique · Kojic',
    taglineAr: 'فيتامين C · ترانيكساميك · كوجيك',
    accentColor: 'bg-amber-50',
    accentText: 'text-amber-700',
    accentBorder: 'border-amber-200',
    accentDot: '#d97706',
    keywords: ['tache', 'éclat', 'luminos', 'bright', 'pigment', 'mélasma', 'anti-taches', 'teint', 'terne', 'unifi'],
    ingredientKeywords: ['tranexamic', 'ascorbic', 'ascorbyl', 'kojic', 'arbutin', 'vitamin c', 'vitamine c'],
  },
  {
    key: 'antiage',
    icon: <Star size={16} strokeWidth={1.8} />,
    labelFr: 'Anti-âge & Fermeté',
    labelAr: 'مكافحة الشيخوخة',
    taglineFr: 'Rétinol · Peptides · Collagène',
    taglineAr: 'ريتينول · ببتيدات · كولاجين',
    accentColor: 'bg-rose-50',
    accentText: 'text-rose-700',
    accentBorder: 'border-rose-200',
    accentDot: '#e11d48',
    keywords: ['anti-ride', 'anti ride', 'ride', 'fermeté', 'ferme', 'lift', 'âge', 'vieill', 'collagène', 'elastin', 'jeunesse', 'contour', 'anti-aging'],
    ingredientKeywords: ['retinol', 'retinal', 'peptide', 'collagen', 'bakuchiol', 'adenosine', 'coenzyme'],
  },
  {
    key: 'hydration',
    icon: <Droplets size={16} strokeWidth={1.8} />,
    labelFr: 'Hydratation & Barrière',
    labelAr: 'ترطيب وحماية البشرة',
    taglineFr: 'Acide Hyaluronique · Céramides',
    taglineAr: 'حمض الهيالورونيك · سيراميد',
    accentColor: 'bg-sky-50',
    accentText: 'text-sky-700',
    accentBorder: 'border-sky-200',
    accentDot: '#0284c7',
    keywords: ['hydrat', 'hydra', 'barrière', 'séch', 'déshydrat', 'moisture', 'sérum', 'crème', 'nourris', 'douceur'],
    ingredientKeywords: ['hyaluronic', 'hyaluronate', 'ceramide', 'squalane', 'glycerin', 'panthenol'],
  },
  {
    key: 'soothing',
    icon: <Shield size={16} strokeWidth={1.8} />,
    labelFr: 'Apaisant & Sensible',
    labelAr: 'مهدئ للبشرة الحساسة',
    taglineFr: 'Centella · Madécassoside · Aloe',
    taglineAr: 'سنتيلا · مديكاسوسيد · ألوفيرا',
    accentColor: 'bg-teal-50',
    accentText: 'text-teal-700',
    accentBorder: 'border-teal-200',
    accentDot: '#0d9488',
    keywords: ['apais', 'sensible', 'rougeur', 'calme', 'sooth', 'réactif', 'toleriane', 'cica', 'cicatri'],
    ingredientKeywords: ['centella', 'madecassoside', 'aloe', 'chamomile', 'allantoin', 'bisabolol'],
  },
  {
    key: 'suncare',
    icon: <FlaskConical size={16} strokeWidth={1.8} />,
    labelFr: 'Solaire & Protection',
    labelAr: 'واقي الشمس والحماية',
    taglineFr: 'SPF 30 · SPF 50 · SPF 50+',
    taglineAr: 'SPF 30 · SPF 50 · SPF 50+',
    accentColor: 'bg-orange-50',
    accentText: 'text-orange-700',
    accentBorder: 'border-orange-200',
    accentDot: '#ea580c',
    keywords: ['solaire', 'spf', 'uva', 'uvb', 'écran', 'sun', 'protection', 'solar', 'bronz'],
    ingredientKeywords: ['zinc oxide', 'titanium dioxide', 'avobenzone', 'octocrylene', 'tinosorb'],
  },
];

// ─── Concern → Product Matching ───────────────────────────────────────────────

function matchesConcern(product: Product, concern: Concern): boolean {
  const text = `${product.title} ${product.nameFr || ''} ${product.description}`.toLowerCase();
  const ingredients = (product.ingredients || '').toLowerCase();
  const tags = (product.tags || []).join(' ').toLowerCase();
  const all = `${text} ${tags}`;
  const kwMatch = concern.keywords.some(kw => all.includes(kw));
  const ingMatch = concern.ingredientKeywords.some(kw => ingredients.includes(kw) || all.includes(kw));
  return kwMatch || ingMatch;
}

// ─── Tab Button ───────────────────────────────────────────────────────────────

function ConcernTab({ concern, isActive, onClick }: {
  concern: Concern;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium
        transition-all duration-250 cursor-pointer
        ${isActive
          ? `${concern.accentColor} ${concern.accentText} ${concern.accentBorder} shadow-sm scale-[1.02]`
          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
        }
      `}
      style={isActive ? { boxShadow: `0 0 0 1.5px ${concern.accentDot}30` } : undefined}
    >
      <span className="flex items-center gap-1.5">
        <span style={{ color: isActive ? concern.accentDot : undefined }}>{concern.icon}</span>
        <span className="whitespace-nowrap">{concern.labelFr}</span>
      </span>
    </button>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCardMini({ product, concern, index }: {
  product: Product;
  concern: Concern;
  index: number;
}) {
  const { addToCart } = useCart();
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const price = product.price ?? 0;
  const comparePrice = product.comparePrice ?? 0;
  const discountPct = comparePrice > price ? Math.round((1 - price / comparePrice) * 100) : null;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 60);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 0.38s ease, transform 0.38s ease, box-shadow 0.3s ease',
        boxShadow: hovered
          ? '0 8px 32px rgba(0,0,0,0.10)'
          : '0 2px 16px rgba(0,0,0,0.05)',
      }}
      className="relative bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
        <div className="absolute inset-0 bg-slate-50" />
        {product.image ? (
          <Image
            src={product.image}
            alt={product.nameFr || product.title}
            width={320}
            height={320}
            style={{
              transition: 'transform 0.4s ease',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
            }}
            className="absolute inset-0 w-full h-full object-contain p-4"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-10">🧴</div>
        )}
        {discountPct && (
          <div
            className="absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: concern.accentDot }}
          >
            -{discountPct}%
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
          {product.vendor || 'Para Officinal'}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug hover:text-slate-600 transition-colors">
            {product.nameFr || product.title}
          </h3>
        </Link>
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900">{price.toFixed(2)} Dhs</span>
            {comparePrice > price && (
              <span className="text-xs text-slate-400 line-through">{comparePrice.toFixed(2)} Dhs</span>
            )}
          </div>
          <button
            onClick={() => addToCart(product, 1)}
            className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-white shadow-sm hover:scale-110 active:scale-95 transition-transform duration-150"
            style={{ backgroundColor: concern.accentDot }}
            aria-label="Ajouter au panier"
          >
            <ShoppingCart size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="bg-slate-100" style={{ aspectRatio: '1/1' }} />
      <div className="p-4 space-y-2">
        <div className="h-2 bg-slate-100 rounded w-1/3" />
        <div className="h-3 bg-slate-100 rounded w-4/5" />
        <div className="h-3 bg-slate-100 rounded w-3/5" />
        <div className="h-7 bg-slate-100 rounded-full w-full mt-4" />
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export const CurationClinique: React.FC = () => {
  const { language } = useTranslation();
  const isRTL = language === 'AR';

  const [activeConcernKey, setActiveConcernKey] = useState<string>(CONCERNS[0].key);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridVisible, setGridVisible] = useState(true);
  const tabsRef = useRef<HTMLDivElement>(null);

  const activeConcern = CONCERNS.find(c => c.key === activeConcernKey) ?? CONCERNS[0];

  useEffect(() => {
    fetch('/api/products?limit=500&page=1')
      .then(r => r.json())
      .then(data => { setAllProducts(data.products ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const matchedProducts = allProducts.filter(p => matchesConcern(p, activeConcern)).slice(0, 8);

  const handleTabClick = (key: string) => {
    setGridVisible(false);
    setTimeout(() => { setActiveConcernKey(key); setGridVisible(true); }, 180);
  };

  return (
    <section className="w-full py-16 md:py-24 bg-white border-b border-slate-100">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-400 mb-2">
              Curation Clinique
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              {isRTL ? 'منتجات مختارة لكل احتياج' : 'Produits sélectionnés par préoccupation'}
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-lg">
              {isRTL
                ? 'اختر مشكلة بشرتك، ونوصي لك بالمنتجات المناسبة'
                : 'Sélectionnez votre préoccupation cutanée pour voir nos produits recommandés'}
            </p>
          </div>
          <Link
            href="/products"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors group"
          >
            Voir tout le catalogue
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Concern Tabs */}
        <div ref={tabsRef} className="relative mb-8">
          <div
            className="flex items-center gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none' }}
          >
            {CONCERNS.map(c => (
              <div key={c.key} className="snap-start flex-shrink-0">
                <ConcernTab
                  concern={c}
                  isActive={activeConcernKey === c.key}
                  onClick={() => handleTabClick(c.key)}
                />
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-white to-transparent md:hidden" />
        </div>

        {/* Active Concern Banner */}
        <div
          className={`mb-8 flex items-center justify-between flex-wrap gap-3 px-5 py-3.5 rounded-2xl border transition-colors duration-300 ${activeConcern.accentColor} ${activeConcern.accentBorder}`}
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-60"
                style={{ backgroundColor: activeConcern.accentDot }}
              />
              <span
                className="relative inline-flex rounded-full h-2.5 w-2.5"
                style={{ backgroundColor: activeConcern.accentDot }}
              />
            </span>
            <span className={`text-sm font-semibold ${activeConcern.accentText}`}>
              {isRTL ? activeConcern.labelAr : activeConcern.labelFr}
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 font-medium">
              {isRTL ? activeConcern.taglineAr : activeConcern.taglineFr}
            </span>
          </div>
          {!loading && (
            <span className="text-xs font-medium text-slate-500">
              {matchedProducts.length} produit{matchedProducts.length !== 1 ? 's' : ''} trouvé{matchedProducts.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Product Grid */}
        <div style={{ opacity: gridVisible ? 1 : 0, transition: 'opacity 0.18s ease' }}>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : matchedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {matchedProducts.map((product, i) => (
                <ProductCardMini
                  key={`${activeConcernKey}-${product.id}`}
                  product={product}
                  concern={activeConcern}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${activeConcern.accentColor}`}>
                <span style={{ color: activeConcern.accentDot, fontSize: 28 }}>{activeConcern.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">Aucun produit trouvé</h3>
              <p className="text-sm text-slate-400 max-w-xs">
                Nous enrichissons continuellement notre catalogue. Revenez bientôt.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full border border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900 transition-all"
              >
                Voir tous les produits <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile CTA */}
        <div className="mt-10 flex justify-center md:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Voir tout le catalogue <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default CurationClinique;
