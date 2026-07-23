'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCompare } from '@/context/CompareContext';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/data';
import { useProducts } from '@/context/ProductsContext';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import {
  X,
  Scale,
  Trash2,
  Plus,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Star,
  Award,
  Layers,
  Search,
  Maximize2,
  RotateCcw
} from 'lucide-react';

const INGREDIENT_BENEFITS_MAP: { pattern: RegExp; name: string; benefit: { FR: string; AR: string } }[] = [
  { pattern: /hyaluronic acid|hyaluronate/i, name: 'Acide Hyaluronique', benefit: { FR: 'Hydratation profonde', AR: 'ترطيب عميق' } },
  { pattern: /glycolic acid/i, name: 'Acide Glycolique', benefit: { FR: 'Taches & exfoliation', AR: 'البقع والتقشير' } },
  { pattern: /salicylic acid/i, name: 'Acide Salicylique', benefit: { FR: 'Acné & pores', AR: 'حب الشباب والمسام' } },
  { pattern: /niacinamide/i, name: 'Niacinamide', benefit: { FR: 'Teint unifié & pores', AR: 'توحيد لون البشرة' } },
  { pattern: /retinol/i, name: 'Rétinol', benefit: { FR: 'Anti-âge & rides', AR: 'مكافحة التجاعيد' } },
  { pattern: /ascorbic acid|vitamin c/i, name: 'Vitamine C', benefit: { FR: 'Éclat & antioxydant', AR: 'إشراق ومضاد أكسدة' } },
  { pattern: /ceramide/i, name: 'Céramides', benefit: { FR: 'Barrière cutanée', AR: 'ترميم حاجز البشرة' } },
  { pattern: /panthenol|b5/i, name: 'Panthénol (B5)', benefit: { FR: 'Réparation & apaisement', AR: 'إصلاح وتهدئة' } },
];

export const CompareModal: React.FC = () => {
  const { language } = useTranslation();
  const { products } = useProducts();
  const { convertPrice } = useCurrency();
  const { addToCart } = useCart();
  const {
    compareProducts,
    removeFromCompare,
    clearCompare,
    isOpenModal,
    setIsOpenModal,
    addToCompare,
  } = useCompare();

  const [isVisible, setIsVisible] = useState(false);
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [isSearching1, setIsSearching1] = useState(false);
  const [isSearching2, setIsSearching2] = useState(false);

  useEffect(() => {
    if (isOpenModal) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpenModal]);

  if (!isVisible) return null;

  const isRTL = language === 'AR';

  const product1 = compareProducts[0] || null;
  const product2 = compareProducts[1] || null;

  const getActives = (p: Product | null) => {
    if (!p || !p.ingredients) return [];
    return INGREDIENT_BENEFITS_MAP.filter((item) => item.pattern.test(p.ingredients));
  };

  const actives1 = getActives(product1);
  const actives2 = getActives(product2);

  const getVolume = (p: Product | null) => {
    if (!p) return 50;
    const match = (p.title + ' ' + (p.description || '')).match(/(\d+)\s*ml/i);
    return match ? parseInt(match[1], 10) : 50;
  };

  const vol1 = getVolume(product1);
  const vol2 = getVolume(product2);

  const pricePerMl1 = product1 ? (product1.price / vol1).toFixed(2) : '0';
  const pricePerMl2 = product2 ? (product2.price / vol2).toFixed(2) : '0';

  const filtered1 = products.filter(
    (p) =>
      p.id !== product2?.id &&
      (p.title.toLowerCase().includes(search1.toLowerCase()) || p.brand.toLowerCase().includes(search1.toLowerCase()))
  ).slice(0, 6);

  const filtered2 = products.filter(
    (p) =>
      p.id !== product1?.id &&
      (p.title.toLowerCase().includes(search2.toLowerCase()) || p.brand.toLowerCase().includes(search2.toLowerCase()))
  ).slice(0, 6);

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 md:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpenModal(false);
      }}
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <div className="bg-[#FAF9F6] border border-slate-200/90 rounded-[2rem] max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative text-slate-900">
        
        {/* Header */}
        <div className="p-5 md:p-6 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm md:text-base font-black uppercase tracking-tight font-heading text-slate-900">
                  {isRTL ? 'مقارن المستحضرات الطبية' : 'Comparateur Clinique'}
                </h2>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {compareProducts.length}/2
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {isRTL ? 'تحليل ودراسة المكونات الفعالة' : 'Analyse comparative des ingrédients & formules'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/comparateur"
              onClick={() => setIsOpenModal(false)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{isRTL ? 'عرض بكامل الصفحة' : 'Plein écran'}</span>
            </Link>

            {compareProducts.length > 0 && (
              <button
                onClick={() => clearCompare()}
                className="p-2 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                title={isRTL ? 'إفراغ' : 'Vider'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setIsOpenModal(false)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="overflow-y-auto p-5 md:p-6 space-y-6">

          {/* Slots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            
            {/* Slot 1 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm relative">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
                PRODUIT 01
              </span>
              {product1 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 relative bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100 p-1">
                      <Image src={getOptimizedImageUrl(product1.image, 150)} alt={product1.title} fill className="object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold text-emerald-600 font-mono uppercase">{product1.brand}</span>
                      <h4 className="text-xs font-black text-slate-800 line-clamp-2 leading-tight">{product1.title}</h4>
                      <p className="text-xs font-bold text-slate-900 mt-1">{convertPrice(product1.price)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSearching1(!isSearching1)}
                    className="w-full py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10.5px] font-bold transition flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    <span>Changer de soin</span>
                  </button>
                </div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <Plus className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">Ajouter le Produit 1</p>
                  <button
                    onClick={() => setIsSearching1(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10.5px] font-bold uppercase tracking-wider"
                  >
                    Choisir
                  </button>
                </div>
              )}

              {isSearching1 && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                  <input
                    type="text"
                    value={search1}
                    onChange={(e) => setSearch1(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border text-xs"
                  />
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {filtered1.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (product1) removeFromCompare(product1.id);
                          addToCompare(p);
                          setIsSearching1(false);
                        }}
                        className="w-full text-left p-1.5 text-xs font-medium hover:bg-emerald-50 rounded truncate"
                      >
                        {p.title} ({p.brand})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Slot 2 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm relative">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
                PRODUIT 02
              </span>
              {product2 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 relative bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100 p-1">
                      <Image src={getOptimizedImageUrl(product2.image, 150)} alt={product2.title} fill className="object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold text-teal-600 font-mono uppercase">{product2.brand}</span>
                      <h4 className="text-xs font-black text-slate-800 line-clamp-2 leading-tight">{product2.title}</h4>
                      <p className="text-xs font-bold text-slate-900 mt-1">{convertPrice(product2.price)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSearching2(!isSearching2)}
                    className="w-full py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10.5px] font-bold transition flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    <span>Changer de soin</span>
                  </button>
                </div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <Plus className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">Ajouter le Produit 2</p>
                  <button
                    onClick={() => setIsSearching2(true)}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-[10.5px] font-bold uppercase tracking-wider"
                  >
                    Choisir
                  </button>
                </div>
              )}

              {isSearching2 && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                  <input
                    type="text"
                    value={search2}
                    onChange={(e) => setSearch2(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border text-xs"
                  />
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {filtered2.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (product2) removeFromCompare(product2.id);
                          addToCompare(p);
                          setIsSearching2(false);
                        }}
                        className="w-full text-left p-1.5 text-xs font-medium hover:bg-teal-50 rounded truncate"
                      >
                        {p.title} ({p.brand})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Matrix preview */}
          {product1 && product2 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden text-xs divide-y divide-slate-100">
              <div className="grid grid-cols-3 p-3 bg-slate-50 font-mono font-bold text-[10px] uppercase text-slate-500">
                <span>Critère Clinique</span>
                <span>{product1.brand}</span>
                <span>{product2.brand}</span>
              </div>
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="font-bold text-slate-500">Prix au ml</span>
                <span className="font-mono text-slate-800">{pricePerMl1} DH/ml</span>
                <span className="font-mono text-slate-800">{pricePerMl2} DH/ml</span>
              </div>
              <div className="grid grid-cols-3 p-3 items-start">
                <span className="font-bold text-slate-500">Actifs Majeurs</span>
                <div className="space-y-1">
                  {actives1.map((a, i) => (
                    <span key={i} className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[9.5px] font-bold mr-1">
                      {a.name}
                    </span>
                  ))}
                </div>
                <div className="space-y-1">
                  {actives2.map((a, i) => (
                    <span key={i} className="inline-block px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 text-[9.5px] font-bold mr-1">
                      {a.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        {product1 && product2 && (
          <div className="p-4 bg-white border-t border-slate-200/80 flex items-center justify-between shrink-0">
            <Link
              href="/comparateur"
              onClick={() => setIsOpenModal(false)}
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
            >
              <span>{isRTL ? 'فتح صفحة المقارنة الكاملة' : 'Voir le rapport clinique détaillé'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => {
                addToCart(product1);
                addToCart(product2);
                setIsOpenModal(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isRTL ? 'إضافة الثنائي للسلة' : 'Ajouter le Duo au Panier'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
