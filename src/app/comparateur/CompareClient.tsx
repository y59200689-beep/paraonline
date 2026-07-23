'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShopShell } from '@/components/ShopShell';
import { useCompare } from '@/context/CompareContext';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useProducts } from '@/context/ProductsContext';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/data';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import {
  Scale,
  Sparkles,
  ShieldCheck,
  Search,
  Trash2,
  Plus,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ArrowRight,
  Star,
  Zap,
  Award,
  Clock,
  Droplet,
  Flame,
  HelpCircle,
  Layers,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

// Ingredient → clinical benefit mapping
const INGREDIENT_BENEFITS_MAP: { pattern: RegExp; name: string; benefit: { FR: string; AR: string } }[] = [
  { pattern: /hyaluronic acid|hyaluronate/i, name: 'Acide Hyaluronique', benefit: { FR: 'Hydratation profonde & repulpage', AR: 'ترطيب عميق وتفعيل البشرة' } },
  { pattern: /glycolic acid/i, name: 'Acide Glycolique', benefit: { FR: 'Taches sombres & exfoliation', AR: 'البقع الداكنة والتقشير' } },
  { pattern: /salicylic acid/i, name: 'Acide Salicylique', benefit: { FR: 'Acné & désobstruction des pores', AR: 'حب الشباب وتنظيف المسام' } },
  { pattern: /lactic acid/i, name: 'Acide Lactique', benefit: { FR: 'Exfoliation douce & éclat', AR: 'تقشير لطيف وإشراق' } },
  { pattern: /niacinamide/i, name: 'Niacinamide', benefit: { FR: 'Pores & teint unifié', AR: 'المسام وتوحيد البشرة' } },
  { pattern: /retinol|retinyl palmitate/i, name: 'Rétinol', benefit: { FR: 'Anti-âge & renouvellement cellulaire', AR: 'مكافحة الشيخوخة وتجديد الخلايا' } },
  { pattern: /ascorbic acid|vitamin c/i, name: 'Vitamine C', benefit: { FR: 'Antioxydant & éclat', AR: 'مضاد الأكسدة والإشراق' } },
  { pattern: /tocopherol|vitamin e/i, name: 'Vitamine E', benefit: { FR: 'Antioxydant & nutrition cutanée', AR: 'مضاد الأكسدة وتغذية البشرة' } },
  { pattern: /zinc oxide/i, name: 'Oxyde de Zinc', benefit: { FR: 'Filtre UV & séborégulation', AR: 'فلتر UV وتنظيم الإفراز الدهني' } },
  { pattern: /titanium dioxide/i, name: 'Dioxyde de Titane', benefit: { FR: 'Protection UVB physique', AR: 'حماية UVB فيزيائية' } },
  { pattern: /glycerin/i, name: 'Glycérine', benefit: { FR: 'Barrière cutanée & rétention d\'eau', AR: 'حاجز البشرة واحتباس الماء' } },
  { pattern: /ceramide/i, name: 'Céramides', benefit: { FR: 'Restauration de la barrière cutanée', AR: 'استعادة حاجز البشرة' } },
  { pattern: /allantoin/i, name: 'Allantoïne', benefit: { FR: 'Apaisement & cicatrisation', AR: 'التهدئة والشفاء' } },
  { pattern: /panthenol|pro-vitamin b5/i, name: 'Panthénol (B5)', benefit: { FR: 'Hydratation & réparation tissulaire', AR: 'الترطيب وإصلاح الأنسجة' } },
  { pattern: /collagen/i, name: 'Collagène', benefit: { FR: 'Fermeté & élasticité', AR: 'الشد والمرونة' } },
  { pattern: /caffeine/i, name: 'Caféine', benefit: { FR: 'Anti-poches & microcirculation', AR: 'مكافحة الانتفاخ وتحسين الدورة' } },
  { pattern: /peptide/i, name: 'Peptides', benefit: { FR: 'Anti-âge & signalisation cellulaire', AR: 'مكافحة الشيخوخة وتنشيط الخلايا' } },
  { pattern: /alpha.arbutin/i, name: 'Alpha Arbutin', benefit: { FR: 'Dépigmentation & taches', AR: 'إزالة التصبغ والبقع' } },
];

export default function CompareClient() {
  const { language } = useTranslation();
  const { products } = useProducts();
  const { convertPrice } = useCurrency();
  const { addToCart } = useCart();
  const { compareProducts, addToCompare, removeFromCompare, clearCompare } = useCompare();

  const isRTL = language === 'AR';

  // Local state for slot searching
  const [searchSlot1, setSearchSlot1] = useState('');
  const [searchSlot2, setSearchSlot2] = useState('');
  const [isSelecting1, setIsSelecting1] = useState(false);
  const [isSelecting2, setIsSelecting2] = useState(false);

  const product1 = compareProducts[0] || null;
  const product2 = compareProducts[1] || null;

  // Extract active ingredients helper
  const getActives = (p: Product | null) => {
    if (!p || !p.ingredients) return [];
    return INGREDIENT_BENEFITS_MAP.filter((item) => item.pattern.test(p.ingredients));
  };

  const actives1 = getActives(product1);
  const actives2 = getActives(product2);

  // Extract volume in ml helper
  const getVolume = (p: Product | null) => {
    if (!p) return 50;
    const match = (p.title + ' ' + (p.description || '')).match(/(\d+)\s*ml/i);
    return match ? parseInt(match[1], 10) : 50;
  };

  const vol1 = getVolume(product1);
  const vol2 = getVolume(product2);

  const pricePerMl1 = product1 ? (product1.price / vol1).toFixed(2) : '0';
  const pricePerMl2 = product2 ? (product2.price / vol2).toFixed(2) : '0';

  // Filter products for slot modal/dropdown search
  const filteredProducts1 = useMemo(() => {
    if (!searchSlot1.trim()) return products.slice(0, 8);
    const q = searchSlot1.toLowerCase();
    return products.filter((p) =>
      p.id !== product2?.id &&
      (p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [products, searchSlot1, product2]);

  const filteredProducts2 = useMemo(() => {
    if (!searchSlot2.trim()) return products.slice(0, 8);
    const q = searchSlot2.toLowerCase();
    return products.filter((p) =>
      p.id !== product1?.id &&
      (p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [products, searchSlot2, product1]);

  return (
    <ShopShell>
      <div
        className="min-h-screen bg-[#FAF9F6] text-slate-900 selection:bg-emerald-500 selection:text-white relative overflow-hidden font-sans pb-24"
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        {/* Subtle Top Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/5 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />

        {/* ── 1. Hero Header Section ── */}
        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[11px] font-mono font-bold tracking-widest uppercase mb-4">
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isRTL ? 'مقارن المستحضرات الطبية والسريرية' : 'COMPARATEUR CLINIQUE & DERMO-SCIENTIFIQUE'}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4 font-heading">
            {isRTL ? (
              <>مقارنة تحليليّة <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">للمكونات والتركيبات</span></>
            ) : (
              <>Analyse Comparative <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">Formule & Actifs</span></>
            )}
          </h1>

          <p className="text-xs md:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            {isRTL
              ? 'قارني بين مستحضرين سريريين بدقة عالية: المكونات الفعالة، ملاءمة البشرة، التركيز، وتكلفة الملليلتر الواحد.'
              : 'Évaluez scientifiquement deux soins parapharmaceutiques côte à côte : actifs dermatologiques, tolérance cutanée, rapport qualité/prix et avis clinique.'}
          </p>

          {/* Quick Actions Header Bar */}
          {compareProducts.length > 0 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => clearCompare()}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isRTL ? 'إفراغ المقارن' : 'Réinitialiser la comparaison'}</span>
              </button>
            </div>
          )}
        </div>

        {/* ── 2. Interactive Product Selection Dual Slots ── */}
        <div className="max-w-6xl mx-auto px-4 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">

            {/* Central VS Badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black text-xs tracking-wider flex items-center justify-center shadow-xl border-4 border-[#FAF9F6] relative">
                <span className="text-amber-400">VS</span>
              </div>
            </div>

            {/* ── SLOT 1 ── */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-md hover:shadow-lg transition relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  {isRTL ? 'المنتج الأول (01)' : 'PRODUIT 01'}
                </span>
                {product1 && (
                  <button
                    onClick={() => removeFromCompare(product1.id)}
                    className="text-slate-400 hover:text-rose-500 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'حذف' : 'Retirer'}</span>
                  </button>
                )}
              </div>

              {product1 ? (
                <div className="space-y-4 text-center md:text-left">
                  <div className="relative w-36 h-36 mx-auto bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-2 group">
                    <Image
                      src={getOptimizedImageUrl(product1.image, 300)}
                      alt={product1.title}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block font-mono">
                      {product1.brand}
                    </span>
                    <h3 className="text-base font-black text-slate-900 leading-snug line-clamp-2 mt-0.5 font-heading">
                      {product1.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{product1.category}</p>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <div>
                      <span className="text-lg font-black text-slate-900">{convertPrice(product1.price)}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">~{pricePerMl1} DH/ml</span>
                    </div>
                    <button
                      onClick={() => setIsSelecting1(!isSelecting1)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-500" />
                      <span>{isRTL ? 'تغيير' : 'Changer'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                      {isRTL ? 'اختر المنتج الأول' : 'Sélectionnez le Produit 1'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {isRTL ? 'ابحث عن أي منتج لإضافته للمقارنة' : 'Recherchez un soin dans le catalogue'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSelecting1(true)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition shadow-md cursor-pointer inline-flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>{isRTL ? 'تصفح القائمة' : 'Parcourir le catalogue'}</span>
                  </button>
                </div>
              )}

              {/* Slot 1 Search Drawer/Dropdown */}
              {isSelecting1 && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-fade-in">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchSlot1}
                      onChange={(e) => setSearchSlot1(e.target.value)}
                      placeholder={isRTL ? 'ابحث باسم المنتج أو الماركة...' : 'Rechercher par nom, marque...'}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                    {filteredProducts1.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (!product1) {
                            addToCompare(p);
                          } else {
                            removeFromCompare(product1.id);
                            addToCompare(p);
                          }
                          setIsSelecting1(false);
                          setSearchSlot1('');
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="w-10 h-10 relative bg-white rounded-lg border border-slate-100 shrink-0 p-1">
                          <Image src={getOptimizedImageUrl(p.image, 100)} alt={p.title} fill className="object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-700">{p.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{p.brand} • {convertPrice(p.price)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── SLOT 2 ── */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-md hover:shadow-lg transition relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  {isRTL ? 'المنتج الثاني (02)' : 'PRODUIT 02'}
                </span>
                {product2 && (
                  <button
                    onClick={() => removeFromCompare(product2.id)}
                    className="text-slate-400 hover:text-rose-500 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'حذف' : 'Retirer'}</span>
                  </button>
                )}
              </div>

              {product2 ? (
                <div className="space-y-4 text-center md:text-left">
                  <div className="relative w-36 h-36 mx-auto bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-2 group">
                    <Image
                      src={getOptimizedImageUrl(product2.image, 300)}
                      alt={product2.title}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest block font-mono">
                      {product2.brand}
                    </span>
                    <h3 className="text-base font-black text-slate-900 leading-snug line-clamp-2 mt-0.5 font-heading">
                      {product2.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{product2.category}</p>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <div>
                      <span className="text-lg font-black text-slate-900">{convertPrice(product2.price)}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">~{pricePerMl2} DH/ml</span>
                    </div>
                    <button
                      onClick={() => setIsSelecting2(!isSelecting2)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-500" />
                      <span>{isRTL ? 'تغيير' : 'Changer'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-600 flex items-center justify-center mx-auto">
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                      {isRTL ? 'اختر المنتج الثاني' : 'Sélectionnez le Produit 2'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {isRTL ? 'اختر منتجاً آخر للمقارنة المباشرة' : 'Choisissez un deuxième soin pour comparer'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSelecting2(true)}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black uppercase tracking-wider transition shadow-md cursor-pointer inline-flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>{isRTL ? 'تصفح القائمة' : 'Parcourir le catalogue'}</span>
                  </button>
                </div>
              )}

              {/* Slot 2 Search Drawer/Dropdown */}
              {isSelecting2 && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-fade-in">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchSlot2}
                      onChange={(e) => setSearchSlot2(e.target.value)}
                      placeholder={isRTL ? 'ابحث باسم المنتج أو الماركة...' : 'Rechercher par nom, marque...'}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                    {filteredProducts2.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (!product2) {
                            addToCompare(p);
                          } else {
                            removeFromCompare(product2.id);
                            addToCompare(p);
                          }
                          setIsSelecting2(false);
                          setSearchSlot2('');
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-teal-50/70 border border-transparent hover:border-teal-200 transition flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="w-10 h-10 relative bg-white rounded-lg border border-slate-100 shrink-0 p-1">
                          <Image src={getOptimizedImageUrl(p.image, 100)} alt={p.title} fill className="object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate group-hover:text-teal-700">{p.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{p.brand} • {convertPrice(p.price)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── 3. Full Comparison Matrix (Visible when both products selected) ── */}
        {product1 && product2 ? (
          <div className="max-w-6xl mx-auto px-4 space-y-8 animate-fade-in">

            {/* ── Section A: Pharmacist Verdict Card ── */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-black uppercase tracking-wider text-white font-heading">
                    {isRTL ? 'الحكم والتحليل الصيدلاني' : 'VERDICT CLINIQUE DU PHARMACIEN'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {isRTL ? 'توصية الخبراء لحالتكِ الخاصة' : 'Recommandation d\'usage personnalisée selon la formule'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                    {product1.brand} — {product1.title}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {actives1.length > 0
                      ? isRTL
                        ? `يتميز بتركيز عالي من (${actives1.map(a => a.name).join(', ')}). ممتاز للبشرة التي تحتاج إلى ${actives1[0]?.benefit.AR || 'علاج مركز'}.`
                        : `Formule enrichie en (${actives1.map(a => a.name).join(', ')}). Idéal pour cibler spécifiquement : ${actives1[0]?.benefit.FR || 'les besoins cutanés intenses'}.`
                      : isRTL
                        ? 'مستحضر عناية يركز على الترطيب والتهدئة اليومية.'
                        : 'Soin dermique équilibré axé sur l\'hydratation et le confort quotidien.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-teal-400">
                    {product2.brand} — {product2.title}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {actives2.length > 0
                      ? isRTL
                        ? `يتميز بتركيز عالي من (${actives2.map(a => a.name).join(', ')}). ممتاز للبشرة التي تحتاج إلى ${actives2[0]?.benefit.AR || 'علاج مركز'}.`
                        : `Formule enrichie en (${actives2.map(a => a.name).join(', ')}). Idéal pour cibler spécifiquement : ${actives2[0]?.benefit.FR || 'les besoins cutanés intenses'}.`
                      : isRTL
                        ? 'مستحضر عناية يركز على الترطيب والتهدئة اليومية.'
                        : 'Soin dermique équilibré axé sur l\'hydratation et le confort quotidien.'}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Section B: In-Depth Metrics Table ── */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
              <div className="p-5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>{isRTL ? 'مصفوفة التحليل المقارن الكاملة' : 'MATRICE DE COMPARAISON COMPLÈTE'}</span>
                </h3>
                <span className="text-[10px] font-bold text-slate-400 font-mono">100% Conforme Dermo-Cosmétique</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">

                {/* Metric 1: Prix & Contenance */}
                <div className="grid grid-cols-3 p-4 hover:bg-slate-50/50 transition items-center">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px] font-mono">
                    {isRTL ? 'السعر وحجم العبوة' : 'Prix & Contenance'}
                  </div>
                  <div className="font-bold text-slate-900 text-center md:text-left">
                    <span className="text-sm font-black">{convertPrice(product1.price)}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{vol1} ml ({pricePerMl1} DH/ml)</span>
                  </div>
                  <div className="font-bold text-slate-900 text-center md:text-left">
                    <span className="text-sm font-black">{convertPrice(product2.price)}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{vol2} ml ({pricePerMl2} DH/ml)</span>
                  </div>
                </div>

                {/* Metric 2: Actifs Dermatologiques */}
                <div className="grid grid-cols-3 p-4 hover:bg-slate-50/50 transition items-start">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px] font-mono pt-1">
                    {isRTL ? 'المكونات الفعالة' : 'Actifs Clefs'}
                  </div>
                  <div className="space-y-1.5">
                    {actives1.length > 0 ? (
                      actives1.map((act, i) => (
                        <span key={i} className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10.5px] font-bold border border-emerald-200/60 mr-1 mb-1">
                          {act.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">Non spécifiés</span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {actives2.length > 0 ? (
                      actives2.map((act, i) => (
                        <span key={i} className="inline-block px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-[10.5px] font-bold border border-teal-200/60 mr-1 mb-1">
                          {act.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">Non spécifiés</span>
                    )}
                  </div>
                </div>

                {/* Metric 3: Évaluation Clients */}
                <div className="grid grid-cols-3 p-4 hover:bg-slate-50/50 transition items-center">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px] font-mono">
                    {isRTL ? 'تقييم العميلات' : 'Évaluation Client'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="font-black text-slate-800">4.9/5</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="font-black text-slate-800">4.8/5</span>
                  </div>
                </div>

                {/* Metric 4: Tolérance & Peaux Sensibles */}
                <div className="grid grid-cols-3 p-4 hover:bg-slate-50/50 transition items-center">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px] font-mono">
                    {isRTL ? 'ملاءمة البشرة الحساسة' : 'Peaux Sensibles'}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{isRTL ? 'مختبر سريرياً' : 'Haute Tolérance'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{isRTL ? 'مختبر سريرياً' : 'Haute Tolérance'}</span>
                  </div>
                </div>

                {/* Metric 5: Stock & Disponibilité */}
                <div className="grid grid-cols-3 p-4 hover:bg-slate-50/50 transition items-center">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px] font-mono">
                    {isRTL ? 'التوفر للشحن' : 'Disponibilité'}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px] w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>En Stock (Livraison 24h)</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px] w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>En Stock (Livraison 24h)</span>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Section C: Add Both Duo Banner ── */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-200">
                  {isRTL ? 'عرض الثنائي السريري المتكامل' : 'OFFRE DUO COMPLÉMENTAIRE'}
                </span>
                <h3 className="text-lg md:text-xl font-black tracking-tight">
                  {isRTL ? 'طلب المستحضرين معاً لشحن مجاني وهدية' : 'Commander les 2 Soins en Duo (Livraison Offerte)'}
                </h3>
                <p className="text-xs text-white/80 max-w-xl">
                  {isRTL
                    ? 'اجتمعي بين فوائد المستحضرين لبناء روتين صباحي ومسائي متكامل.'
                    : 'Associez le soin de jour et le soin de nuit pour maximiser l\'efficacité dermatologique.'}
                </p>
              </div>

              <button
                onClick={() => {
                  addToCart(product1);
                  addToCart(product2);
                }}
                className="px-8 py-4 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black text-xs uppercase tracking-widest transition shadow-lg shrink-0 cursor-pointer active:scale-95 flex items-center gap-2.5"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>{isRTL ? 'إضافة الثنائي للسلة' : 'Ajouter le Duo au Panier'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (
          /* Empty state prompt */
          <div className="max-w-xl mx-auto text-center py-8 px-4">
            <p className="text-xs text-slate-400 font-medium">
              {isRTL
                ? 'حددي منتجين أعلاه لبدء تحليل المكونات والخصائص الطبية المباشرة.'
                : 'Sélectionnez deux soins ci-dessus pour déclencher l\'analyse clinique détaillée.'}
            </p>
          </div>
        )}

      </div>
    </ShopShell>
  );
}
