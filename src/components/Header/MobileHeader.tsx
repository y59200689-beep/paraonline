'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ShoppingBag, Globe, X } from 'lucide-react';
import { SearchDropdown } from './SearchDropdown';
import { Product } from '@/lib/data';

interface MobileHeaderProps {
  language: string;
  cartCount: number;
  isBumping: boolean;
  searchRef: React.RefObject<HTMLDivElement | null>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showSearch: boolean;
  setShowSearch: (v: boolean) => void;
  searchResults: Product[];
  matchedIngredients: string[];
  convertPrice: (price: number) => string;
  onCartOpen: () => void;
  onToggleLanguage: () => void;
  onSuggestionClick: (p: Product) => void;
  onIngredientClick: (key: string) => void;
  onQuickAdd: (e: React.MouseEvent, p: Product) => void;
  onOpenDiagnostic: () => void;
  t: (key: string) => string;
  isRTL: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  language,
  cartCount,
  isBumping,
  searchRef,
  searchQuery,
  setSearchQuery,
  showSearch,
  setShowSearch,
  searchResults,
  matchedIngredients,
  convertPrice,
  onCartOpen,
  onToggleLanguage,
  onSuggestionClick,
  onIngredientClick,
  onQuickAdd,
  onOpenDiagnostic,
  t,
  isRTL,
}) => {
  const searchDropdownProps = {
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
    onSetSearchQuery: (q: string) => { setSearchQuery(q); setShowSearch(true); },
  };

  return (
    <div className="flex flex-col md:hidden gap-3">
      {/* Mobile top row */}
      <div className="w-full flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center group active:scale-98 transition-transform duration-300 shrink-0"
        >
          <Image
            src="/images/logo.png"
            alt="Para Officinal S.A"
            width={120}
            height={32}
            loading="eager"
            className="object-contain"
          />
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLanguage}
            className="h-10 px-3 rounded-xl flex items-center justify-center gap-1 hover:bg-slate-50 active:scale-95 text-primary transition-all duration-300 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-secondary animate-pulse" />
            <span className="text-[11px] font-extrabold">{t('lang_toggle')}</span>
          </button>

          <button
            onClick={onCartOpen}
            aria-label={language === 'FR' ? 'Voir mon panier' : 'عرض السلة'}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-50 active:scale-95 text-primary transition-all duration-300 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span
                className={`absolute top-1.5 right-1.5 w-4 h-4 bg-accent text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white ${
                  isBumping ? 'cart-badge-bump' : ''
                }`}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      <div ref={searchRef} className="relative w-full">
        <div className="flex items-center gap-2 bg-slate-50/70 border border-slate-200 rounded-2xl px-4 py-2.5 h-[48px] focus-within:border-primary/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
          <Search className="w-4 h-4 text-foreground/60 shrink-0" />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none min-w-0"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setShowSearch(false); }}
              aria-label={language === 'FR' ? 'Effacer la recherche' : 'مسح البحث'}
            >
              <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>

        <SearchDropdown {...searchDropdownProps} />
      </div>
    </div>
  );
};
