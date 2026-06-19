'use client';

import React from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { SearchDropdown } from './SearchDropdown';
import { Product } from '@/lib/data';

const CATEGORIES = [
  { id: 'all',     labelFR: 'Toutes catégories',       labelAR: 'جميع الفئات' },
  { id: 'bebe',    labelFR: 'Pédiatrie & Maternité',   labelAR: 'صحة الرضيع والأم' },
  { id: 'solaire', labelFR: 'Protections Solaires',    labelAR: 'الوقاية من الشمس' },
  { id: 'visage',  labelFR: 'Soins du Visage',         labelAR: 'العناية بالوجه' },
  { id: 'cheveux', labelFR: 'Soins Capillaires',       labelAR: 'العناية بالشعر' },
  { id: 'kbeauty', labelFR: 'K-Beauty Clinique',       labelAR: 'الجمال الكوري العيادي' },
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
    <div ref={searchRef} className="flex-1 w-full justify-self-center relative" style={{ maxWidth: '820px' }}>
      <div
        className="flex items-center h-[52px] rounded-xl transition-all duration-300"
        style={{
          paddingLeft: isRTL ? '16px' : '24px',
          paddingRight: isRTL ? '24px' : '16px',
          paddingTop: '6px',
          paddingBottom: '6px',
          backgroundColor: '#f1f5f9',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 2px 16px rgba(0,0,0,0.03)',
        }}
      >
        {/* Category selector */}
        <div ref={categoryRef} className="relative shrink-0 flex items-center">
          <button
            type="button"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="bg-transparent hover:bg-slate-100 text-slate-500 hover:text-slate-800 font-bold text-[12.5px] rounded-lg flex items-center gap-2 transition-all cursor-pointer active:scale-97"
            style={{ paddingLeft: '8px', paddingRight: '14px', paddingTop: '8px', paddingBottom: '8px' }}
          >
            <span className="truncate max-w-[110px]">{selectedCategoryLabel}</span>
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
                      color: isActive ? 'var(--color-primary)' : isHovered ? 'var(--color-primary-dark)' : '#475569',
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

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 mx-2 shrink-0" />

        {/* Search input */}
        <input
          type="text"
          placeholder={language === 'FR' ? 'Rechercher des produits...' : 'بحث عن المنتجات...'}
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
          onFocus={() => setShowSearch(true)}
          className="flex-1 bg-transparent text-[13.5px] text-slate-700 placeholder-slate-400 focus:outline-none min-w-0 py-2"
          style={{ paddingLeft: isRTL ? '24px' : '14px', paddingRight: isRTL ? '14px' : '24px' }}
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
          className="w-10 h-10 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shrink-0 flex items-center justify-center border-0 outline-none"
          aria-label={language === 'FR' ? 'Rechercher' : 'بحث'}
          style={{ backgroundColor: '#0F1E36', boxShadow: '0 2px 8px rgba(15,30,54,0.25)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#091120')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0F1E36')}
        >
          <Search className="w-4 h-4" style={{ color: '#ffffff', stroke: '#ffffff' }} />
        </button>
      </div>

      {/* Search dropdown */}
      <SearchDropdown {...searchDropdownProps} />
    </div>
  );
};
