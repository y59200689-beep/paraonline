/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/data';
import { ProductCard } from './ProductCard';
import { useTranslation } from '@/context/LanguageContext';
import { useAmPm } from '@/context/AmPmContext';
import { Grid, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const matchesConcern = (product: Product, concern: string) => {
  const text = `${product.title} ${product.nameFr || ''} ${product.description} ${product.tags.join(' ')}`.toLowerCase();
  const ingredients = product.ingredients.toLowerCase();
  
  if (concern === 'acne') {
    return text.includes('acné') || text.includes('imperfection') || text.includes('bouton') || ingredients.includes('salicylic acid') || product.id === 3 || product.id === 22 || product.id === 15 || product.id === 16 || product.id === 17;
  }
  if (concern === 'spots') {
    return text.includes('tache') || text.includes('éclat') || text.includes('bright') || text.includes('pigment') || ingredients.includes('tranexamic') || ingredients.includes('ascorbic') || product.id === 3 || product.id === 14;
  }
  if (concern === 'dryness') {
    return text.includes('déshydrat') || text.includes('sec') || text.includes('hydrat') || ingredients.includes('hyaluronic') || product.id === 5 || product.id === 6 || product.id === 7 || product.id === 17;
  }
  if (concern === 'wrinkles') {
    return text.includes('ridule') || text.includes('âge') || text.includes('anti-aging') || text.includes('vieill') || ingredients.includes('retinol') || product.id === 8 || product.id === 5 || product.id === 6;
  }
  if (concern === 'redness') {
    return text.includes('rougeur') || text.includes('apais') || text.includes('sensible') || text.includes('sooth') || ingredients.includes('centella') || ingredients.includes('heartleaf') || product.id === 17 || product.id === 16 || product.id === 15;
  }
  return true;
};

const matchesIngredient = (product: Product, ingredient: string) => {
  const ingStr = product.ingredients.toLowerCase();
  const nameStr = `${product.title} ${product.nameFr || ''} ${product.description}`.toLowerCase();
  
  if (ingredient === 'niacinamide') {
    return ingStr.includes('niacinamide') || nameStr.includes('niacinamide') || product.id === 14 || product.id === 3 || product.id === 16;
  }
  if (ingredient === 'centella') {
    return ingStr.includes('centella') || ingStr.includes('madécassoside') || nameStr.includes('centella') || product.id === 17 || product.id === 16 || product.id === 14;
  }
  if (ingredient === 'retinol') {
    return ingStr.includes('retinol') || ingStr.includes('retinal') || nameStr.includes('retinol') || product.id === 8;
  }
  if (ingredient === 'vitamine_c') {
    return ingStr.includes('ascorbic') || ingStr.includes('ascorbyl') || nameStr.includes('vitamine c') || nameStr.includes('vitamin c') || product.id === 3 || product.id === 14;
  }
  if (ingredient === 'hyaluronic') {
    return ingStr.includes('hyaluronate') || ingStr.includes('hyaluronic') || nameStr.includes('hyaluronique') || product.id === 7 || product.id === 5 || product.id === 6 || product.id === 17;
  }
  if (ingredient === 'tranexamic') {
    return ingStr.includes('tranexamic') || nameStr.includes('tranexamique') || product.id === 14 || product.id === 16;
  }
  if (ingredient === 'squalane') {
    return ingStr.includes('squalane') || nameStr.includes('squalane') || product.id === 5;
  }
  if (ingredient === 'salicylic') {
    return ingStr.includes('salicylic') || nameStr.includes('salicylique') || product.id === 3 || product.id === 22;
  }
  return true;
};

import { useUi } from '@/context/UiContext';

interface ProductGridProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenQuickView: (product: Product) => void;
  pinnedProductIds?: number[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ activeCategory, onSelectCategory, onOpenQuickView, pinnedProductIds = [] }) => {
  const { language } = useTranslation();
  const { amPmState } = useAmPm();
  const { 
    activeConcern, 
    setActiveConcern, 
    activeIngredient, 
    setActiveIngredient 
  } = useUi();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeCategory, activeConcern, activeIngredient]);

  useEffect(() => {
    setIsLoading(true);
    let active = true;

    const fetchProducts = async () => {
      try {
        let list: Product[] = [];
        let pinnedList: Product[] = [];
        const isDefaultFilter = activeCategory === 'all' && activeConcern === 'all' && activeIngredient === 'all';

        // If on page 1 and there are pinned products, fetch them first
        if (page === 1 && isDefaultFilter && pinnedProductIds.length > 0) {
          try {
            const pinnedRes = await fetch(`/api/products?ids=${pinnedProductIds.join(',')}`);
            const pinnedData = await pinnedRes.json();
            if (pinnedData.success && pinnedData.products) {
              pinnedList = pinnedData.products;
            }
          } catch (e) {
            console.error("Failed to fetch pinned products:", e);
          }
        }

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: '15',
          category: activeCategory,
          concern: activeConcern,
          ingredient: activeIngredient,
        });

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        const data = await res.json();
        
        if (active && data.success) {
          const fetchedList = [...(data.products || [])];
          // Re-order general catalog products so matching routine context appears first
          const isAM = amPmState === 'am';
          fetchedList.sort((a, b) => {
            const isDayA = a.tags.includes('solaire') || a.tags.includes('jour') || a.nameFr?.toLowerCase().includes('solaire') || a.nameFr?.toLowerCase().includes('vitamine c') || a.id === 3 || a.id === 7 || a.id === 14 || a.id === 17 || a.id === 13 || a.id === 1;
            const isNightA = a.tags.includes('nuit') || a.nameFr?.toLowerCase().includes('nuit') || a.nameFr?.toLowerCase().includes('night') || a.id === 8 || a.id === 5 || a.id === 22 || a.id === 15 || a.id === 16 || a.id === 6;

            const isDayB = b.tags.includes('solaire') || b.tags.includes('jour') || b.nameFr?.toLowerCase().includes('solaire') || b.nameFr?.toLowerCase().includes('vitamine c') || b.id === 3 || b.id === 7 || b.id === 14 || b.id === 17 || b.id === 13 || b.id === 1;
            const isNightB = b.tags.includes('nuit') || b.nameFr?.toLowerCase().includes('nuit') || b.nameFr?.toLowerCase().includes('night') || b.id === 8 || b.id === 5 || b.id === 22 || b.id === 15 || b.id === 16 || b.id === 6;

            const matchA = isAM ? isDayA && !isNightA : isNightA && !isDayA;
            const matchB = isAM ? isDayB && !isNightB : isNightB && !isDayB;

            if (matchA && !matchB) return -1;
            if (!matchA && matchB) return 1;
            return 0;
          });

          // Merge pinned products at the start of page 1, avoiding duplicates
          if (page === 1 && pinnedList.length > 0) {
            // Sort pinnedList to match the exact order of pinnedProductIds in the admin
            const pinnedOrderMap = new Map(pinnedProductIds.map((id, index) => [id, index]));
            pinnedList.sort((a, b) => (pinnedOrderMap.get(a.id) ?? 999) - (pinnedOrderMap.get(b.id) ?? 999));

            const pinnedIds = new Set(pinnedList.map(p => p.id));
            const filteredFetched = fetchedList.filter(p => !pinnedIds.has(p.id));
            list = [...pinnedList, ...filteredFetched].slice(0, 15);
          } else {
            list = fetchedList;
          }

          setFilteredProducts(list);
          setTotalPages(data.pagination?.totalPages || 1);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchProducts();
    return () => {
      active = false;
    };
  }, [activeCategory, amPmState, activeConcern, activeIngredient, page, pinnedProductIds]);

  return (
    <div
      className="border-t border-b border-slate-200/40 relative overflow-hidden bg-[#FAFAFA]"
      style={{ 
        paddingTop: '64px', 
        paddingBottom: '48px'
      }}
    >
      {/* Delicate background ambient halos */}
      <div className="absolute top-1/4 -left-64 w-[500px] h-[300px] rounded-full bg-accent/8 blur-3xl pointer-events-none animate-morph-blob" />
      <div className="absolute bottom-1/4 -right-64 w-[450px] h-[250px] rounded-full bg-primary/5 blur-3xl pointer-events-none animate-morph-blob" style={{ animationDelay: '-4s' }} />
      <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-slate-100 pb-5 gap-6 select-none font-sans">
          <div className="flex flex-col gap-2">
            {/* Eyebrow tag */}
            <div className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-[1px] bg-primary inline-block" />
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                {language === 'FR' ? 'Offres & Sélection' : 'العروض والمختارات'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black font-heading text-primary-dark tracking-tight leading-tight">
              {language === 'FR' ? 'Produits Vedettes' : 'المنتجات المميزة'}
            </h2>
          </div>

          {/* See All link */}
          <Link 
            href="/products" 
            className="text-xs md:text-sm font-black text-primary hover:text-accent transition-colors duration-300 flex items-center gap-1 shrink-0 cursor-pointer self-end md:self-auto"
          >
            {language === 'FR' ? 'Voir tout' : 'عرض الكل'}
            <ChevronRight className={`w-4 h-4 ${language === 'AR' ? 'rotate-180' : ''}`} />
          </Link>
        </div>

        {/* Skeleton loaders */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6" style={{ marginTop: '36px' }}>
            {Array.from({ length: 15 }).map((_, id) => (
              <div key={id} className="w-full bg-white border border-border/40 rounded-[10px] overflow-hidden animate-pulse shadow-sm">
                <div className="aspect-square bg-slate-100" />
                <div className="p-4 space-y-3">
                  <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="flex justify-between pt-2">
                    <div className="h-5 bg-slate-100 rounded w-1/3" />
                    <div className="h-8 bg-slate-100 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[10px] border border-dashed border-border/60">
            <Grid className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h3 className="text-base font-black text-primary-dark">
              {language === 'FR' ? 'Aucun produit trouvé' : 'لم يتم العثور على أي منتج'}
            </h3>
            <button
              onClick={() => {
                onSelectCategory('all');
                setActiveConcern('all');
                setActiveIngredient('all');
              }}
              className="mt-4 px-6 py-2.5 bg-primary hover:bg-accent text-white text-xs font-black uppercase tracking-wider rounded-[8px] transition-all cursor-pointer"
            >
              {language === 'FR' ? 'Réinitialiser' : 'إعادة تعيين'}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6" style={{ marginTop: '40px' }}>
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="w-full"
                >
                  <ProductCard product={product} onOpenQuickView={onOpenQuickView} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
