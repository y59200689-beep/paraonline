'use client';

import React from 'react';
import { Search, ShoppingBag, X } from 'lucide-react';
import Image from 'next/image';
import { Product, INGREDIENTS_GLOSSARY } from '@/lib/data';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';

const placeholderSvg = "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='100%' height='100%'><rect width='100%' height='100%' fill='#f1f5f9'/><path d='M150 100a40 40 0 1 0 40 40 40 40 0 0 0-40-40zm0 60a20 20 0 1 1 20-20 20 20 0 0 1-20 20z' fill='#94a3b8'/><path d='M180 180h-60a10 10 0 0 0-10 10v10h80v-10a10 10 0 0 0-10-10z' fill='#94a3b8'/><text x='150' y='230' font-family='sans-serif' font-size='12' font-weight='bold' fill='#64748b' text-anchor='middle'>Image Indisponible</text></svg>");

interface SearchDropdownProps {
  showSearch: boolean;
  searchQuery: string;
  searchResults: Product[];
  matchedIngredients: string[];
  language: string;
  isRTL: boolean;
  convertPrice: (p: number) => string;
  onSuggestionClick: (product: Product) => void;
  onIngredientClick: (key: string) => void;
  onQuickAdd: (e: React.MouseEvent, product: Product) => void;
  onOpenDiagnostic: () => void;
  onSetSearchQuery: (q: string) => void;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  showSearch,
  searchQuery,
  searchResults,
  matchedIngredients,
  language,
  isRTL,
  convertPrice,
  onSuggestionClick,
  onIngredientClick,
  onQuickAdd,
  onOpenDiagnostic,
  onSetSearchQuery,
}) => {
  if (!showSearch) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-3 bg-white/98 backdrop-blur-md border border-slate-200/80 rounded-xl shadow-[0_12px_40px_rgba(26,37,93,0.06)] z-50 overflow-hidden w-full text-left animate-in fade-in slide-in-from-top-2 duration-200">
      {!searchQuery.trim() ? (
        /* Trending & AI shortcuts + All available products */
        <div className="flex flex-col">


          {searchResults.length > 0 && (
            <div className="max-h-[320px] overflow-y-auto pr-0.5">
              <div className={`px-4 py-2 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'FR' ? '️ PRODUITS DISPONIBLES' : '️ المنتجات المتاحة'}
              </div>
              <ul>
                {searchResults.map(product => (
                  <li
                    key={product.id}
                    onClick={() => onSuggestionClick(product)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden relative">
                      <Image src={getOptimizedImageUrl(product.image) || placeholderSvg} alt={product.title} fill sizes="40px" className="object-cover" />
                    </div>
                    <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span className="text-[8px] font-extrabold uppercase text-[#846f48] block leading-none">{product.vendor}</span>
                      <span className="text-xs font-bold text-primary-dark truncate block mt-0.5">{product.title}</span>
                      <span className="text-[10px] font-black text-accent block mt-0.5">{convertPrice(product.price)}</span>
                    </div>
                    <button
                      onClick={(e) => onQuickAdd(e, product)}
                      className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white flex items-center justify-center transition-all duration-300 shrink-0 border border-primary/10"
                      title="Ajouter au Panier"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        /* Search Results */
        <div>

          {searchResults.length > 0 ? (
            <div className="max-h-[320px] overflow-y-auto pr-0.5">
              <div className={`px-4 py-2 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'FR' ? '️ PRODUITS EN STOCK' : '️ En Stock'}
              </div>
              <ul>
                {searchResults.map(product => (
                  <li
                    key={product.id}
                    onClick={() => onSuggestionClick(product)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden relative">
                      <Image src={getOptimizedImageUrl(product.image) || placeholderSvg} alt={product.title} fill sizes="40px" className="object-cover" />
                    </div>
                    <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span className="text-[8px] font-extrabold uppercase text-[#846f48] block leading-none">{product.vendor}</span>
                      <span className="text-xs font-bold text-primary-dark truncate block mt-0.5">{product.title}</span>
                      <span className="text-[10px] font-black text-accent block mt-0.5">{convertPrice(product.price)}</span>
                    </div>
                    <button
                      onClick={(e) => onQuickAdd(e, product)}
                      className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white flex items-center justify-center transition-all duration-300 shrink-0 border border-primary/10"
                      title="Ajouter au Panier"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs">
              {language === 'FR' ? 'Aucun résultat trouvé' : 'لم يتم العثور على نتائج'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
