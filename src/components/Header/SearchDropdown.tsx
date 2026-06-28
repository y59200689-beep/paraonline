'use client';

import React from 'react';
import { Search, ShoppingBag, Sparkles, X } from 'lucide-react';
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
        /* Trending & AI shortcuts */
        <div className="p-4 space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 block mb-2 px-0.5 text-left">
              {language === 'FR' ? 'RECHERCHES POPULAIRES' : 'الأكثر بحثاً'}
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { fr: 'Garnier UV', query: 'Garnier' },
                { fr: 'Rétinol', query: 'retinol' },
                { fr: 'Anua', query: 'Anua' },
                { fr: 'Solaire', query: 'solaire' },
              ].map((term) => (
                <button
                  key={term.query}
                  onClick={() => onSetSearchQuery(term.query)}
                  className="px-3.5 py-1.5 bg-slate-50 border border-slate-100/60 hover:bg-primary/5 hover:border-primary/20 text-slate-500 hover:text-primary text-[11px] font-medium rounded-lg transition-all duration-200 cursor-pointer"
                >
                  {term.fr}
                </button>
              ))}
            </div>
          </div>

          <div
            onClick={onOpenDiagnostic}
            className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-xl cursor-pointer hover:border-primary/20 hover:from-primary/8 hover:to-accent/8 transition-all duration-300 group text-left flex items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary fill-primary/15 animate-pulse group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[11px] font-black text-primary-dark uppercase tracking-wider">
                  {language === 'FR' ? 'Diagnostic Clinique IA' : 'فحص البشرة بالذكاء الاصطناعي'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                {language === 'FR'
                  ? 'Analysez votre type de peau et obtenez votre pack à -15%'
                  : 'حللي نوع بشرتكِ واحصلي على خصم 15% على روتينكِ'}
              </p>
            </div>
            <span className="px-3.5 py-1.5 bg-white border border-primary/25 text-primary text-[9px] font-black tracking-widest uppercase rounded-lg shadow-sm transition-all duration-300 group-hover:bg-primary group-hover:text-white shrink-0">
              {language === 'FR' ? 'Lancer' : 'ابدأ'}
            </span>
          </div>
        </div>
      ) : (
        /* Search Results */
        <div>
          {matchedIngredients.length > 0 && (
            <div className="border-b border-slate-100 p-3 bg-slate-50/50">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-2 px-1 text-left">
                {language === 'FR' ? 'ACTIFS DERMATOLOGIQUES' : 'مكونات علاجية نشطة'}
              </span>
              <div className="flex flex-col gap-1.5">
                {matchedIngredients.map(key => {
                  const ing = INGREDIENTS_GLOSSARY[key];
                  return (
                    <div
                      key={key}
                      onClick={() => onIngredientClick(key)}
                      className="flex items-center justify-between p-2 rounded-xl border border-border/30 hover:border-primary/20 bg-white hover:bg-primary/5 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          {ing.icon}
                        </span>
                        <div className={`min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <span className="text-xs font-extrabold text-primary-dark block leading-none">
                            {language === 'FR' ? ing.name_fr : ing.name_ar}
                          </span>
                          <span className="text-[9px] text-foreground/60 block mt-0.5 capitalize truncate">
                            {language === 'FR' ? ing.benefit_fr : ing.benefit_ar}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold text-accent shrink-0 border border-accent/20 px-2 py-0.5 rounded-md hover:bg-accent hover:text-white transition-colors">
                        {language === 'FR' ? 'Encyclopédie' : 'القاموس'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
            matchedIngredients.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-xs">
                {language === 'FR' ? 'Aucun résultat trouvé' : 'لم يتم العثور على نتائج'}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
