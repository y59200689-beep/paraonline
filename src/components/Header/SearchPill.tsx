'use client';

import React from 'react';
import { Search, X, ChevronDown, LayoutGrid } from 'lucide-react';
import styles from './Header.module.css';
import { SearchDropdown } from './SearchDropdown';
import { Product } from '@/lib/data';

const CATEGORIES = [
  { id: 'all',     labelFR: 'Toutes les catégories',       labelAR: 'جميع الفئات' },
  { id: 'bebe',    labelFR: 'Pédiatrie & Maternité',   labelAR: 'صحة الرضيع والأم' },
  { id: 'solaire', labelFR: 'Protections Solaires',    labelAR: 'الوقاية من الشمس' },
  { id: 'visage',  labelFR: 'Soins du Visage',         labelAR: 'العناية بالوجه' },
  { id: 'cheveux', labelFR: 'Soins Capillaires',       labelAR: 'العناية بالشعر' },
  { id: 'kbeauty', labelFR: 'K-Beauty',                labelAR: 'الجمال الكوري' },
];

interface SearchPillProps {
  searchRef: React.RefObject<HTMLDivElement | null>;
  categoryRef: React.RefObject<HTMLDivElement | null>;
  language: string;
  isRTL: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showSearch: boolean;
  setShowSearch: (v: boolean) => void;
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
  showCategoryDropdown: boolean;
  setShowCategoryDropdown: (v: boolean) => void;
  hoveredCategoryId: string | null;
  setHoveredCategoryId: (id: string | null) => void;
  searchResults: Product[];
  matchedIngredients: string[];
  convertPrice: (price: number) => string;
  onSuggestionClick: (p: Product) => void;
  onIngredientClick: (key: string) => void;
  onQuickAdd: (e: React.MouseEvent, p: Product) => void;
  onOpenDiagnostic: () => void;
}

export const SearchPill: React.FC<SearchPillProps> = ({
  searchRef,
  categoryRef,
  language,
  isRTL,
  searchQuery,
  setSearchQuery,
  showSearch,
  setShowSearch,
  selectedCategoryId,
  setSelectedCategoryId,
  showCategoryDropdown,
  setShowCategoryDropdown,
  hoveredCategoryId,
  setHoveredCategoryId,
  searchResults,
  matchedIngredients,
  convertPrice,
  onSuggestionClick,
  onIngredientClick,
  onQuickAdd,
  onOpenDiagnostic,
}) => {
  const currentCategory = CATEGORIES.find((c) => c.id === selectedCategoryId) || CATEGORIES[0];
  const selectedCategoryLabel = language === 'FR' ? currentCategory.labelFR : currentCategory.labelAR;

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
    <div ref={searchRef} className={styles.search}>
      <div className={styles.searchRow}>
        {/* Category selector */}
        <div ref={categoryRef} className="relative shrink-0 flex items-center">
          <button
            type="button"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className={styles.category}
            aria-expanded={showCategoryDropdown}
            aria-label={selectedCategoryLabel}
          >
            <LayoutGrid className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{selectedCategoryLabel}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                showCategoryDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showCategoryDropdown && (
            <div
              className={`absolute ${isRTL ? 'right-0' : 'left-0'} top-full z-50 w-56 text-left animate-in fade-in slide-in-from-top-2 duration-200`}
              style={{
                padding: '6px',
                marginTop: '8px',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                border: '1px solid #f1f5f9',
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
              }}
            >
              {CATEGORIES.map((cat, idx) => {
                const isActive = selectedCategoryId === cat.id;
                const isHovered = hoveredCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onMouseEnter={() => setHoveredCategoryId(cat.id)}
                    onMouseLeave={() => setHoveredCategoryId(null)}
                    onClick={() => { setSelectedCategoryId(cat.id); setShowCategoryDropdown(false); }}
                    className={`w-full flex items-center transition-all duration-200 cursor-pointer ${isRTL ? 'text-right' : 'text-left'}`}
                    style={{
                      paddingLeft: '16px', paddingRight: '16px',
                      paddingTop: '10px', paddingBottom: '10px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: isActive ? '700' : '500',
                      color: isActive ? 'var(--brand-secondary-ink)' : isHovered ? 'var(--color-primary-dark)' : '#475569',
                      backgroundColor: isActive ? 'rgba(15, 30, 54, 0.08)' : isHovered ? '#f8fafc' : 'transparent',
                      marginBottom: idx < CATEGORIES.length - 1 ? '4px' : '0px',
                    }}
                  >
                    <span className="truncate">{language === 'FR' ? cat.labelFR : cat.labelAR}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Search input */}
        <div className={styles.searchField}>
        <Search className={styles.searchIcon} aria-hidden="true" />
        <input
          type="text"
          aria-label={language === 'FR' ? 'Rechercher des produits' : 'بحث عن المنتجات'}
          placeholder={language === 'FR' ? 'Rechercher des produits, marques, soins…' : 'بحث عن المنتجات...'}
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
          onFocus={() => setShowSearch(true)}
          className={styles.searchInput}
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setShowSearch(false); }}
            aria-label={language === 'FR' ? 'Effacer la recherche' : 'مسح البحث'}
            className={`p-1.5 hover:bg-slate-200/80 rounded-full transition-colors ${isRTL ? 'ml-1' : 'mr-1'}`}
          >
            <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
          </button>
        )}

        {/* Search button */}
        <button
          className={styles.submit}
          aria-label={language === 'FR' ? 'Rechercher' : 'بحث'}
        >
          <Search className="w-6 h-6" aria-hidden="true" />
        </button>
        </div>
      </div>

      {/* Search dropdown */}
      <SearchDropdown {...searchDropdownProps} />
    </div>
  );
};
