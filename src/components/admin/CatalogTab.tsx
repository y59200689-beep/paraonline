'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { 
  Search, 
  AlertTriangle, 
  Table, 
  Plus, 
  AlertCircle, 
  Edit3, 
  Layers, 
  Globe, 
  Upload, 
  X,
  Check,
  TrendingUp,
  Loader2,
  Download,
  LayoutGrid,
  List,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  RefreshCw,
  Filter,
  ImageOff,
  TrendingDown,
  CalendarClock,
  Percent,
  Coins,
  FileText,
  CheckSquare,
  Trash2,
  FolderPlus,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { Product } from '@/lib/data';
import { useSettings } from '@/context/SettingsContext';
import { useUi } from '@/context/UiContext';
import { useAdminUI } from '@/app/admin/AdminUIContext';
import { StatusBadge, EmptyState } from '@/components/admin/ui';

interface CatalogTabProps {
  catalogStockFilter?: boolean;
  setCatalogStockFilter?: (filter: boolean) => void;
}

interface SearchableDropdownProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  emptyMessage: string;
  adminTheme: 'light' | 'dark';
}

function SearchableDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
  emptyMessage,
  adminTheme
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter(opt => 
      opt.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const selectedDisplay = useMemo(() => {
    if (value === 'all') return label;
    return value.toUpperCase();
  }, [value, label]);

  return (
    <div ref={dropdownRef} className="relative flex-1 min-w-[140px]">
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchQuery('');
        }}
        className={`w-full text-left text-xs h-9 rounded-xl px-3 border cursor-pointer transition flex items-center justify-between gap-1.5 select-none ${
          adminTheme === 'light'
            ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 shadow-sm font-medium'
            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
        }`}
      >
        <span className="truncate">{selectedDisplay}</span>
        <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-60" />
      </button>

      {isOpen && (
        <div className={`absolute left-0 right-0 mt-1 z-50 rounded-xl border p-1.5 shadow-lg space-y-1.5 animate-in fade-in-30 slide-in-from-top-1 duration-150 ${
          adminTheme === 'light' ? 'bg-white border-slate-200/80' : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-[10px] rounded-lg pl-7 pr-2 py-1 outline-none border transition ${
                adminTheme === 'light'
                  ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-100 focus:bg-slate-800'
              }`}
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
            <button
              type="button"
              onClick={() => {
                onChange('all');
                setIsOpen(false);
              }}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors duration-150 ${
                value === 'all'
                  ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                  : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
              }`}
            >
              {label}
            </button>

            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors duration-150 truncate ${
                    value === opt
                      ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                      : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                  }`}
                >
                  {opt.toUpperCase()}
                </button>
              ))
            ) : (
              <div className="text-center text-[10px] py-3 text-slate-400 font-medium">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Searchable & Creatable Brand Combobox ────────────────────────────────── */
interface BrandComboboxProps {
  value: string;
  onChange: (val: string) => void;
  availableVendors: string[];
  adminTheme: 'light' | 'dark';
}

function BrandCombobox({
  value,
  onChange,
  availableVendors,
  adminTheme,
}: BrandComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Combine unique vendors from catalog + popular dermo brands
  const allBrands = useMemo(() => {
    const defaultBrands = [
      'La Roche-Posay', 'CeraVe', 'Vichy', 'Solgar', 'Mixa Bébé', 'Garnier', 
      'Hada Labo', 'Bioderma', 'Avène', 'Skin1004', 'Cosrx', 'Beauty of Joseon', 
      'Nivea', 'Eucerin', 'The Ordinary', 'SVR', 'Uriage', 'A-Derma', 'Ducray', 
      'Mustela', 'Kérastase', 'L\'Oréal Professionnel', 'Filorga', 'Isdin', 'Cetaphil'
    ];
    const set = new Set<string>();
    availableVendors.forEach(v => v && v.trim() && set.add(v.trim()));
    defaultBrands.forEach(b => set.add(b));
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [availableVendors]);

  // Filter brands based on query
  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return allBrands;
    const q = searchQuery.toLowerCase();
    return allBrands.filter(b => b.toLowerCase().includes(q));
  }, [allBrands, searchQuery]);

  // Check if query exactly matches an existing brand
  const exactMatch = searchQuery.trim() && allBrands.some(b => b.toLowerCase() === searchQuery.trim().toLowerCase());

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setSearchQuery('');
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const handleSelect = (brand: string) => {
    onChange(brand);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Input Button */}
      <button 
        type="button"
        onClick={handleOpen}
        className={`w-full flex items-center justify-between gap-2 text-xs font-semibold border rounded-xl px-3.5 py-2.5 cursor-pointer transition outline-none ${
          adminTheme === 'light'
            ? 'bg-white border-slate-200 text-slate-800 hover:border-emerald-500 shadow-xs'
            : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-emerald-500'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <span className={value ? 'font-bold text-slate-900 dark:text-slate-100' : 'text-slate-400 font-normal'}>
            {value || 'Sélectionner ou ajouter une marque...'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
          adminTheme === 'light' 
            ? 'bg-white border-slate-200 text-slate-800 shadow-emerald-500/10' 
            : 'bg-slate-900 border-slate-800 text-slate-100 shadow-slate-950/80'
        }`}>
          {/* Search Bar Input */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher ou saisir une nouvelle marque..."
              className={`w-full text-xs border-0 outline-none pl-8 pr-3 py-1.5 rounded-xl font-medium ${
                adminTheme === 'light'
                  ? 'bg-slate-100/80 text-slate-800 placeholder-slate-400'
                  : 'bg-slate-950 text-slate-200 placeholder-slate-500'
              }`}
            />
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {/* Custom Create Option if typing a new brand name */}
            {searchQuery.trim() && !exactMatch && (
              <button
                type="button"
                onClick={() => handleSelect(searchQuery.trim())}
                className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl text-emerald-600 dark:text-emerald-400 bg-emerald-50/90 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition flex items-center gap-2 cursor-pointer mb-1 border border-emerald-300/60 dark:border-emerald-700/60 shadow-2xs"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="truncate">Créer <b className="underline">&quot;{searchQuery.trim()}&quot;</b></span>
              </button>
            )}

            {filteredBrands.map((brand) => {
              const isSelected = value.toLowerCase() === brand.toLowerCase();
              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() => handleSelect(brand)}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-white font-black shadow-xs'
                      : adminTheme === 'light'
                        ? 'hover:bg-slate-100 text-slate-700'
                        : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span className="truncate">{brand}</span>
                  {isSelected && <Check className="w-4 h-4 shrink-0 text-white" />}
                </button>
              );
            })}

            {filteredBrands.length === 0 && !searchQuery.trim() && (
              <div className="p-4 text-center text-xs text-slate-400">
                Aucune marque disponible. Tapez pour en créer une.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface CategoryMultiSelectProps {
  categories: string[];
  options: string[];
  onChange: (categories: string[]) => void;
  adminTheme: 'light' | 'dark';
}

const parseIngredientList = (value: string) => {
  const seen = new Set<string>();
  return value
    .split(/[,;|\n]+/)
    .map(ingredient => ingredient.trim())
    .filter(ingredient => {
      const key = ingredient.toLocaleLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

interface IngredientMultiSelectProps {
  value: string;
  options: string[];
  onChange: (ingredients: string) => void;
  adminTheme: 'light' | 'dark';
}

function IngredientMultiSelect({
  value,
  options,
  onChange,
  adminTheme,
}: IngredientMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedIngredients = useMemo(() => parseIngredientList(value), [value]);
  const ingredientOptions = useMemo(() => {
    const byKey = new Map<string, string>();
    [...selectedIngredients, ...options].forEach(ingredient => {
      const trimmed = ingredient.trim();
      if (trimmed) byKey.set(trimmed.toLocaleLowerCase(), trimmed);
    });
    return Array.from(byKey.values()).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [options, selectedIngredients]);
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return ingredientOptions.filter(ingredient => !normalizedQuery || ingredient.toLocaleLowerCase().includes(normalizedQuery));
  }, [ingredientOptions, query]);
  const canCreate = Boolean(query.trim()) && !ingredientOptions.some(ingredient => ingredient.toLocaleLowerCase() === query.trim().toLocaleLowerCase());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateIngredients = (ingredients: string[]) => onChange(ingredients.join(', '));

  const toggleIngredient = (ingredient: string) => {
    const isSelected = selectedIngredients.some(item => item.toLocaleLowerCase() === ingredient.toLocaleLowerCase());
    updateIngredients(
      isSelected
        ? selectedIngredients.filter(item => item.toLocaleLowerCase() !== ingredient.toLocaleLowerCase())
        : [...selectedIngredients, ingredient]
    );
  };

  const addIngredient = (ingredient: string) => {
    const trimmed = ingredient.trim();
    if (!trimmed) return;
    if (!selectedIngredients.some(item => item.toLocaleLowerCase() === trimmed.toLocaleLowerCase())) {
      updateIngredients([...selectedIngredients, trimmed]);
    }
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen(open => !open)}
        className={`w-full min-h-12 px-2.5 py-2 border rounded-xl text-left transition flex items-center justify-between gap-3 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
          adminTheme === 'light'
            ? 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-white'
            : 'bg-slate-950 border-slate-800 text-slate-100 hover:border-slate-700'
        }`}
      >
        <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {selectedIngredients.length > 0 ? selectedIngredients.map(ingredient => (
            <span
              key={ingredient.toLocaleLowerCase()}
              className={`inline-flex max-w-full items-center gap-1 rounded-lg py-1 pl-2 pr-1 text-[10px] font-bold ${
                adminTheme === 'light'
                  ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
                  : 'bg-violet-950/60 text-violet-200 ring-1 ring-violet-800'
              }`}
            >
              <span className="truncate">{ingredient}</span>
            </span>
          )) : (
            <span className="py-1 text-xs font-medium text-slate-400">Sélectionner ou ajouter des ingrédients...</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border shadow-xl ${
          adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="border-b border-slate-100 p-2.5 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Rechercher ou ajouter un ingrédient"
                className={`w-full rounded-lg border py-2.5 pl-8 pr-3 text-xs font-medium outline-none transition focus:ring-2 focus:ring-emerald-500/30 ${
                  adminTheme === 'light' ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'
                }`}
              />
            </div>
          </div>
          <div role="listbox" aria-multiselectable="true" className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
            {canCreate && (
              <button
                type="button"
                onClick={() => addIngredient(query)}
                className="mb-1 flex w-full items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-left text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-950"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter &quot;{query.trim()}&quot;
              </button>
            )}
            {filteredOptions.map(ingredient => {
              const selected = selectedIngredients.some(item => item.toLocaleLowerCase() === ingredient.toLocaleLowerCase());
              return (
                <button
                  key={ingredient.toLocaleLowerCase()}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => toggleIngredient(ingredient)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition ${
                    selected
                      ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-200'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      selected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {selected && <Check className="h-3 w-3" />}
                    </span>
                    <span className="truncate">{ingredient}</span>
                  </span>
                </button>
              );
            })}
            {filteredOptions.length === 0 && !canCreate && (
              <div className="px-3 py-5 text-center text-xs text-slate-400">Aucun ingrédient trouvé.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryMultiSelect({
  categories,
  options,
  onChange,
  adminTheme,
}: CategoryMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCategories = useMemo(() => {
    const all = categories
      .map(category => category.trim().toLowerCase())
      .filter(Boolean);
    return Array.from(new Set(all));
  }, [categories]);

  const categoryOptions = useMemo(() => Array.from(new Set([
    ...selectedCategories,
    ...options.map(option => option.trim().toLowerCase()).filter(Boolean),
  ])), [options, selectedCategories]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return categoryOptions.filter(option => !normalizedQuery || option.includes(normalizedQuery));
  }, [categoryOptions, query]);

  const canCreate = Boolean(query.trim()) && !categoryOptions.some(option => option === query.trim().toLowerCase());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addCategory = (category: string) => {
    const normalized = category.trim().toLowerCase();
    if (!normalized) return;
    onChange(Array.from(new Set([...selectedCategories, normalized])));
    setQuery('');
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      if (selectedCategories.length === 1) return;
      onChange(selectedCategories.filter(item => item !== category));
      return;
    }
    onChange([...selectedCategories, category]);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen(open => !open)}
        className={`w-full min-h-12 px-2.5 py-2 border rounded-xl text-left transition flex items-center justify-between gap-3 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
          adminTheme === 'light'
            ? 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-white'
            : 'bg-slate-950 border-slate-800 text-slate-100 hover:border-slate-700'
        }`}
      >
        <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {selectedCategories.map(category => (
            <span
              key={category}
              className={`inline-flex max-w-full items-center gap-1 rounded-lg py-1 pl-2 pr-1 text-[10px] font-bold uppercase tracking-wide ${
                category === selectedCategories[0]
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : adminTheme === 'light'
                    ? 'bg-slate-200/80 text-slate-700'
                    : 'bg-slate-800 text-slate-300'
              }`}
            >
              <span className="truncate">{category}</span>
              {category === selectedCategories[0] && <span className="rounded bg-white/20 px-1 py-0.5 text-[8px] font-black">PRINCIPALE</span>}
            </span>
          ))}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border shadow-xl ${
          adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="border-b border-slate-100 p-2.5 dark:border-slate-800">
            <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Rechercher une catégorie"
              className={`w-full rounded-lg border py-2.5 pl-8 pr-3 text-xs font-medium outline-none transition focus:ring-2 focus:ring-emerald-500/30 ${
                adminTheme === 'light' ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'
              }`}
            />
            </div>
          </div>
          <div role="listbox" aria-multiselectable="true" className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
            {canCreate && (
              <button
                type="button"
                onClick={() => addCategory(query)}
                className="mb-1 flex w-full items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-left text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-950"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter &quot;{query.trim()}&quot;
              </button>
            )}
            {filteredOptions.map(category => {
              const selected = selectedCategories.includes(category);
              const isPrimary = category === selectedCategories[0];
              return (
                <button
                  key={category}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => toggleCategory(category)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition ${
                    isPrimary
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : selected
                        ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      selected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {selected && <Check className="h-3 w-3" />}
                    </span>
                    <span className="truncate">{category.toUpperCase()}</span>
                  </span>
                  {isPrimary && <span className="shrink-0 rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black text-white">PRINCIPALE</span>}
                </button>
              );
            })}
            {filteredOptions.length === 0 && !canCreate && (
              <div className="px-3 py-5 text-center text-xs text-slate-400">Aucune catégorie trouvée.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalogTab({
  catalogStockFilter: propCatalogStockFilter,
  setCatalogStockFilter: propSetCatalogStockFilter
}: CatalogTabProps = {}) {
  const {
    products,
    adminTheme,
    handleSaveBulkProducts,
    handleCreateProduct,
    handleImportProducts,
    loadProducts,
    orders,
    setIsDataLoading
  } = useAdmin();

  const { settings } = useSettings();
  const { showToast } = useUi();
  const { spotlightTarget, setSpotlightTarget } = useAdminUI();
  const lowStockThreshold = settings.lowStockThreshold || 5;

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [isCatPopoverOpen, setIsCatPopoverOpen] = useState(false);
  const [isFloatingCatPopoverOpen, setIsFloatingCatPopoverOpen] = useState(false);

  // Search & Filters
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [localCatalogStockFilter, setLocalCatalogStockFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const catalogStockFilter = propCatalogStockFilter !== undefined ? propCatalogStockFilter : localCatalogStockFilter;
  const setCatalogStockFilter = propSetCatalogStockFilter !== undefined ? propSetCatalogStockFilter : setLocalCatalogStockFilter;

  // Dropdown filter states
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterVendor, setFilterVendor] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'draft'>('all');

  useEffect(() => {
    if (spotlightTarget?.type !== 'product') return;

    const product = products.find(item => String(item.id) === spotlightTarget.id);
    if (product) {
      setProductSearchQuery(product.title || product.name || '');
      setCurrentPage(1);
    }
    setSpotlightTarget(null);
  }, [products, setSpotlightTarget, spotlightTarget]);

  // ── Sliding pill refs — Status filter bar ──────────────────────────────────
  const statusPillRef  = useRef<HTMLSpanElement>(null);
  const statusBtnRefs  = useRef<(HTMLButtonElement | null)[]>([]);
  const STATUS_TABS = ['all', 'live', 'draft'] as const;

  const moveStatusPill = useCallback((idx: number, animate: boolean) => {
    const pill = statusPillRef.current;
    const btn  = statusBtnRefs.current[idx];
    if (!pill || !btn) return;
    if (!animate) {
      const prev = pill.style.transition;
      pill.style.transition = 'none';
      pill.style.transform  = `translateX(${btn.offsetLeft}px)`;
      pill.style.width      = `${btn.offsetWidth}px`;
      void pill.offsetWidth;
      pill.style.transition = prev;
    } else {
      pill.style.transform = `translateX(${btn.offsetLeft}px)`;
      pill.style.width     = `${btn.offsetWidth}px`;
    }
  }, []);

  useEffect(() => {
    const idx = STATUS_TABS.indexOf(filterStatus);
    if (idx !== -1) moveStatusPill(idx, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const idx = STATUS_TABS.indexOf(filterStatus);
    if (idx !== -1) moveStatusPill(idx, true);
  }, [filterStatus, moveStatusPill, products]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sliding pill refs — View mode bar ──────────────────────────────────────
  const viewPillRef  = useRef<HTMLSpanElement>(null);
  const viewBtnRefs  = useRef<(HTMLButtonElement | null)[]>([]);
  const VIEW_TABS = ['list', 'grid'] as const;

  const moveViewPill = useCallback((idx: number, animate: boolean) => {
    const pill = viewPillRef.current;
    const btn  = viewBtnRefs.current[idx];
    if (!pill || !btn) return;
    if (!animate) {
      const prev = pill.style.transition;
      pill.style.transition = 'none';
      pill.style.transform  = `translateX(${btn.offsetLeft}px)`;
      pill.style.width      = `${btn.offsetWidth}px`;
      void pill.offsetWidth;
      pill.style.transition = prev;
    } else {
      pill.style.transform = `translateX(${btn.offsetLeft}px)`;
      pill.style.width     = `${btn.offsetWidth}px`;
    }
  }, []);

  useEffect(() => {
    moveViewPill(0, false); // 'list' is default
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const idx = VIEW_TABS.indexOf(viewMode);
    if (idx !== -1) moveViewPill(idx, true);
  }, [viewMode, moveViewPill]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reposition both pills on resize
  useEffect(() => {
    const onResize = () => {
      const sIdx = STATUS_TABS.indexOf(filterStatus);
      const vIdx = VIEW_TABS.indexOf(viewMode);
      if (sIdx !== -1) moveStatusPill(sIdx, false);
      if (vIdx !== -1) moveViewPill(vIdx, false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [filterStatus, viewMode, moveStatusPill, moveViewPill]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sorting states
  type SortField = 'id' | 'name' | 'sku' | 'stock' | 'price' | 'category' | 'vendor';
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Local busy state for inline product actions (delete, duplicate, bulk) —
  // keeps a small per-card spinner without triggering the full-page skeleton.
  const [isCatalogBusy, setIsCatalogBusy] = useState(false);

  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);

  // Bulk actions selection states
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkCategory, setBulkCategory] = useState<string>('');

  // Bulk quick edit mode states
  const [isCatalogBulkMode, setIsCatalogBulkMode] = useState(false);
  const [bulkProducts, setBulkProducts] = useState<Product[]>([]);
  const [changedProductIds, setChangedProductIds] = useState<Set<number>>(new Set());
  const [isSavingBulk, setIsSavingBulk] = useState(false);

  // New/Edit product modal/drawer state
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'general' | 'pricing' | 'variants' | 'seo'>('general');
  const [productForm, setProductForm] = useState<Partial<Product>>({
    title: '', vendor: '', price: 0, comparePrice: 0, category: 'visage', categories: ['visage'], tags: [], stock: 100, description: '', ingredients: '', usage: '', image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop', sku: '', buyingCost: 0, status: 'live'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSeoExpanded, setIsSeoExpanded] = useState(false);
  const [isVariantsExpanded, setIsVariantsExpanded] = useState(false);

  // CSV Importer States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<number>(1);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importUpdateExisting, setImportUpdateExisting] = useState(false);
  const [importDelimiter, setImportDelimiter] = useState('auto');
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvPreviewRow, setCsvPreviewRow] = useState<string[]>([]);
  const [csvAllRows, setCsvAllRows] = useState<string[][]>([]);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [importProgress, setImportProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [importError, setImportError] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [importResult, setImportResult] = useState<{ created: number; updated: number; skipped: number; validationErrors: number } | null>(null);
  const [importHistory, setImportHistory] = useState<Array<{ id: string; date: string; details: string }>>([]);

  // Saved mapping profiles
  const [savedProfiles, setSavedProfiles] = useState<Record<string, Record<string, string>>>({});
  const [profileNameInput, setProfileNameInput] = useState('');

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Advanced Filters State
  const [filterSpecial, setFilterSpecial] = useState<string>('all');
  const [isSpecialOpen, setIsSpecialOpen] = useState(false);
  const specialDropdownRef = React.useRef<HTMLDivElement>(null);
  const [isSavedViewsOpen, setIsSavedViewsOpen] = useState(false);
  const [savedViewName, setSavedViewName] = useState('');
  const [savedViews, setSavedViews] = useState<Array<{ id: string; name: string; search: string; category: string; vendor: string; status: string; special: string }>>([]);
  const savedViewsRef = React.useRef<HTMLDivElement>(null);

  const downloadImportErrors = () => {
    const errorRows = rowValidations.filter(validation => Object.keys(validation.errors).length > 0 || Object.keys(validation.warnings).length > 0);
    if (errorRows.length === 0) {
      showToast('Aucune erreur ou avertissement à exporter.', 'success');
      return;
    }
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [
      ['Ligne', 'Titre', 'SKU', 'Erreurs', 'Avertissements'],
      ...errorRows.map(validation => [
        validation.rowIdx + 2,
        validation.mappedProduct.title || '',
        validation.mappedProduct.sku || '',
        Object.values(validation.errors).join(' | '),
        Object.values(validation.warnings).join(' | '),
      ]),
    ].map(row => row.map(escape).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `erreurs_import_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const applySavedView = (view: { search: string; category: string; vendor: string; status: string; special: string }) => {
    setProductSearchQuery(view.search);
    setFilterCategory(view.category);
    setFilterVendor(view.vendor);
    setFilterStatus(view.status as 'all' | 'live' | 'draft');
    setFilterSpecial(view.special);
    setCurrentPage(1);
    setIsSavedViewsOpen(false);
  };

  const saveCurrentView = () => {
    const name = savedViewName.trim();
    if (!name) {
      showToast('Donnez un nom à cette vue.', 'error');
      return;
    }
    const next = [{ id: `view_${Date.now()}`, name, search: productSearchQuery, category: filterCategory, vendor: filterVendor, status: filterStatus, special: filterSpecial }, ...savedViews].slice(0, 12);
    setSavedViews(next);
    localStorage.setItem('admin_catalog_saved_views', JSON.stringify(next));
    setSavedViewName('');
    showToast(`Vue « ${name} » enregistrée.`, 'success');
  };

  // Reusable confirmation modal state
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmText: string;
    confirmStyle: 'danger' | 'primary' | 'warning';
    onConfirm: () => void;
    openedAt?: number;
  } | null>(null);

  // Local state for paginated products and total count
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [statusCounts, setStatusCounts] = useState<{ all: number; live: number; draft: number } | null>(null);
  const [isLocalLoading, setIsLocalLoading] = useState<boolean>(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(productSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearchQuery]);

  // Fetch paginated products function
  const fetchPaginatedProducts = useCallback(async () => {
    setIsLocalLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      params.append('limit', String(itemsPerPage));
      if (debouncedSearchQuery) {
        params.append('search', debouncedSearchQuery);
      }
      if (filterCategory !== 'all') {
        params.append('category', filterCategory);
      }
      if (filterVendor !== 'all') {
        params.append('vendor', filterVendor);
      }
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      if (filterSpecial !== 'all') {
        params.append('special', filterSpecial);
      }
      if (sortField) {
        params.append('sortField', sortField);
        params.append('sortDirection', sortDirection);
      }
      params.append('lowStockThreshold', String(lowStockThreshold));

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.products) {
        setPaginatedProducts(data.products);
        setTotalProducts(data.totalCount);
        setStatusCounts(data.statusCounts || null);
      } else {
        setPaginatedProducts([]);
        setTotalProducts(0);
        setStatusCounts(null);
        showToast(data.error || "Erreur lors du chargement des produits.", "error");
      }
    } catch (err: any) {
      console.error(err);
      showToast("Erreur lors de la récupération des produits.", "error");
    } finally {
      setIsLocalLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchQuery, filterCategory, filterVendor, filterStatus, filterSpecial, sortField, sortDirection, lowStockThreshold, showToast]);

  // Trigger paginated fetch when dependencies change
  useEffect(() => {
    fetchPaginatedProducts();
  }, [fetchPaginatedProducts]);

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filterCategory, filterVendor, filterStatus, filterSpecial]);

  // Helper for toggling special filters and page resetting (supporting multiple filters)
  const handleFilterSpecialToggle = (val: string) => {
    if (val === 'all') {
      setFilterSpecial('all');
    } else {
      let currentFilters = filterSpecial === 'all' ? [] : filterSpecial.split(',');
      if (currentFilters.includes(val)) {
        currentFilters = currentFilters.filter(f => f !== val);
      } else {
        currentFilters.push(val);
      }
      
      // If no filters are selected, default back to 'all'
      if (currentFilters.length === 0) {
        setFilterSpecial('all');
      } else {
        setFilterSpecial(currentFilters.join(','));
      }
    }
    setCurrentPage(1);
  };

  // Click outside for special dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (specialDropdownRef.current && !specialDropdownRef.current.contains(event.target as Node)) {
        setIsSpecialOpen(false);
      }
      if (savedViewsRef.current && !savedViewsRef.current.contains(event.target as Node)) {
        setIsSavedViewsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isImportModalOpen) return;
    void fetch('/api/admin/audit-logs', { cache: 'no-store' })
      .then(response => response.json())
      .then(data => {
        if (data?.success) {
          setImportHistory((data.logs || []).filter((log: any) => log.action === 'Import catalogue').slice(0, 5));
        }
      })
      .catch(() => setImportHistory([]));
  }, [isImportModalOpen]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin_catalog_saved_views');
      if (stored) setSavedViews(JSON.parse(stored));
    } catch {
      setSavedViews([]);
    }
  }, []);

  // Escape key listener for confirmation modal
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && confirmDialog) {
        setConfirmDialog(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmDialog]);

  // Compute Dead Product IDs (No sales in the last 30 days)
  const deadProductIds = useMemo(() => {
    const activeIds = new Set<number>();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ordersList = orders || [];
    ordersList.forEach((order: any) => {
      const status = (order.status || '').toLowerCase();
      // Skip cancelled or failed orders
      if (status.includes('annul') || status === 'cancelled' || status === 'failed') {
        return;
      }
      const orderDateStr = order.created_at || order.date;
      if (orderDateStr) {
        const orderDate = new Date(orderDateStr);
        if (orderDate >= thirtyDaysAgo) {
          (order.items || []).forEach((item: any) => {
            if (item && item.id) {
              const idNum = Number(item.id);
              if (!isNaN(idNum)) {
                activeIds.add(idNum);
              }
            }
          });
        }
      }
    });

    const deadSet = new Set<number>();
    products.forEach((p: any) => {
      if (!activeIds.has(p.id)) {
        deadSet.add(p.id);
      }
    });
    return deadSet;
  }, [orders, products]);

  // Compute Counts for Special Filters
  const specialFilterCounts = useMemo(() => {
    let noImage = 0;
    let negativeStock = 0;
    let deadProducts = 0;
    let outOfStock = 0;
    let lowStock = 0;
    let lowMargin = 0;
    let noDesc = 0;
    let onSale = 0;
    let positiveStock = 0;
    let positiveStockNoVendor = 0;
    let positiveStockNoDesc = 0;
    let noPrice = 0;
    let noCategory = 0;
    let noVendor = 0;
    let noIngredients = 0;
    let needsReview = 0;

    products.forEach((p: any) => {
      if (!p.image || p.image === '' || p.image === '/placeholder.png') {
        noImage++;
      }
      const missingImage = !p.image || p.image === '' || p.image === '/placeholder.png';
      const missingPrice = !Number(p.price);
      const missingStock = p.stock === undefined || p.stock === null;
      const missingCategory = !p.category || p.category.trim() === '';
      const missingVendor = !p.vendor || p.vendor.trim() === '' || p.vendor === '-';
      const missingIngredients = !p.ingredients || p.ingredients.trim() === '';
      if (missingPrice) noPrice++;
      if (missingCategory) noCategory++;
      if (missingVendor) noVendor++;
      if (missingIngredients) noIngredients++;
      if (missingImage || missingPrice || missingStock || missingCategory || missingVendor || missingIngredients) needsReview++;
      if (p.stock !== undefined && p.stock !== null && p.stock < 0) {
        negativeStock++;
      }
      if (deadProductIds.has(p.id)) {
        deadProducts++;
      }
      if (p.stock === 0) {
        outOfStock++;
      }
      if (p.stock !== undefined && p.stock !== null && p.stock <= lowStockThreshold) {
        lowStock++;
      }
      if (p.buyingCost !== undefined && p.buyingCost !== null && p.buyingCost >= p.price) {
        lowMargin++;
      }
      if (!p.description || p.description.trim() === '') {
        noDesc++;
      }
      if (p.comparePrice && p.comparePrice > p.price) {
        onSale++;
      }
      if (p.stock !== undefined && p.stock !== null && p.stock > 0) {
        positiveStock++;
        const hasNoVendor = !p.vendor || p.vendor.trim() === '' || p.vendor === '-';
        if (hasNoVendor) {
          positiveStockNoVendor++;
        }
        if (!p.description || p.description.trim() === '') {
          positiveStockNoDesc++;
        }
      }
    });

    return {
      noImage,
      negativeStock,
      deadProducts,
      outOfStock,
      lowStock,
      lowMargin,
      noDesc,
      onSale,
      positiveStock,
      positiveStockNoVendor,
      positiveStockNoDesc,
      noPrice,
      noCategory,
      noVendor,
      noIngredients,
      needsReview
    };
  }, [products, deadProductIds, lowStockThreshold]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadProducts();
      await fetchPaginatedProducts();
      showToast("Catalogue mis à jour.", "success");
    } catch (e) {
      showToast("Erreur lors de la mise à jour.", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Validations
  const [rowValidations, setRowValidations] = useState<any[]>([]);
  const [ignoreRowsWithErrors, setIgnoreRowsWithErrors] = useState(false);
  const [validationFilter, setValidationFilter] = useState<'all' | 'errors' | 'warnings'>('all');

  // Load profiles and refresh products list on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('csv_mapping_profiles');
      if (stored) {
        setSavedProfiles(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
    loadProducts();
  }, []);

  const handleSaveProfile = (name: string) => {
    if (!name.trim()) return;
    const updated = { ...savedProfiles, [name.trim()]: columnMappings };
    setSavedProfiles(updated);
    localStorage.setItem('csv_mapping_profiles', JSON.stringify(updated));
    setProfileNameInput('');
    showToast(`Profil "${name}" sauvegardé avec succès.`, 'success');
  };

  const handleDeleteProfile = (name: string) => {
    const updated = { ...savedProfiles };
    delete updated[name];
    setSavedProfiles(updated);
    localStorage.setItem('csv_mapping_profiles', JSON.stringify(updated));
  };

  const handleLoadProfile = (name: string) => {
    const profile = savedProfiles[name];
    if (profile) {
      setColumnMappings(profile);
    }
  };

  const runValidations = () => {
    const validations: any[] = [];
    const seenSkus = new Set<string>();
    const seenIds = new Set<number>();

    csvAllRows.forEach((row, rowIdx) => {
      const errors: Record<string, string> = {};
      const warnings: Record<string, string> = {};
      const mappedProduct: any = {};

      csvHeaders.forEach((header, colIdx) => {
        const targetField = columnMappings[header];
        if (targetField && targetField !== 'ignore') {
          const rawValue = row[colIdx] || '';
          mappedProduct[targetField] = rawValue;
        }
      });

      // 1. Validate ID
      if (mappedProduct.id !== undefined && String(mappedProduct.id).trim() !== '') {
        const idNum = Number(String(mappedProduct.id).replace(/[^0-9.-]/g, ''));
        if (isNaN(idNum)) {
          errors.id = "L'ID doit être un nombre.";
        } else {
          mappedProduct.id = idNum;
          if (seenIds.has(idNum)) {
            errors.id = "ID doublon dans le fichier CSV.";
          }
          seenIds.add(idNum);
        }
      }

      // 2. Validate SKU
      if (mappedProduct.sku && String(mappedProduct.sku).trim() !== '') {
        const skuStr = String(mappedProduct.sku).trim();
        if (seenSkus.has(skuStr)) {
          errors.sku = "SKU doublon dans le fichier CSV.";
        }
        seenSkus.add(skuStr);
        
        if (!importUpdateExisting) {
          const skuConflict = products.some(p => p.sku === skuStr);
          if (skuConflict) {
            warnings.sku = "Ce SKU existe déjà en base et sera ignoré.";
          }
        }
      }

      // 3. Validate Title
      if (!mappedProduct.title && !mappedProduct.id && !mappedProduct.sku) {
        errors.title = "Le produit doit avoir un Titre, un SKU ou un ID.";
      }

      // 4. Validate Price
      if (mappedProduct.price !== undefined && String(mappedProduct.price).trim() !== '') {
        const priceNum = Number(String(mappedProduct.price).replace(/[^0-9.-]/g, ''));
        if (isNaN(priceNum)) {
          errors.price = "Le prix doit être un nombre.";
        } else if (priceNum < 0) {
          errors.price = "Le prix ne peut pas être négatif.";
        } else {
          mappedProduct.price = priceNum;
        }
      }

      // 5. Validate ComparePrice
      if (mappedProduct.comparePrice !== undefined && String(mappedProduct.comparePrice).trim() !== '') {
        const comparePriceNum = Number(String(mappedProduct.comparePrice).replace(/[^0-9.-]/g, ''));
        if (isNaN(comparePriceNum)) {
          errors.comparePrice = "Le prix barré doit être un nombre.";
        } else if (comparePriceNum < 0) {
          errors.comparePrice = "Le prix barré ne peut pas être négatif.";
        } else {
          mappedProduct.comparePrice = comparePriceNum;
        }
      }

      // 6. Validate BuyingCost
      if (mappedProduct.buyingCost !== undefined && String(mappedProduct.buyingCost).trim() !== '') {
        const buyingCostNum = Number(String(mappedProduct.buyingCost).replace(/[^0-9.-]/g, ''));
        if (isNaN(buyingCostNum)) {
          errors.buyingCost = "Le coût d'achat doit être un nombre.";
        } else if (buyingCostNum < 0) {
          errors.buyingCost = "Le coût d'achat ne peut pas être négatif.";
        } else {
          mappedProduct.buyingCost = buyingCostNum;
        }
      }

      // 7. Validate Stock
      if (mappedProduct.stock !== undefined && String(mappedProduct.stock).trim() !== '') {
        const stockNum = Number(String(mappedProduct.stock).replace(/[^0-9.-]/g, ''));
        if (isNaN(stockNum) || !Number.isInteger(stockNum)) {
          errors.stock = "Le stock doit être un entier.";
        } else if (stockNum < 0) {
          errors.stock = "Le stock ne peut pas être négatif.";
        } else {
          mappedProduct.stock = stockNum;
        }
      }

      // 8. Category values are accepted from the sheet and created automatically.

      // 9. Validate Image URL
      if (mappedProduct.image && String(mappedProduct.image).trim() !== '') {
        const imgStr = String(mappedProduct.image).trim();
        if (imgStr && !imgStr.startsWith('http://') && !imgStr.startsWith('https://')) {
          warnings.image = "L'URL de l'image ne commence pas par http:// ou https://.";
        }
      }

      validations.push({
        rowIdx,
        errors,
        warnings,
        mappedProduct
      });
    });

    setRowValidations(validations);
  };

  const handleExportCatalogToCsv = async () => {
    setIsLocalLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchQuery) {
        params.append('search', debouncedSearchQuery);
      }
      if (filterCategory !== 'all') {
        params.append('category', filterCategory);
      }
      if (filterVendor !== 'all') {
        params.append('vendor', filterVendor);
      }
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      if (filterSpecial !== 'all') {
        params.append('special', filterSpecial);
      }
      params.append('lowStockThreshold', String(lowStockThreshold));

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      if (!data.success || !data.products) {
        showToast("Erreur lors du chargement des produits pour exportation.", "error");
        return;
      }

      const itemsToExport = data.products;
      if (itemsToExport.length === 0) {
        showToast("Aucun produit à exporter.", "warning");
        return;
      }

      const escapeCsv = (val: any) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const headers = [
        'ID', 'Titre', 'Marque', 'Prix (DH)', 'Prix Comparaison (DH)', 
        'Stock', 'SKU', 'Cout Achat (DH)', 'Categorie', 'Description', 
        'Ingredients', 'Conseils Utilisation', 'Image URL', 'Tags'
      ];

      const rows = itemsToExport.map((p: any) => [
        p.id,
        p.title || p.name || '',
        p.vendor || '',
        p.price || 0,
        p.comparePrice || '',
        p.stock || 0,
        p.sku || '',
        p.buyingCost || '',
        p.category || 'visage',
        p.description || '',
        p.ingredients || '',
        p.usage || '',
        p.image || '',
        Array.isArray(p.tags) ? p.tags.join(', ') : ''
      ]);

      const csvContent = "\uFEFF" + [headers, ...rows].map(row => row.map(escapeCsv).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `catalogue_produits_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`${itemsToExport.length} produits exportés avec succès.`, "success");
    } catch (err: any) {
      console.error(err);
      showToast("Erreur lors de l'exportation.", "error");
    } finally {
      setIsLocalLoading(false);
    }
  };

  const guessMapping = (header: string): string => {
    const h = header.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
    if (h === 'id' || h === 'productid' || h === 'identifiant') return 'id';
    if (h === 'title' || h === 'titre' || h === 'name' || h === 'nom' || h === 'namefr' || h === 'nomfr' || h === 'titrefrançais') return 'title';
    if (h === 'vendor' || h === 'brand' || h === 'marque' || h === 'fournisseur') return 'vendor';
    if (h === 'price' || h === 'prix' || h === 'pricefr' || h === 'prixdh') return 'price';
    if (h === 'compareprice' || h === 'prixcompare' || h === 'comparepricefr' || h === 'prixbarre' || h === 'compare') return 'comparePrice';
    if (h === 'stock' || h === 'quantity' || h === 'quantite' || h === 'qty') return 'stock';
    if (h === 'sku' || h === 'codesku' || h === 'referencesku' || h === 'ref') return 'sku';
    if (h === 'buyingcost' || h === 'coutdachat' || h === 'buying' || h === 'cout') return 'buyingCost';
    if (h === 'category' || h === 'categorie' || h === 'cat') return 'category';
    if (h === 'categories' || h === 'categoriesproduit' || h === 'productcategories' || h === 'cats') return 'categories';
    if (h === 'description' || h === 'desc') return 'description';
    if (['ingredient', 'ingredients', 'composition', 'ingredientsactifs', 'actifs', 'inci', 'formule'].includes(h)) return 'ingredients';
    if (h === 'usage' || h === 'utilisation' || h === 'conseilsdutilisation') return 'usage';
    if (h === 'image' || h === 'urlimage' || h === 'photo' || h === 'img') return 'image';
    if (h === 'tags' || h === 'motscles') return 'tags';
    return '';
  };

  const parseCSVData = (text: string, delimiter: string) => {
    const lines: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentValue = '';

    let separator = ',';
    if (delimiter === 'auto') {
      const firstLine = text.split('\n')[0] || '';
      const commas = (firstLine.match(/,/g) || []).length;
      const semicolons = (firstLine.match(/;/g) || []).length;
      const tabs = (firstLine.match(/\t/g) || []).length;
      if (semicolons > commas && semicolons > tabs) {
        separator = ';';
      } else if (tabs > commas && tabs > semicolons) {
        separator = '\t';
      }
    } else {
      separator = delimiter;
    }

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (inQuotes) {
        if (char === '"') {
          if (nextChar === '"') {
            currentValue += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          currentValue += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === separator) {
          row.push(currentValue.trim());
          currentValue = '';
        } else if (char === '\r' || char === '\n') {
          if (char === '\r' && nextChar === '\n') {
            i++;
          }
          row.push(currentValue.trim());
          if (row.length > 0 && row.some(cell => cell !== '')) {
            lines.push(row);
          }
          row = [];
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
    }
    if (row.length > 0 || currentValue !== '') {
      row.push(currentValue.trim());
      if (row.some(cell => cell !== '')) {
        lines.push(row);
      }
    }
    return lines;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportError('');
    }
  };

  const handleContinueToMapping = () => {
    if (!importFile) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setImportError("Le fichier est vide.");
        return;
      }
      
      const worker = new Worker('/workers/csv-worker.js');
      worker.postMessage({ text, delimiter: importDelimiter });

      worker.onmessage = (e) => {
        const { success, lines, error } = e.data;
        if (!success) {
          setImportError(error || "Erreur lors du traitement du fichier.");
          worker.terminate();
          return;
        }

        if (lines.length < 2) {
          setImportError("Le fichier doit contenir au moins une ligne d'en-tête et une ligne de données.");
          worker.terminate();
          return;
        }

        const headers = lines[0];
        const preview = lines[1];
        
        setCsvHeaders(headers);
        setCsvPreviewRow(preview);
        setCsvAllRows(lines.slice(1));

        const initialMappings: Record<string, string> = {};
        headers.forEach((header: string) => {
          initialMappings[header] = guessMapping(header);
        });
        setColumnMappings(initialMappings);
        setImportStep(2);
        worker.terminate();
      };
      
      worker.onerror = (err) => {
        console.error("Worker error:", err);
        setImportError("Erreur lors de l'exécution du parseur.");
        worker.terminate();
      };
    };
    reader.onerror = () => {
      setImportError("Erreur lors de la lecture du fichier.");
    };
    reader.readAsText(importFile);
  };

  const handleRunImporter = async () => {
    setImportStep(4);
    setImportProgress(15);

    const importedProducts: any[] = [];
    
    rowValidations.forEach(val => {
      if (ignoreRowsWithErrors && Object.keys(val.errors).length > 0) {
        return;
      }

      const product = { ...val.mappedProduct };
      
      if (product.tags && typeof product.tags === 'string') {
        product.tags = product.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '');
      }
      const categoryValues = [
        product.category,
        ...(Array.isArray(product.categories) ? product.categories : [product.categories]),
      ];
      const categories = categoryValues
        .filter((category): category is string => typeof category === 'string')
        .flatMap((category: string) => category
          .split(/[,;|]/)
          .map((category: string) => category.trim().toLowerCase())
          .filter((category: string) => category !== ''));
      if (categories.length > 0) {
        product.category = categories[0] || 'visage';
        product.categories = Array.from(new Set(categories));
      }

      if (product.title || product.sku || product.id) {
        importedProducts.push(product);
      }
    });

    if (importedProducts.length === 0) {
      setImportStep(5);
      setImportedCount(0);
      setImportProgress(100);
      return;
    }

    setImportProgress(35);

    try {
      const validationErrorCount = rowValidations.filter(validation => Object.keys(validation.errors).length > 0).length;
      const result = await handleImportProducts(importedProducts, importUpdateExisting, {
        fileName: importFile?.name,
        validationErrorCount,
      });
      setImportProgress(85);
      
      if (result.success) {
        setImportedCount(result.count);
        setImportResult({
          created: result.createdCount || 0,
          updated: result.updatedCount || 0,
          skipped: result.skippedCount || 0,
          validationErrors: result.validationErrorCount || validationErrorCount,
        });
        setImportMessage(result.categories?.length
          ? `${result.message ? `${result.message} ` : ''}${result.categories.length} nouvelle(s) catégorie(s) disponible(s) : ${result.categories.join(', ')}.`
          : (result.message || ''));
        setImportProgress(100);
        setImportStep(5);
        await fetchPaginatedProducts();
      } else {
        setImportError(result.error || "Erreur inconnue");
        setImportStep(1);
      }
    } catch (err: any) {
      setImportError(err.message || "Erreur de connexion");
      setImportStep(1);
    }
  };

  const handleValidateAndPreview = () => {
    runValidations();
    setImportStep(3);
  };

  // Sync bulkProducts when catalog quick edit is toggled or products update
  useEffect(() => {
    if (isCatalogBulkMode) {
      const source = paginatedProducts.length > 0 ? paginatedProducts : products;
      const selected = source.filter(product => selectedProductIds.has(product.id));
      setBulkProducts(JSON.parse(JSON.stringify(selected.length > 0 ? selected : source))); // deep clone
      setChangedProductIds(new Set());
    }
  }, [isCatalogBulkMode, products, paginatedProducts, selectedProductIds]);

  // Get unique categories and vendors for filtering select boxes
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => p.category && cats.add(p.category));
    paginatedProducts.forEach(p => p.category && cats.add(p.category));
    products.forEach(p => p.categories?.forEach(category => cats.add(category)));
    paginatedProducts.forEach(p => p.categories?.forEach(category => cats.add(category)));
    return Array.from(cats);
  }, [products, paginatedProducts]);

  const categoryOptions = useMemo(() => Array.from(new Set([
    'visage', 'kbeauty', 'garnier', 'hadalabo', 'offers',
    ...(settings.categories || []),
    ...uniqueCategories,
  ])).sort((a, b) => a.localeCompare(b)), [settings.categories, uniqueCategories]);

  const uniqueVendors = useMemo(() => {
    const vends = new Set<string>();
    products.forEach(p => p.vendor && vends.add(p.vendor));
    paginatedProducts.forEach(p => p.vendor && vends.add(p.vendor));
    return Array.from(vends);
  }, [products, paginatedProducts]);

  const ingredientOptions = useMemo(() => {
    const allIngredients = new Set<string>();
    [...products, ...paginatedProducts].forEach(product => {
      parseIngredientList(product.ingredients || '').forEach(ingredient => allIngredients.add(ingredient));
    });
    return Array.from(allIngredients).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [products, paginatedProducts]);

  const counts = useMemo(() => {
    if (statusCounts) {
      return {
        all: Math.max(statusCounts.all, totalProducts),
        live: statusCounts.live,
        draft: statusCounts.draft,
      };
    }

    let live = 0;
    let draft = 0;
    const sourceList = products.length > 0 ? products : paginatedProducts;
    sourceList.forEach((p: any) => {
      if (p.status === 'draft') draft++;
      else live++;
    });
    const all = Math.max(totalProducts, sourceList.length);
    return { all, live, draft };
  }, [products, paginatedProducts, totalProducts, statusCounts]);

  // Pagination calculations
  const totalPages = Math.ceil(totalProducts / itemsPerPage) || 1;

  useEffect(() => {
    if (!isLocalLoading && totalProducts > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalProducts, totalPages, currentPage, isLocalLoading]);

  const isAllOnPageSelected = useMemo(() => {
    if (paginatedProducts.length === 0) return false;
    return paginatedProducts.every(p => selectedProductIds.has(p.id));
  }, [paginatedProducts, selectedProductIds]);

  // Handlers for sorting, bulk selection, and actions
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleToggleSelectProduct = (productId: number) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleSelectAllOnPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pageIds = paginatedProducts.map(p => p.id);
    if (e.target.checked) {
      setSelectedProductIds(prev => {
        const next = new Set(prev);
        pageIds.forEach(id => next.add(id));
        return next;
      });
    } else {
      setSelectedProductIds(prev => {
        const next = new Set(prev);
        pageIds.forEach(id => next.delete(id));
        return next;
      });
    }
  };

  const handleApplyBulkAction = async (actionOverride?: string, categoryOverride?: string) => {
    const actionToRun = actionOverride || bulkAction;
    const categoryToUse = categoryOverride || bulkCategory;
    if (!actionToRun || selectedProductIds.size === 0) return;
    
    if (actionToRun === 'delete') {
      const idsToDelete = Array.from(selectedProductIds);
      setConfirmDialog({
        title: 'Supprimer la sélection ?',
        message: `Voulez-vous supprimer les ${idsToDelete.length} produit(s) sélectionné(s) ? Cette action est définitive.`,
        confirmText: 'Supprimer',
        confirmStyle: 'danger',
        openedAt: Date.now(),
        onConfirm: async () => {
          // Instant optimistic local update (0ms delay!)
          const deletedSet = new Set(idsToDelete);
          setPaginatedProducts(prev => prev.filter(p => !deletedSet.has(p.id)));
          setTotalProducts((prev: number) => Math.max(0, prev - idsToDelete.length));
          setSelectedProductIds(new Set());
          setBulkAction('');

          try {
            // Single batch API request
            const res = await fetch(`/api/admin/products?ids=${idsToDelete.join(',')}`, {
              method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
              showToast(`${data.count || idsToDelete.length} produit(s) supprimé(s) avec succès.`, 'success');
            } else {
              showToast(data.error || "Erreur lors de la suppression.", "error");
            }
          } catch {
            showToast("Erreur lors de la suppression des produits.", "error");
          } finally {
            // Quiet background refresh without skeleton takeover
            loadProducts();
            fetchPaginatedProducts();
          }
        }
      });
    } else if (actionToRun === 'categorize') {
      if (!categoryToUse) {
        showToast("Veuillez sélectionner une catégorie.", "error");
        return;
      }
      setConfirmDialog({
        title: 'Assigner la catégorie ?',
        message: `Voulez-vous assigner la catégorie "${categoryToUse}" aux ${selectedProductIds.size} produits sélectionnés ?`,
        confirmText: 'Assigner',
        confirmStyle: 'primary',
        openedAt: Date.now(),
        onConfirm: async () => {
          const idsSet = new Set(selectedProductIds);
          // Optimistic local update
          setPaginatedProducts(prev => prev.map(p => idsSet.has(p.id)
            ? { ...p, category: categoryToUse, categories: Array.from(new Set([categoryToUse, ...(p.categories || [p.category])])) }
            : p));
          setSelectedProductIds(new Set());
          setBulkAction('');
          setBulkCategory('');

          try {
            const productMap = new Map<number, Product>();
            products.forEach(p => productMap.set(p.id, p));
            paginatedProducts.forEach(p => productMap.set(p.id, p));

            const changedProducts = Array.from(idsSet)
              .map(id => productMap.get(id))
              .filter((p): p is Product => Boolean(p))
              .map(p => ({
                ...p,
                category: categoryToUse,
                categories: Array.from(new Set([categoryToUse, ...(p.categories || [p.category])])),
              }));
            
            const success = await handleSaveBulkProducts(changedProducts);
            if (success) {
              showToast(`${changedProducts.length} produits mis à jour avec la catégorie "${categoryToUse}".`, 'success');
            } else {
              showToast("Erreur lors de la mise à jour des produits.", 'error');
            }
          } catch {
            showToast("Erreur de connexion.", 'error');
          } finally {
            fetchPaginatedProducts();
          }
        }
      });
    } else if (actionToRun === 'publish') {
      setConfirmDialog({
        title: 'Publier la sélection ?',
        message: `Voulez-vous publier les ${selectedProductIds.size} produits sélectionnés ?`,
        confirmText: 'Publier',
        confirmStyle: 'primary',
        openedAt: Date.now(),
        onConfirm: async () => {
          const idsSet = new Set(selectedProductIds);
          // Optimistic local update
          setPaginatedProducts(prev => prev.map(p => idsSet.has(p.id) ? { ...p, status: 'live' as const } : p));
          setSelectedProductIds(new Set());
          setBulkAction('');

          try {
            const productMap = new Map<number, Product>();
            products.forEach(p => productMap.set(p.id, p));
            paginatedProducts.forEach(p => productMap.set(p.id, p));

            const changedProducts = Array.from(idsSet)
              .map(id => productMap.get(id))
              .filter((p): p is Product => Boolean(p))
              .map(p => ({ ...p, status: 'live' as const }));
            
            const success = await handleSaveBulkProducts(changedProducts);
            if (success) {
              showToast(`${changedProducts.length} produits publiés avec succès.`, 'success');
            } else {
              showToast("Erreur lors de la publication des produits.", 'error');
            }
          } catch {
            showToast("Erreur de connexion.", 'error');
          } finally {
            fetchPaginatedProducts();
          }
        }
      });
    } else if (actionToRun === 'draft') {
      setConfirmDialog({
        title: 'Mettre en brouillon ?',
        message: `Voulez-vous remettre en brouillon les ${selectedProductIds.size} produits sélectionnés ?`,
        confirmText: 'Brouillon',
        confirmStyle: 'warning',
        openedAt: Date.now(),
        onConfirm: async () => {
          const idsSet = new Set(selectedProductIds);
          // Optimistic local update
          setPaginatedProducts(prev => prev.map(p => idsSet.has(p.id) ? { ...p, status: 'draft' as const } : p));
          setSelectedProductIds(new Set());
          setBulkAction('');

          try {
            const productMap = new Map<number, Product>();
            products.forEach(p => productMap.set(p.id, p));
            paginatedProducts.forEach(p => productMap.set(p.id, p));

            const changedProducts = Array.from(idsSet)
              .map(id => productMap.get(id))
              .filter((p): p is Product => Boolean(p))
              .map(p => ({ ...p, status: 'draft' as const }));
            
            const success = await handleSaveBulkProducts(changedProducts);
            if (success) {
              showToast(`${changedProducts.length} produits remis en brouillon avec succès.`, 'success');
            } else {
              showToast("Erreur lors du passage en brouillon des produits.", 'error');
            }
          } catch {
            showToast("Erreur de connexion.", 'error');
          } finally {
            fetchPaginatedProducts();
          }
        }
      });
    }
  };

  // Handlers
  const handleBulkCellChange = (productId: number, field: string, value: any) => {
    setBulkProducts(prev => 
      prev.map(p => {
        if (p.id === productId) {
          return { ...p, [field]: value } as any;
        }
        return p;
      })
    );
    setChangedProductIds(prev => {
      const updated = new Set(prev);
      updated.add(productId);
      return updated;
    });
  };

  const handleSaveBulkChanges = async () => {
    if (changedProductIds.size === 0) return;
    setIsSavingBulk(true);
    const changedProducts = bulkProducts.filter(p => changedProductIds.has(p.id));

    try {
      const success = await handleSaveBulkProducts(changedProducts);
      if (success) {
        setIsCatalogBulkMode(false);
        setChangedProductIds(new Set());
        showToast(`${changedProducts.length} produits mis à jour avec succès !`, 'success');
      } else {
        showToast("Erreur lors de l'enregistrement.", 'error');
      }
    } catch (e) {
      console.error(e);
      showToast("Erreur de connexion lors de la sauvegarde.", 'error');
    } finally {
      setIsSavingBulk(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setProductForm(prev => ({ ...prev, image: data.url }));
        showToast('Image téléversée avec succès !', 'success');
      } else {
        showToast('Échec du téléversement: ' + data.error, 'error');
      }
    } catch (err) {
      showToast('Erreur réseau lors du téléversement.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProduct(true);
    try {
      if (productForm.id) {
        const res = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productForm)
        });
        const data = await res.json();
        if (data.success) {
          showToast('Produit mis à jour avec succès !', 'success');
          setIsNewProductModalOpen(false);
          setProductForm({
            title: '', vendor: '', price: 0, comparePrice: 0, category: 'visage', categories: ['visage'], tags: [], stock: 100, description: '', ingredients: '', usage: '', image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop', sku: '', buyingCost: 0, status: 'live'
          });
          await loadProducts();
          await fetchPaginatedProducts();
        } else {
          showToast(data.error || "Erreur lors de la mise à jour du produit.", 'error');
        }
      } else {
        const success = await handleCreateProduct(productForm);
        if (success) {
          setIsNewProductModalOpen(false);
          setProductForm({
            title: '', vendor: '', price: 0, comparePrice: 0, category: 'visage', categories: ['visage'], tags: [], stock: 100, description: '', ingredients: '', usage: '', image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop', sku: '', buyingCost: 0, status: 'live'
          });
          await loadProducts();
          await fetchPaginatedProducts();
        }
      }
    } catch {
      showToast("Erreur de connexion lors de l'enregistrement.", 'error');
    } finally {
      setIsSavingProduct(false);
    }
  };

  return (
    <div className="space-y-4 admin-tab-enter">
      <section className={`rounded-2xl border p-4 ${adminTheme === 'light' ? 'bg-white border-slate-200 shadow-[0_3px_16px_rgba(15,23,42,0.04)]' : 'bg-slate-900/60 border-slate-800'}`} aria-label="Qualité du catalogue">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className={`text-[11px] font-black uppercase tracking-[0.14em] ${adminTheme === 'light' ? 'text-slate-800' : 'text-white'}`}>Qualité du catalogue</p>
            <p className="mt-1 text-[10.5px] text-slate-500">Repérez les fiches qui empêchent une publication propre avant de travailler la sélection.</p>
          </div>
          <button type="button" onClick={() => { setFilterSpecial('needs_review'); setCurrentPage(1); }} className="self-start sm:self-auto rounded-xl px-3 py-2 text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition">Voir les fiches à compléter</button>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { label: 'À compléter', value: specialFilterCounts.needsReview, action: 'needs_review', color: '#f59e0b' },
            { label: 'Sans image', value: specialFilterCounts.noImage, action: 'no_image', color: '#f43f5e' },
            { label: 'Sans prix', value: specialFilterCounts.noPrice, action: 'needs_review', color: '#8b5cf6' },
            { label: 'Sans catégorie', value: specialFilterCounts.noCategory, action: 'needs_review', color: '#3b82f6' },
            { label: 'Sans ingrédients', value: specialFilterCounts.noIngredients, action: 'needs_review', color: '#10b981' },
          ].map(item => <button key={item.label} type="button" onClick={() => { setFilterSpecial(item.action); setCurrentPage(1); }} className={`rounded-xl border px-3 py-2.5 text-left transition hover:-translate-y-0.5 ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200 hover:bg-white' : 'bg-slate-950/50 border-slate-800'}`}><span className="block text-[9px] font-bold text-slate-500">{item.label}</span><span className="mt-1 block text-lg font-black font-mono" style={{ color: item.color }}>{item.value}</span></button>)}
        </div>
      </section>
      {/* Search/Filters & Operations Toolbar */}
      <div className={`flex flex-col gap-4 p-3 rounded-2xl border transition-all duration-200 ${
        adminTheme === 'light'
          ? 'bg-white border-slate-200/80 shadow-sm'
          : 'bg-slate-900/30 border-slate-900'
      }`}>
        {/* ROW 1: Filters & View Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
              className="admin-input admin-focus-ring w-full pl-10"
              disabled={isCatalogBulkMode}
            />
          </div>

          {/* Status Tabs (Tous, Publiés, Brouillons) — sliding pill */}
          {!isCatalogBulkMode && (
            <div
              className={`relative flex items-center p-0.5 rounded-xl border self-start md:self-auto ${
                adminTheme === 'light' ? 'bg-slate-100/80 border-slate-200/60' : 'bg-slate-950/60 border-slate-800'
              }`}
              role="tablist"
            >
              {/* Sliding pill */}
              <span
                ref={statusPillRef}
                aria-hidden="true"
                className="absolute left-0 top-0.5 pointer-events-none rounded-lg"
                style={{
                  height: 'calc(100% - 4px)',
                  background: adminTheme === 'light' ? '#ffffff' : 'hsl(224 18% 15%)',
                  boxShadow: adminTheme === 'light'
                    ? '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)'
                    : '0 1px 6px rgba(0,0,0,0.3)',
                  transition: 'transform 250ms cubic-bezier(0.22,1,0.36,1), width 250ms cubic-bezier(0.22,1,0.36,1)',
                  willChange: 'transform, width',
                  zIndex: 0,
                }}
              />
              <button
                ref={el => { statusBtnRefs.current[0] = el; }}
                type="button"
                role="tab"
                aria-selected={filterStatus === 'all'}
                onClick={() => {
                  setFilterStatus('all');
                  setCurrentPage(1);
                }}
                className={`relative z-10 px-3 py-1.5 rounded-lg transition-colors duration-200 flex items-center gap-1.5 font-semibold cursor-pointer ${
                  filterStatus === 'all'
                    ? (adminTheme === 'light' ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold')
                    : (adminTheme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200')
                }`}
                style={{ fontSize: 'var(--admin-text-2xs)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                <span>Tous</span>
                <span className={`px-1.5 py-0.5 rounded-md font-mono ${
                  filterStatus === 'all'
                    ? (adminTheme === 'light' ? 'bg-slate-200 text-slate-700 font-bold' : 'bg-slate-900 text-slate-300 font-bold')
                    : (adminTheme === 'light' ? 'bg-slate-200/50 text-slate-500' : 'bg-slate-950 text-slate-500')
                }`} style={{ fontSize: '9px' }}>
                  {counts.all}
                </span>
              </button>
              <button
                ref={el => { statusBtnRefs.current[1] = el; }}
                type="button"
                role="tab"
                aria-selected={filterStatus === 'live'}
                onClick={() => {
                  setFilterStatus('live');
                  setCurrentPage(1);
                }}
                className={`relative z-10 px-3 py-1.5 rounded-lg transition-colors duration-200 flex items-center gap-1.5 font-semibold cursor-pointer ${
                  filterStatus === 'live'
                    ? (adminTheme === 'light' ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold')
                    : (adminTheme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200')
                }`}
                style={{ fontSize: 'var(--admin-text-2xs)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                <span>Publiés</span>
                <span className={`px-1.5 py-0.5 rounded-md font-mono ${
                  filterStatus === 'live'
                    ? (adminTheme === 'light' ? 'bg-slate-200 text-slate-700 font-bold' : 'bg-slate-900 text-slate-300 font-bold')
                    : (adminTheme === 'light' ? 'bg-slate-200/50 text-slate-500' : 'bg-slate-950 text-slate-500')
                }`} style={{ fontSize: '9px' }}>
                  {counts.live}
                </span>
              </button>
              <button
                ref={el => { statusBtnRefs.current[2] = el; }}
                type="button"
                role="tab"
                aria-selected={filterStatus === 'draft'}
                onClick={() => {
                  setFilterStatus('draft');
                  setCurrentPage(1);
                }}
                className={`relative z-10 px-3 py-1.5 rounded-lg transition-colors duration-200 flex items-center gap-1.5 font-semibold cursor-pointer ${
                  filterStatus === 'draft'
                    ? (adminTheme === 'light' ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold')
                    : (adminTheme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200')
                }`}
                style={{ fontSize: 'var(--admin-text-2xs)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                <span>Brouillons</span>
                <span className={`px-1.5 py-0.5 rounded-md font-mono transition-colors ${
                  filterStatus === 'draft'
                    ? 'bg-rose-500/15 text-rose-500 font-bold'
                    : (adminTheme === 'light' ? 'bg-slate-200/50 text-slate-500 hover:text-rose-500/80' : 'bg-slate-950 text-slate-500 hover:text-rose-500/80')
                }`} style={{ fontSize: '9px' }}>
                  {counts.draft}
                </span>
              </button>
            </div>
          )}

          {/* View Mode Segmented Control — sliding pill */}
          {!isCatalogBulkMode && (
            <div
              className={`relative flex items-center p-0.5 rounded-xl border self-start md:self-auto ${
                adminTheme === 'light' ? 'bg-slate-100/80 border-slate-200/60' : 'bg-slate-950/60 border-slate-800'
              }`}
              role="tablist"
            >
              {/* Sliding pill */}
              <span
                ref={viewPillRef}
                aria-hidden="true"
                className="absolute left-0 top-0.5 pointer-events-none rounded-lg"
                style={{
                  height: 'calc(100% - 4px)',
                  background: adminTheme === 'light' ? '#ffffff' : 'hsl(224 18% 15%)',
                  boxShadow: adminTheme === 'light'
                    ? '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)'
                    : '0 1px 6px rgba(0,0,0,0.3)',
                  transition: 'transform 250ms cubic-bezier(0.22,1,0.36,1), width 250ms cubic-bezier(0.22,1,0.36,1)',
                  willChange: 'transform, width',
                  zIndex: 0,
                }}
              />
              <button
                ref={el => { viewBtnRefs.current[0] = el; }}
                type="button"
                role="tab"
                aria-selected={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                className={`relative z-10 px-3 py-1.5 rounded-lg transition-colors duration-200 flex items-center gap-1.5 font-semibold cursor-pointer ${
                  viewMode === 'list'
                    ? (adminTheme === 'light' ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold')
                    : (adminTheme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200')
                }`}
                style={{ fontSize: 'var(--admin-text-2xs)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                <List className="w-3.5 h-3.5" />
                <span>Liste</span>
              </button>
              <button
                ref={el => { viewBtnRefs.current[1] = el; }}
                type="button"
                role="tab"
                aria-selected={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
                className={`relative z-10 px-3 py-1.5 rounded-lg transition-colors duration-200 flex items-center gap-1.5 font-semibold cursor-pointer ${
                  viewMode === 'grid'
                    ? (adminTheme === 'light' ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold')
                    : (adminTheme === 'light' ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200')
                }`}
                style={{ fontSize: 'var(--admin-text-2xs)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grille</span>
              </button>
            </div>
          )}
        </div>

        {/* ROW 2: CTAs & Filters & Bulk Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Left Side: Filters */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            {/* Category Dropdown Filter */}
            {!isCatalogBulkMode && (
              <SearchableDropdown
                label="Toutes les catégories"
                value={filterCategory}
                onChange={(val) => {
                  setFilterCategory(val);
                  setCurrentPage(1);
                }}
                options={categoryOptions}
                placeholder="Rechercher une catégorie..."
                emptyMessage="Aucune catégorie trouvée"
                adminTheme={adminTheme}
              />
            )}

            {/* Brand/Marque Dropdown Filter */}
            {!isCatalogBulkMode && (
              <SearchableDropdown
                label="Toutes les marques"
                value={filterVendor}
                onChange={(val) => {
                  setFilterVendor(val);
                  setCurrentPage(1);
                }}
                options={uniqueVendors}
                placeholder="Rechercher une marque..."
                emptyMessage="Aucune marque trouvée"
                adminTheme={adminTheme}
              />
            )}

            {/* Filtres Spéciaux */}
            <div ref={specialDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsSpecialOpen(!isSpecialOpen)}
                className={`px-3 h-9 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer select-none ${
                  filterSpecial !== 'all'
                    ? (adminTheme === 'light'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm hover:bg-emerald-100/80 font-bold'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 font-bold')
                    : (adminTheme === 'light'
                        ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900 shadow-sm font-medium'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900')
                }`}
              >
                <Filter className={`w-3.5 h-3.5 ${filterSpecial !== 'all' ? 'text-emerald-500 font-bold' : 'text-slate-500'}`} />
                <span>
                  {filterSpecial === 'all' && 'Filtres Spéciaux'}
                  {filterSpecial === 'no_image' && 'Sans image'}
                  {filterSpecial === 'negative_stock' && 'Stock négatif'}
                  {filterSpecial === 'positive_stock' && 'Stock positif (> 0)'}
                  {filterSpecial === 'positive_stock_no_vendor' && 'Stock positif sans marque'}
                  {filterSpecial === 'positive_stock_no_desc' && 'Stock positif sans description'}
                  {filterSpecial === 'dead_products' && 'Produits morts (30j)'}
                  {filterSpecial === 'low_margin' && 'Marge faible/nég.'}
                  {filterSpecial === 'no_desc' && 'Sans description'}
                  {filterSpecial === 'out_of_stock' && 'En rupture'}
                  {filterSpecial === 'low_stock' && 'Stock critique'}
                  {filterSpecial === 'on_sale' && 'En promotion'}
                  {filterSpecial === 'needs_review' && 'À compléter'}
                </span>
                {filterSpecial !== 'all' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
              </button>

              {isSpecialOpen && (
                <div className={`absolute left-0 mt-1 z-50 w-72 rounded-xl border p-2 shadow-lg space-y-1 animate-in fade-in-30 slide-in-from-top-1 duration-150 ${
                  adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.08)]' : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-slate-800/60 pb-1.5 mb-1 select-none">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Filtres Avancés
                    </span>
                    {filterSpecial !== 'all' && (
                      <button
                        type="button"
                        onClick={() => {
                          handleFilterSpecialToggle('all');
                        }}
                        className="text-[9px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-400 cursor-pointer transition"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
                    {/* Option: All */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('all');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial === 'all'
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 opacity-70" />
                        <span>Tous les produits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{counts.all}</span>
                        {filterSpecial === 'all' && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFilterSpecialToggle('needs_review')}
                      title="Image, prix, stock, catégorie, marque ou ingrédients manquants"
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('needs_review')
                          ? (adminTheme === 'light' ? 'bg-amber-50 text-amber-900 font-bold' : 'bg-amber-500/15 text-amber-300 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-amber-50/70 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Fiches à compléter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.needsReview}</span>
                        {filterSpecial.split(',').includes('needs_review') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: Sans image */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('no_image');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('no_image')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ImageOff className="w-3.5 h-3.5 opacity-70" />
                        <span>Sans image</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.noImage}</span>
                        {filterSpecial.split(',').includes('no_image') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: Stock positif */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('positive_stock');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('positive_stock')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 opacity-70 text-emerald-500" />
                        <span>Stock positif (&gt; 0)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.positiveStock}</span>
                        {filterSpecial.split(',').includes('positive_stock') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: Stock positif sans marque */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('positive_stock_no_vendor');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('positive_stock_no_vendor')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 opacity-70 text-teal-500" />
                        <span>Stock positif sans marque</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.positiveStockNoVendor}</span>
                        {filterSpecial.split(',').includes('positive_stock_no_vendor') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: Stock négatif */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('negative_stock');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('negative_stock')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-3.5 h-3.5 opacity-70 text-rose-500" />
                        <span>Stock négatif</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.negativeStock}</span>
                        {filterSpecial.split(',').includes('negative_stock') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: Produits morts */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('dead_products');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('dead_products')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CalendarClock className="w-3.5 h-3.5 opacity-70" />
                        <span>Produits morts (30j)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.deadProducts}</span>
                        {filterSpecial.split(',').includes('dead_products') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: Rupture */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('out_of_stock');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('out_of_stock')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 opacity-70 text-rose-500" />
                        <span>En rupture</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.outOfStock}</span>
                        {filterSpecial.split(',').includes('out_of_stock') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: Stock critique */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('low_stock');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('low_stock')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 opacity-70 text-amber-500" />
                        <span>Stock critique (≤ {lowStockThreshold})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.lowStock}</span>
                        {filterSpecial.split(',').includes('low_stock') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: Low margin */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('low_margin');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('low_margin')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Coins className="w-3.5 h-3.5 opacity-70 text-amber-600" />
                        <span>Marge faible ou négative</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.lowMargin}</span>
                        {filterSpecial.split(',').includes('low_margin') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: Description manquante */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('no_desc');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('no_desc')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 opacity-70" />
                        <span>Description manquante</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.noDesc}</span>
                        {filterSpecial.split(',').includes('no_desc') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: Stock positif sans description */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('positive_stock_no_desc');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('positive_stock_no_desc')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 opacity-70 text-amber-500" />
                        <span>Stock + sans description</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.positiveStockNoDesc}</span>
                        {filterSpecial.split(',').includes('positive_stock_no_desc') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: En promotion */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('on_sale');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('on_sale')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Percent className="w-3.5 h-3.5 opacity-70 text-rose-500" />
                        <span>En promotion</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.onSale}</span>
                        {filterSpecial.split(',').includes('on_sale') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1.5 select-none">
                    {/* Action: Lot rapide (Bulk Edit Mode) */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCatalogBulkMode(!isCatalogBulkMode);
                        setIsSpecialOpen(false);
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 font-bold cursor-pointer ${
                        isCatalogBulkMode
                          ? (adminTheme === 'light' ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/20 text-amber-400')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-700 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <Table className="w-3.5 h-3.5 text-amber-500" />
                      <span>Mode Édition en Lot (Lot rapide)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div ref={savedViewsRef} className="relative">
              <button
                type="button"
                onClick={() => setIsSavedViewsOpen(value => !value)}
                className={`px-3 h-9 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                  adminTheme === 'light'
                    ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 shadow-sm'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-violet-500" />
                <span>Vues</span>
              </button>
              {isSavedViewsOpen && (
                <div className={`absolute right-0 mt-2 z-50 w-72 rounded-2xl border p-3 shadow-2xl ${adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                  <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-2">Enregistrer cette vue</p>
                  <div className="flex gap-2">
                    <input value={savedViewName} onChange={(event) => setSavedViewName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') saveCurrentView(); }} placeholder="Ex. Stock faible" className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                    <button type="button" onClick={saveCurrentView} className="rounded-lg bg-violet-600 px-3 text-xs font-bold text-white hover:bg-violet-500">Sauver</button>
                  </div>
                  <div className="mt-3 max-h-52 space-y-1 overflow-y-auto">
                    {savedViews.length === 0 ? <p className="px-1 py-2 text-xs text-slate-400">Aucune vue enregistrée.</p> : savedViews.map(view => (
                      <div key={view.id} className="group flex items-center gap-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900">
                        <button type="button" onClick={() => applySavedView(view)} className="min-w-0 flex-1 truncate px-2.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200">{view.name}</button>
                        <button type="button" onClick={() => { const next = savedViews.filter(item => item.id !== view.id); setSavedViews(next); localStorage.setItem('admin_catalog_saved_views', JSON.stringify(next)); }} className="p-2 text-slate-400 hover:text-rose-500" title="Supprimer la vue"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Importer */}
            <button
              type="button"
              onClick={() => { setImportResult(null); setIsImportModalOpen(true); }}
              className={`px-3 h-9 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                adminTheme === 'light'
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-emerald-50/50 hover:border-emerald-200 hover:text-emerald-700 shadow-sm font-medium'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-emerald-500" />
              <span>Importer</span>
            </button>

            {/* Exporter */}
            <button
              type="button"
              onClick={handleExportCatalogToCsv}
              className={`px-3 h-9 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                adminTheme === 'light'
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-sky-50/50 hover:border-sky-200 hover:text-sky-700 shadow-sm font-medium'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-sky-500" />
              <span>Exporter</span>
            </button>

            {/* Rafraîchir */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`px-3 h-9 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                adminTheme === 'light'
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900 shadow-sm font-medium'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-emerald-500 font-bold' : ''}`} />
              <span>Rafraîchir</span>
            </button>

            {/* Nouveau Produit CTA */}
            <button
              type="button"
              onClick={() => setIsNewProductModalOpen(true)}
              className="px-4 h-9 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Produit</span>
            </button>
          </div>
        </div>
      </div>

      {/* SPREADSHEET BULK EDITOR VIEW */}
      {isCatalogBulkMode ? (
        <div className={`border rounded-2xl overflow-hidden shadow-xl space-y-4 ${adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/30 border-slate-900'}`}>
          <div className={`p-4 text-xs flex justify-between items-center border-b ${adminTheme === 'light' ? 'bg-amber-50/50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
            <div className={`flex items-center gap-2 font-bold ${adminTheme === 'light' ? 'text-amber-800' : 'text-amber-400'}`}>
              <AlertCircle className="w-4 h-4" />
              <span>Mode Édition en Lot : Les modifications seront enregistrées après validation globale.</span>
            </div>
            <span className={`font-mono ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{changedProductIds.size} produit(s) modifié(s)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-mono">
              <thead>
                <tr className={`text-[10px] uppercase tracking-wider font-extrabold border-b ${adminTheme === 'light' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                  <th className="p-3">ID</th>
                  <th className="p-3">Image</th>
                  <th className="p-3 w-[250px]">Titre Français</th>
                  <th className="p-3 w-40">SKU</th>
                  <th className="p-3">Catégorie</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 w-52">Ingrédients actifs</th>
                  <th className="p-3">Prix (DH)</th>
                  <th className="p-3">Prix Comp. (DH)</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Coût d&apos;achat (DH)</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${adminTheme === 'light' ? 'divide-slate-100' : 'divide-slate-900'}`}>
                {bulkProducts.map(p => {
                  const isChanged = changedProductIds.has(p.id);
                  return (
                    <tr key={p.id} className={`transition-colors ${isChanged ? (adminTheme === 'light' ? 'bg-emerald-50/70 hover:bg-emerald-100/60' : 'bg-emerald-950/15 hover:bg-emerald-950/25') : (adminTheme === 'light' ? 'hover:bg-slate-50/80' : 'hover:bg-slate-900/10')}`}>
                      <td className={`p-3 font-bold ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-500'}`}>{p.id}</td>
                      <td className="p-3">
                        <div className="relative w-8 h-8 rounded-md overflow-hidden">
                          <Image src={p.image || '/placeholder.png'} alt={p.title || ''} fill className={`object-cover border ${adminTheme === 'light' ? 'border-slate-200' : 'border-slate-800'}`} sizes="32px" />
                        </div>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={p.nameFr || p.title}
                          onChange={(e) => handleBulkCellChange(p.id, 'nameFr', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1 focus:border-accent text-slate-200 outline-none font-sans text-xs"
                        />
                      </td>
                      <td className="p-3 w-36">
                        <input
                          type="text"
                          value={p.sku || ''}
                          onChange={(e) => handleBulkCellChange(p.id, 'sku', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1 focus:border-accent text-slate-200 outline-none font-mono text-xs"
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={p.category}
                          onChange={(e) => handleBulkCellChange(p.id, 'category', e.target.value)}
                          className="bg-slate-950 border border-slate-900 rounded px-1.5 py-1 focus:border-accent text-slate-300 outline-none font-sans text-xs cursor-pointer"
                        >
                          {categoryOptions.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <select
                          value={p.status || 'live'}
                          onChange={(e) => handleBulkCellChange(p.id, 'status', e.target.value)}
                          className="bg-slate-950 border border-slate-900 rounded px-1.5 py-1 focus:border-accent text-slate-300 outline-none font-sans text-xs cursor-pointer"
                        >
                          <option value="live">Publié</option>
                          <option value="draft">Brouillon</option>
                        </select>
                      </td>
                      <td className="p-3 w-52">
                        <input
                          type="text"
                          value={p.ingredients || ''}
                          onChange={(e) => handleBulkCellChange(p.id, 'ingredients', e.target.value)}
                          placeholder="Ex. niacinamide, rétinol"
                          className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1 focus:border-accent text-slate-200 outline-none font-sans text-xs"
                        />
                      </td>
                      <td className="p-3 w-24">
                        <input
                          type="number"
                          value={p.price}
                          onChange={(e) => handleBulkCellChange(p.id, 'price', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1 focus:border-accent text-slate-200 outline-none text-right"
                        />
                      </td>
                      <td className="p-3 w-24">
                        <input
                          type="number"
                          value={p.comparePrice}
                          onChange={(e) => handleBulkCellChange(p.id, 'comparePrice', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1 focus:border-accent text-slate-200 outline-none text-right"
                        />
                      </td>
                      <td className="p-3 w-20">
                        <input
                          type="number"
                          value={p.stock !== undefined ? p.stock : 100}
                          onChange={(e) => handleBulkCellChange(p.id, 'stock', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1 focus:border-accent text-slate-200 outline-none text-right"
                        />
                      </td>
                      <td className="p-3 w-24">
                        <input
                          type="number"
                          value={p.buyingCost || 0}
                          onChange={(e) => handleBulkCellChange(p.id, 'buyingCost', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1 focus:border-accent text-slate-200 outline-none text-right"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Floating bottom action bar */}
          {changedProductIds.size > 0 && (
            <div className="p-4 bg-slate-950 border-t border-slate-900 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-bold">
                {changedProductIds.size} produit(s) en attente d&apos;enregistrement.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setBulkProducts(JSON.parse(JSON.stringify(products)));
                    setChangedProductIds(new Set());
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-lg border border-slate-800 text-xs uppercase transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveBulkChanges}
                  disabled={isSavingBulk}
                  className="premium-green-cta px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wide transition flex items-center gap-1 shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  {isSavingBulk ? 'Enregistrement...' : 'Enregistrer tout'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* DEDICATED FULL-WIDTH SELECTION BANNER ROW (DIRECT ACTION PILLS & POP-OVER) */}
          {selectedProductIds.size > 0 && (
            <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-md transition-all duration-200 ${
              adminTheme === 'light'
                ? 'bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 border-emerald-200 text-slate-800 shadow-emerald-500/5'
                : 'bg-gradient-to-r from-slate-900/90 via-emerald-950/30 to-slate-900/90 border-emerald-800/40 text-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-300 bg-white/90 dark:bg-emerald-950/70 px-3.5 py-1.5 rounded-xl border border-emerald-200/90 dark:border-emerald-800/80 shadow-2xs">
                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{selectedProductIds.size} {selectedProductIds.size > 1 ? 'produits sélectionnés' : 'produit sélectionné'}</span>
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
                  sur {totalProducts} au total
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 relative">
                {/* 1-Click Action: Supprimer */}
                <button
                  type="button"
                  onClick={() => handleApplyBulkAction('delete')}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                  <span>Supprimer ({selectedProductIds.size})</span>
                </button>

                {/* 1-Click Action: Publier */}
                <button
                  type="button"
                  onClick={() => handleApplyBulkAction('publish')}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Publier</span>
                </button>

                {/* 1-Click Action: Brouillon */}
                <button
                  type="button"
                  onClick={() => handleApplyBulkAction('draft')}
                  className={`px-3.5 py-1.5 border font-bold text-xs rounded-xl active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 ${
                    adminTheme === 'light'
                      ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  <span>Brouillon</span>
                </button>

                {/* Custom Popover: Catégorie */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCatPopoverOpen(prev => !prev)}
                    className={`px-3.5 py-1.5 border font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                      adminTheme === 'light'
                        ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Catégorie</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCatPopoverOpen ? 'rotate-180 text-emerald-500' : 'text-slate-400'}`} />
                  </button>

                  {isCatPopoverOpen && (
                    <div className={`absolute right-0 top-full mt-2 w-52 rounded-2xl border p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
                      adminTheme === 'light'
                        ? 'bg-white/95 border-slate-200/90 text-slate-800 backdrop-blur-xl'
                        : 'bg-slate-900/95 border-slate-800 text-slate-200 backdrop-blur-xl'
                    }`}>
                      <div className="px-2 py-1 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                        Assigner Catégorie
                      </div>
                      <div className="space-y-1">
                        {categoryOptions.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setIsCatPopoverOpen(false);
                              handleApplyBulkAction('categorize', cat);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-xl flex items-center justify-between transition cursor-pointer ${
                              adminTheme === 'light'
                                ? 'hover:bg-emerald-50 hover:text-emerald-700 text-slate-700'
                                : 'hover:bg-emerald-950/50 hover:text-emerald-400 text-slate-300'
                            }`}
                          >
                            <span>{cat.toUpperCase()}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

                {/* Cancel Selection */}
                <button
                  type="button"
                  onClick={() => { setSelectedProductIds(new Set()); setBulkAction(''); }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-bold text-xs cursor-pointer transition rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Désélectionner tout"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          <div className="relative min-h-[350px]">
            {isLocalLoading && (
              <div className="absolute inset-0 bg-slate-950/5 dark:bg-slate-950/20 backdrop-blur-[0.5px] flex items-center justify-center z-30 transition-all duration-300">
                <div className={`p-4 rounded-2xl border flex items-center gap-3 shadow-lg select-none ${
                  adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}>
                  <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                  <span className="text-xs font-semibold">Chargement des produits...</span>
                </div>
              </div>
            )}
            {viewMode === 'list' ? (
            /* MODERN TABLE LIST VIEW (DEFAULT) */
            <div className={`border rounded-2xl overflow-hidden shadow-sm transition duration-300 ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
                : 'bg-slate-900/30 border-slate-900/80'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--admin-border)', background: 'var(--admin-surface-2)' }}>
                      {/* Checkbox Header */}
                      <th className="p-3 w-10 text-center select-none">
                        <input 
                          type="checkbox" 
                          checked={isAllOnPageSelected} 
                          onChange={handleSelectAllOnPage} 
                          className="rounded cursor-pointer accent-emerald-500" 
                        />
                      </th>
                      {/* Image */}
                      <th className="p-3 font-bold w-12 text-center select-none uppercase tracking-widest text-[9px]" style={{ color: 'var(--admin-text-faint)' }}>Image</th>
                      {/* Nom */}
                      <th 
                        onClick={() => handleSort('name')} 
                        className="p-3 font-bold cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 transition uppercase tracking-widest text-[9px]"
                        style={{ color: 'var(--admin-text-faint)' }}
                      >
                        <div className="flex items-center gap-1">
                          <span>Nom</span>
                          {sortField === 'name' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-emerald-500" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                          )}
                        </div>
                      </th>
                      {/* SKU */}
                      <th 
                        onClick={() => handleSort('sku')} 
                        className="p-3 font-bold cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 transition uppercase tracking-widest text-[9px]"
                        style={{ color: 'var(--admin-text-faint)' }}
                      >
                        <div className="flex items-center gap-1">
                          <span>SKU</span>
                          {sortField === 'sku' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-emerald-500" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                          )}
                        </div>
                      </th>
                      {/* Stock */}
                      <th 
                        onClick={() => handleSort('stock')} 
                        className="p-3 font-bold cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 transition uppercase tracking-widest text-[9px]"
                        style={{ color: 'var(--admin-text-faint)' }}
                      >
                        <div className="flex items-center gap-1">
                          <span>Stock</span>
                          {sortField === 'stock' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-emerald-500" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                          )}
                        </div>
                      </th>
                      {/* Prix */}
                      <th 
                        onClick={() => handleSort('price')} 
                        className="p-3 font-bold text-right cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 transition uppercase tracking-widest text-[9px]"
                        style={{ color: 'var(--admin-text-faint)' }}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Prix</span>
                          {sortField === 'price' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-emerald-500" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                          )}
                        </div>
                      </th>
                      {/* Catégorie */}
                      <th 
                        onClick={() => handleSort('category')} 
                        className="p-3 font-bold cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 transition uppercase tracking-widest text-[9px]"
                        style={{ color: 'var(--admin-text-faint)' }}
                      >
                        <div className="flex items-center gap-1">
                          <span>Catégorie</span>
                          {sortField === 'category' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-emerald-500" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                          )}
                        </div>
                      </th>
                      {/* Marque */}
                      <th 
                        onClick={() => handleSort('vendor')} 
                        className="p-3 font-bold cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 transition uppercase tracking-widest text-[9px]"
                        style={{ color: 'var(--admin-text-faint)' }}
                      >
                        <div className="flex items-center gap-1">
                          <span>Marque</span>
                          {sortField === 'vendor' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-emerald-500" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${adminTheme === 'light' ? 'divide-slate-100' : 'divide-slate-800'}`}>
                    {paginatedProducts.map(product => {
                      const stock = product.stock !== undefined ? product.stock : 100;
                      
                      // Stock status
                      const isOutOfStock = stock === 0;
                      const isLowStock = stock <= lowStockThreshold && stock > 0;

                      return (
                      <tr key={product.id} className={`group transition-colors duration-150 ${
                        adminTheme === 'light' ? 'hover:bg-slate-50/50' : 'hover:bg-slate-900/10'
                      }`}>
                        {/* Checkbox cell */}
                        <td className="p-3 text-center whitespace-nowrap">
                          <input 
                            type="checkbox" 
                            checked={selectedProductIds.has(product.id)} 
                            onChange={() => handleToggleSelectProduct(product.id)}
                            className="rounded cursor-pointer accent-emerald-500" 
                          />
                        </td>

                        {/* Image */}
                        <td className="p-3 text-center whitespace-nowrap">
                          <div className={`relative w-8 h-8 rounded-lg overflow-hidden border mx-auto shrink-0 transition-transform hover:scale-105 duration-200 ${
                            adminTheme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950'
                          }`}>
                            {product.image ? (
                              <Image 
                                src={product.image} 
                                alt={product.title || ''} 
                                fill 
                                className="object-cover" 
                                sizes="32px" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950">
                                <Layers className="w-3.5 h-3.5 opacity-60" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Nom */}
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold text-xs truncate max-w-[280px] block ${
                                adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'
                              }`} title={product.nameFr || product.title}>
                                {product.nameFr || product.title}
                              </span>
                              {product.status === 'draft' && (
                                <StatusBadge status="inactive" label="Brouillon" dot={false} theme={adminTheme} size="xs" />
                              )}
                            </div>
                            
                            {/* WooCommerce style Hover Actions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[10px] text-slate-400 mt-1.5 flex items-center gap-1.5 font-medium select-none">
                              <span className="text-slate-400 dark:text-slate-500">ID: {product.id}</span>
                              <span className="text-slate-300 dark:text-slate-800">|</span>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProductForm(product);
                                  setIsNewProductModalOpen(true);
                                }}
                                className="text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 cursor-pointer"
                              >
                                Edit
                              </button>
                              <span className="text-slate-300 dark:text-slate-800">|</span>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProductForm(product);
                                  setIsNewProductModalOpen(true);
                                }}
                                className="text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 cursor-pointer"
                              >
                                Quick Edit
                              </button>
                              <span className="text-slate-300 dark:text-slate-800">|</span>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDialog({
                                    title: 'Supprimer le produit ?',
                                    message: `Voulez-vous vraiment supprimer le produit "${product.nameFr || product.title}" ? Cette action est définitive.`,
                                    confirmText: 'Supprimer',
                                    confirmStyle: 'danger',
                                    openedAt: Date.now(),
                                    onConfirm: async () => {
                                      // Instant optimistic removal (0ms delay!)
                                      setPaginatedProducts(prev => prev.filter(p => p.id !== product.id));
                                      setTotalProducts((prev: number) => Math.max(0, prev - 1));

                                      try {
                                        const res = await fetch(`/api/admin/products?id=${product.id}`, {
                                          method: 'DELETE'
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                          showToast('Produit supprimé.', 'success');
                                        } else {
                                          showToast(data.error || 'Erreur lors de la suppression.', 'error');
                                        }
                                      } catch {
                                        showToast('Erreur de connexion.', 'error');
                                      } finally {
                                        // Quiet background sync without skeleton takeover
                                        loadProducts();
                                        fetchPaginatedProducts();
                                      }
                                    }
                                  });
                                }}
                                className="text-rose-600 dark:text-rose-400 hover:text-rose-500 dark:hover:text-rose-300 cursor-pointer"
                              >
                                Trash
                              </button>
                              <span className="text-slate-300 dark:text-slate-800">|</span>
                              <a 
                                href={`/products/${product.id}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300"
                              >
                                View
                              </a>
                              <span className="text-slate-300 dark:text-slate-800">|</span>
                              <button 
                                type="button"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    const { id, ...copyData } = product;
                                    copyData.title = `${copyData.title} (Copie)`;
                                    if (copyData.nameFr) copyData.nameFr = `${copyData.nameFr} (Copie)`;
                                    const success = await handleCreateProduct(copyData);
                                    if (success) {
                                      showToast('Produit dupliqué.', 'success');
                                      await loadProducts();
                                      await fetchPaginatedProducts();
                                    } else {
                                      showToast('Erreur lors de la duplication.', 'error');
                                    }
                                  } catch {
                                    showToast('Erreur de connexion.', 'error');
                                  }
                                }}
                                className="text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 cursor-pointer"
                              >
                                Duplicate
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {product.sku || '-'}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          {isOutOfStock ? (
                            <StatusBadge status="error" label="Rupture (0)" dot={true} theme={adminTheme} size="xs" />
                          ) : isLowStock ? (
                            <StatusBadge status="warning" label={`Stock bas (${stock})`} dot={true} theme={adminTheme} size="xs" />
                          ) : (
                            <StatusBadge status="active" label={`En stock (${stock})`} dot={true} theme={adminTheme} size="xs" />
                          )}
                        </td>

                        {/* Prix Public */}
                        <td className="p-3 text-right font-mono text-xs whitespace-nowrap">
                          <span className={`font-bold ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
                            {product.price.toFixed(2)} DH
                          </span>
                        </td>

                        {/* Catégorie */}
                        <td className="p-3 whitespace-nowrap">
                          <span className={`text-[10px] uppercase font-semibold tracking-wider ${
                            adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                          }`}>
                            {(product.categories?.length ? product.categories : [product.category]).join(' · ')}
                          </span>
                        </td>

                        {/* Marque */}
                        <td className="p-3 whitespace-nowrap">
                          <span className={`text-[10px] uppercase font-semibold tracking-wider ${
                            adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                          }`}>
                            {product.vendor || '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedProducts.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-12">
                        <EmptyState
                          icon={Search}
                          title="Aucun produit trouvé"
                          description="Aucun produit ne correspond à vos filtres de recherche ou de catégorie actuels."
                          theme={adminTheme}
                          action={{
                            label: "Réinitialiser les filtres",
                            onClick: () => {
                              setProductSearchQuery('');
                              setFilterCategory('all');
                              setFilterVendor('all');
                              setFilterStatus('all');
                              setFilterSpecial('all');
                              setCatalogStockFilter(false);
                            }
                          }}
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* STANDARD CATALOG GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedProducts.map(product => {
              const stock = product.stock !== undefined ? product.stock : 100;
              return (
                <div key={product.id} className={`border rounded-2xl overflow-hidden transition duration-300 flex flex-col justify-between group ${adminTheme === 'light' ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm' : 'bg-slate-900/40 border-slate-900 hover:border-slate-800'}`}>
                  <div className={`relative aspect-square w-full overflow-hidden border-b ${adminTheme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-950 border-slate-900'} flex items-center justify-center`}>
                    {product.image ? (
                      <Image 
                        src={product.image} 
                        alt={product.title || ''} 
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950">
                        <Layers className="w-12 h-12 opacity-30" />
                      </div>
                    )}
                    {product.status === 'draft' && (
                      <div className="absolute top-3 left-3">
                        <StatusBadge status="inactive" label="Brouillon" dot={false} theme={adminTheme} size="xs" />
                      </div>
                    )}
                    <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full border text-[9px] uppercase font-bold shadow-sm ${adminTheme === 'light' ? 'bg-white/95 border-slate-200 text-slate-600' : 'bg-slate-950/80 border-slate-800 text-slate-400'}`}>
                      {product.category}
                    </span>
                  </div>
                  
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-1">
                        <span className="text-[10px] text-slate-500 font-mono tracking-wider">
                          ID: {product.id} {product.sku && `• SKU: ${product.sku}`} • {product.vendor}
                        </span>
                        {product.variants && product.variants.length > 0 && (
                          <span className="px-1 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[7px] uppercase font-extrabold rounded-md">
                            {product.variants.length} var
                          </span>
                        )}
                      </div>
                      <h4 className={`font-extrabold text-sm line-clamp-1 transition-colors ${adminTheme === 'light' ? 'text-slate-800 group-hover:text-slate-950' : 'text-slate-200 group-hover:text-slate-100'}`}>{product.nameFr || product.title}</h4>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-500 uppercase font-semibold block">Prix Public</span>
                        <span className={`font-extrabold font-mono text-sm ${adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>{product.price} DH</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 uppercase font-semibold block mb-0.5">Stock</span>
                        <StatusBadge
                          status={stock === 0 ? 'error' : stock <= lowStockThreshold ? 'warning' : 'active'}
                          label={`${stock} pcs`}
                          dot={true}
                          theme={adminTheme}
                          size="xs"
                        />
                      </div>
                    </div>

                    <div className={`pt-2 border-t flex gap-2 justify-end ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-950'}`}>
                      <button
                        onClick={() => {
                          setProductForm(product);
                          setIsNewProductModalOpen(true);
                        }}
                        className={`p-2 border rounded-lg transition cursor-pointer ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-100' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'}`}
                        title="Modifier"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Panel */}
        <div className={`p-4 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-2xl border transition-all duration-200 ${
          adminTheme === 'light'
            ? 'bg-white border-slate-200/80 shadow-sm text-slate-700'
            : 'bg-slate-900/30 border-slate-900 text-slate-300'
        }`}>
          <div className="text-xs text-slate-500 font-medium">
            {totalProducts > 0 ? (
              <span>Affichage de <b>{(currentPage - 1) * itemsPerPage + 1}</b> à <b>{Math.min(currentPage * itemsPerPage, totalProducts)}</b> sur <b>{totalProducts}</b> produits</span>
            ) : (
              <span>Aucun produit à afficher</span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>Par page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded-lg border outline-none text-xs cursor-pointer font-medium ${
                  adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                {[10, 20, 50, 100].map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition ${
                  adminTheme === 'light' ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                Précédent
              </button>
              <span className="text-xs text-slate-500 px-2 font-medium">Page <b>{currentPage}</b> sur <b>{totalPages}</b></span>
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition ${
                  adminTheme === 'light' ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* -------------------- FULL-SCREEN PRODUCT WORKSPACE STUDIO -------------------- */}
      {isMounted && isNewProductModalOpen && createPortal(
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center p-3 md:p-6 z-[999999] select-none animate-in fade-in duration-200"
          onClick={() => {
            setIsNewProductModalOpen(false);
            setModalTab('general');
            setProductForm({
              title: '', vendor: '', price: 0, comparePrice: 0, category: 'visage', categories: ['visage'], tags: [], stock: 100, description: '', ingredients: '', usage: '', image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop', sku: '', buyingCost: 0, status: 'live'
            });
          }}
        >
          <form 
            onSubmit={handleCreateProductSubmit} 
            className={`w-full max-w-7xl h-[92vh] max-h-[950px] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-200 animate-in zoom-in-95 duration-250 ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200 text-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Studio Header */}
            <div className={`flex flex-wrap items-center justify-between border-b px-6 py-4 flex-shrink-0 gap-4 ${
              adminTheme === 'light' ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800 bg-slate-950/50'
            }`}>
              {/* Product Info Summary */}
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shrink-0">
                  <Image 
                    src={productForm.image || '/placeholder.png'} 
                    alt={productForm.title || 'Produit'} 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold truncate max-w-md">
                      {productForm.title || 'Nouveau Produit'}
                    </h3>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      productForm.status === 'live' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                        : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
                    }`}>
                      {productForm.status === 'live' ? '🟢 Publié' : '🟡 Brouillon'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {productForm.id ? `ID Produit #${productForm.id} • SKU: ${productForm.sku || 'N/A'}` : 'Création nouveau produit dans le catalogue'}
                  </p>
                </div>
              </div>

              {/* Center Navigation Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                {[
                  { id: 'general', label: 'Général & Médias', icon: Edit3 },
                  { id: 'pricing', label: 'Tarifs & Marge', icon: Coins },
                  { id: 'variants', label: 'Variantes', icon: Layers },
                  { id: 'seo', label: 'Google SEO', icon: Globe },
                ].map(({ id, label, icon: Icon }) => {
                  const active = modalTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setModalTab(id as any)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border-0 outline-none ${
                        active
                          ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-extrabold'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Action CTA */}
              <div className="flex items-center gap-3">
                <button 
                  type="submit" 
                  disabled={isSavingProduct}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>{isSavingProduct ? 'Sauvegarde...' : 'Enregistrer'}</span>
                </button>

                <button 
                  type="button" 
                  onClick={() => {
                    setIsNewProductModalOpen(false);
                    setModalTab('general');
                  }} 
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Split Workspace Body */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
              {/* Main Content Area (8 Cols) */}
              <div className="lg:col-span-8 p-6 space-y-6">
                {modalTab === 'general' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Packshot Image Card */}
                    <div className={`p-4 rounded-2xl border ${
                      adminTheme === 'light' ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
                    }`}>
                      <label className="text-xs font-black uppercase tracking-wider block mb-3 text-slate-500">
                        Visuel du Produit
                      </label>
                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0 shadow-sm">
                          <Image src={productForm.image || '/placeholder.png'} alt={productForm.title || ''} fill className="object-cover" />
                        </div>
                        <div className="flex-1 space-y-3 w-full">
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={productForm.image} 
                              onChange={(e) => setProductForm({...productForm, image: e.target.value})} 
                              className={`flex-1 font-mono text-xs border rounded-xl px-3 py-2 transition outline-none ${
                                adminTheme === 'light'
                                  ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500'
                                  : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-emerald-500'
                              }`} 
                              placeholder="https://..."
                            />
                            <label 
                              htmlFor="product-file-input"
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition shrink-0"
                            >
                              <Upload className="w-4 h-4" />
                              <span>{isUploading ? 'Chargement...' : 'Fichier'}</span>
                            </label>
                            <input 
                              id="product-file-input"
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageUpload} 
                              className="hidden" 
                            />
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Recommandé: Format carré WebP ou PNG avec fond blanc transparent (minimum 800x800 px).
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Title & Brand */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Titre Français</label>
                        <input 
                          type="text" 
                          value={productForm.nameFr || productForm.title} 
                          onChange={(e) => setProductForm({...productForm, title: e.target.value, nameFr: e.target.value})} 
                          className={`w-full text-xs font-semibold border rounded-xl px-3.5 py-2.5 transition outline-none ${
                            adminTheme === 'light'
                              ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500 shadow-xs'
                              : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-emerald-500'
                          }`} 
                          required 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Marque / Laboratoire</label>
                        <BrandCombobox
                          value={productForm.vendor || ''}
                          onChange={(val) => setProductForm({ ...productForm, vendor: val })}
                          availableVendors={uniqueVendors}
                          adminTheme={adminTheme}
                        />
                      </div>
                    </div>

                    {/* Description Textarea */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description Produit</label>
                        <span className="text-[10px] text-slate-400 font-mono">{productForm.description?.length || 0} caractères</span>
                      </div>
                      <textarea 
                        value={productForm.description} 
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})} 
                        className={`w-full text-xs border rounded-2xl p-4 transition outline-none leading-relaxed ${
                          adminTheme === 'light'
                            ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500 shadow-xs'
                            : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-emerald-500'
                        }`} 
                        rows={5} 
                        placeholder="Description complète des bienfaits, principes actifs et résultats scientifiques..."
                      />
                    </div>

                    {/* Conseils Dermo */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Conseils d&apos;utilisation</label>
                        <textarea 
                          value={productForm.usage || ''} 
                          onChange={(e) => setProductForm({...productForm, usage: e.target.value})} 
                          className={`w-full text-xs border rounded-xl p-3 transition outline-none ${
                            adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-emerald-500'
                          }`} 
                          rows={3} 
                          placeholder="Appliquer matin et soir sur une peau propre..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'pricing' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Live Margin Calculation Cards */}
                    {(() => {
                      const price = Number(productForm.price) || 0;
                      const cost = Number(productForm.buyingCost) || 0;
                      const profit = price - cost;
                      const marginPct = price > 0 ? Math.round((profit / price) * 100) : 0;
                      const stock = Number(productForm.stock) || 0;
                      const stockVal = price * stock;

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className={`p-4 rounded-2xl border ${adminTheme === 'light' ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-950/30 border-emerald-800/50'}`}>
                            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block">Marge Brute %</span>
                            <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">{marginPct}%</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">Rentabilité calculée</span>
                          </div>

                          <div className={`p-4 rounded-2xl border ${adminTheme === 'light' ? 'bg-sky-50/70 border-sky-200' : 'bg-sky-950/30 border-sky-800/50'}`}>
                            <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 block">Profit Unitaire</span>
                            <span className="text-xl font-black text-sky-700 dark:text-sky-300">+{profit.toFixed(2)} DH</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">Par vente</span>
                          </div>

                          <div className={`p-4 rounded-2xl border ${adminTheme === 'light' ? 'bg-purple-50/70 border-purple-200' : 'bg-purple-950/30 border-purple-800/50'}`}>
                            <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 block">Valeur Stock</span>
                            <span className="text-xl font-black text-purple-700 dark:text-purple-300">{stockVal.toLocaleString()} DH</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">{stock} unités en stock</span>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Prix Vente Public (DH)</label>
                        <input 
                          type="number" 
                          value={productForm.price || ''} 
                          onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})} 
                          className={`w-full text-xs font-mono font-bold border rounded-xl px-3.5 py-2.5 text-right transition outline-none ${
                            adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-emerald-500'
                          }`} 
                          required 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Prix Barré / Promo (DH)</label>
                        <input 
                          type="number" 
                          value={productForm.comparePrice || ''} 
                          onChange={(e) => setProductForm({...productForm, comparePrice: Number(e.target.value)})} 
                          className={`w-full text-xs font-mono border rounded-xl px-3.5 py-2.5 text-right transition outline-none ${
                            adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-emerald-500'
                          }`} 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Coût d&apos;Achat Fournisseur (DH)</label>
                        <input 
                          type="number" 
                          value={productForm.buyingCost || ''} 
                          onChange={(e) => setProductForm({...productForm, buyingCost: Number(e.target.value)})} 
                          className={`w-full text-xs font-mono border rounded-xl px-3.5 py-2.5 text-right transition outline-none ${
                            adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-emerald-500'
                          }`} 
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Quantité en Stock</label>
                        <input 
                          type="number" 
                          value={productForm.stock !== undefined ? productForm.stock : 100} 
                          onChange={(e) => setProductForm({...productForm, stock: Number(e.target.value)})} 
                          className={`w-full text-xs font-mono font-bold border rounded-xl px-3.5 py-2.5 text-right transition outline-none ${
                            adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-emerald-500'
                          }`} 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'variants' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-slate-500">Configurez des variations pour ce produit avec des prix et stocks distincts.</p>
                      <button
                        type="button"
                        onClick={() => {
                          const currentVariants = productForm.variants || [];
                          const nextId = `var_${Date.now()}`;
                          const updated = [...currentVariants, { id: nextId, title: 'Option Sizing', price: productForm.price || 0, comparePrice: productForm.comparePrice || productForm.price || 0, stock: 10 }];
                          const sumStock = updated.reduce((sum, v) => sum + v.stock, 0);
                          setProductForm({ ...productForm, variants: updated, stock: sumStock });
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase transition cursor-pointer border-0 outline-none flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajouter Variante</span>
                      </button>
                    </div>

                    {productForm.variants && productForm.variants.length > 0 ? (
                      <div className="space-y-3">
                        {productForm.variants.map((v, idx) => (
                          <div key={v.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/30 dark:bg-slate-950/30">
                            <div className="md:col-span-4 space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Titre Option</label>
                              <input
                                type="text"
                                value={v.title}
                                onChange={(e) => {
                                  const updated = [...(productForm.variants || [])];
                                  updated[idx] = { ...v, title: e.target.value };
                                  setProductForm({ ...productForm, variants: updated });
                                }}
                                className="w-full text-xs border rounded-xl px-3 py-1.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 outline-none"
                                required
                              />
                            </div>
                            <div className="md:col-span-3 space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Prix (DH)</label>
                              <input
                                type="number"
                                value={v.price}
                                onChange={(e) => {
                                  const updated = [...(productForm.variants || [])];
                                  updated[idx] = { ...v, price: Number(e.target.value) };
                                  setProductForm({ ...productForm, variants: updated });
                                }}
                                className="w-full text-xs font-mono border rounded-xl px-3 py-1.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-right outline-none"
                                required
                              />
                            </div>
                            <div className="md:col-span-3 space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Stock</label>
                              <input
                                type="number"
                                value={v.stock}
                                onChange={(e) => {
                                  const updated = [...(productForm.variants || [])];
                                  updated[idx] = { ...v, stock: Number(e.target.value) };
                                  const sumStock = updated.reduce((sum, item) => sum + item.stock, 0);
                                  setProductForm({ ...productForm, stock: sumStock, variants: updated });
                                }}
                                className="w-full text-xs font-mono border rounded-xl px-3 py-1.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-right outline-none"
                                required
                              />
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (productForm.variants || []).filter((_, i) => i !== idx);
                                  const sumStock = updated.reduce((sum, item) => sum + item.stock, 0);
                                  setProductForm({ ...productForm, stock: sumStock, variants: updated.length > 0 ? updated : undefined });
                                }}
                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                                title="Supprimer variante"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-xs text-slate-400 border rounded-2xl border-dashed border-slate-200 dark:border-slate-800">
                        Aucune variante configurée. Le produit utilise le prix et le stock globaux.
                      </div>
                    )}
                  </div>
                )}

                {modalTab === 'seo' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Google SERP Live Preview Card */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                        Aperçu Google Search (SERP)
                      </label>
                      <div className={`p-4 rounded-2xl border shadow-xs ${
                        adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
                      }`}>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 truncate">
                          <span className="font-bold text-slate-700 dark:text-slate-300">paraonline.ma</span>
                          <span>›</span>
                          <span>produit</span>
                          <span>›</span>
                          <span className="text-slate-400 font-mono text-[11px]">{productForm.slug || 'url-slug'}</span>
                        </div>
                        <h4 className="text-base text-[#1a0dab] dark:text-sky-400 hover:underline font-semibold truncate">
                          {productForm.metaTitle || productForm.title || 'Titre du Produit'}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1 font-light break-words">
                          {productForm.metaDescription || productForm.description || 'Description optimisée pour les moteurs de recherche.'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Méta-Titre (Balise Title)</label>
                      <input
                        type="text"
                        maxLength={60}
                        value={productForm.metaTitle || ''}
                        onChange={(e) => setProductForm({ ...productForm, metaTitle: e.target.value })}
                        placeholder={productForm.title || "Titre pour Google"}
                        className={`w-full text-xs border rounded-xl px-3.5 py-2.5 transition outline-none ${
                          adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-emerald-500'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Méta-Description</label>
                      <textarea
                        maxLength={160}
                        value={productForm.metaDescription || ''}
                        onChange={(e) => setProductForm({ ...productForm, metaDescription: e.target.value })}
                        placeholder={productForm.description || "Description courte résumant le produit pour les moteurs de recherche."}
                        className={`w-full text-xs border rounded-xl p-3 transition outline-none ${
                          adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-emerald-500'
                        }`}
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar Panel (4 Cols) */}
              <div className="lg:col-span-4 p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/20">
                {/* Status Toggle Card */}
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                    Statut de Publication
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, status: 'live' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer outline-none ${
                        productForm.status === 'live'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800'
                      }`}
                    >
                      <span>🟢 Live (Publié)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, status: 'draft' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer outline-none ${
                        productForm.status === 'draft'
                          ? 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-300'
                          : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800'
                      }`}
                    >
                      <span>🟡 Brouillon</span>
                    </button>
                  </div>
                </div>

                {/* Category & Organization */}
                <div className={`p-4 rounded-2xl border space-y-4 ${
                  adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                    Catégorie & Organisation
                  </label>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Catégories</label>
                    <CategoryMultiSelect
                      categories={Array.from(new Set([
                        productForm.category || 'visage',
                        ...(productForm.categories || []),
                      ]))}
                      options={categoryOptions}
                      onChange={(categories) => setProductForm({
                        ...productForm,
                        category: categories[0] || 'visage',
                        categories,
                      })}
                      adminTheme={adminTheme}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-[11px] font-bold text-slate-400 uppercase">Formule & Ingrédients Actifs</label>
                      <span className="text-[10px] font-medium text-slate-400">Sélection multiple</span>
                    </div>
                    <IngredientMultiSelect
                      value={productForm.ingredients || ''}
                      options={ingredientOptions}
                      onChange={(ingredients) => setProductForm({ ...productForm, ingredients })}
                      adminTheme={adminTheme}
                    />
                    <p className="text-[10px] leading-relaxed text-slate-400">Ajoutez plusieurs ingrédients. Ils alimentent également le filtre Ingrédients de la boutique.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">SKU Référence</label>
                    <input 
                      type="text" 
                      value={productForm.sku || ''} 
                      onChange={(e) => setProductForm({...productForm, sku: e.target.value})} 
                      className={`w-full text-xs font-mono border rounded-xl px-3 py-2 transition outline-none ${
                        adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                      }`} 
                      placeholder="e.g. LRP-EFF-001"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Tags du Produit</label>
                    <input 
                      type="text" 
                      value={Array.isArray(productForm.tags) ? productForm.tags.join(', ') : ''} 
                      onChange={(e) => setProductForm({...productForm, tags: e.target.value.split(',').map(t => t.trim())})} 
                      placeholder="visage, hydratant, solaire" 
                      className={`w-full text-xs border rounded-xl px-3 py-2 transition outline-none ${
                        adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                      }`} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* -------------------- MODAL: CSV / EXCEL WIZARD IMPORTER -------------------- */}
      {isMounted && isImportModalOpen && createPortal(
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[999999] animate-in fade-in duration-200 select-none">
        <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-250 ${
          adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}>
          <div className={`flex justify-between items-center p-5 border-b ${
            adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'
          }`}>
            <h3 className={`text-xs font-black uppercase tracking-wider ${
              adminTheme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
            }`}>
              Importer des Produits depuis un fichier CSV / TXT
            </h3>
            <button
              onClick={() => {
                setIsImportModalOpen(false);
                setImportStep(1);
                setImportFile(null);
                setImportError('');
                setImportMessage('');
                setImportResult(null);
              }}
              className={`transition-colors cursor-pointer ${
                adminTheme === 'light' ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper indicator bar */}
          <div className={`p-4 border-b flex items-center justify-center gap-4 text-[10px] font-extrabold uppercase tracking-wider ${
            adminTheme === 'light' ? 'bg-slate-50/50 border-slate-100' : 'bg-slate-950/20 border-slate-800/80'
          }`}>
            {[
              { step: 1, label: 'Téléverser' },
              { step: 2, label: 'Mappage' },
              { step: 3, label: 'Validation' },
              { step: 4, label: 'Importation' },
              { step: 5, label: 'Terminé !' }
            ].map((s, idx) => (
              <React.Fragment key={s.step}>
                <div className="flex items-center gap-1.5">
                  <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center font-mono text-[9px] border transition ${
                    importStep === s.step
                      ? (adminTheme === 'light' ? 'bg-emerald-50 text-emerald-700 border-emerald-600 font-black' : 'bg-emerald-500/10 text-emerald-400 border-emerald-400 font-black')
                      : importStep > s.step
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-black'
                        : (adminTheme === 'light' ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-slate-950 text-slate-500 border-slate-800')
                  }`}>
                    {importStep > s.step ? '✓' : s.step}
                  </span>
                  <span className={importStep === s.step ? (adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200') : 'text-slate-500'}>
                    {s.label}
                  </span>
                </div>
                {idx < 4 && (
                  <span className={`h-[1px] w-6 transition ${
                    importStep > s.step ? 'bg-emerald-500' : (adminTheme === 'light' ? 'bg-slate-200' : 'bg-slate-800')
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Step 1: Upload */}
            {importStep === 1 && (
              <div className="space-y-5 text-xs">
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-extrabold">Importer des produits à partir d&apos;un fichier CSV</h4>
                  <p className="text-slate-500 font-light leading-relaxed">Cet outil vous permet d&apos;importer ou fusionner les données produit de votre boutique à partir d&apos;un fichier CSV ou TXT.</p>
                </div>

                {importError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>{importError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${
                    importFile
                      ? 'border-emerald-500/50 bg-emerald-500/[0.02]'
                      : (adminTheme === 'light' ? 'border-slate-200 hover:border-slate-300 bg-slate-50/50' : 'border-slate-800 hover:border-slate-700 bg-slate-950/10')
                  }`}>
                    <input
                      type="file"
                      id="csv-file-upload"
                      accept=".csv,.txt"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="csv-file-upload" className="cursor-pointer space-y-3 block">
                      <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                      <div className="space-y-1">
                        <p className="font-bold">{importFile ? importFile.name : 'Choisir un fichier CSV depuis votre ordinateur'}</p>
                        <p className="text-slate-500 font-light text-[10px]">Taille maximale : 2 Go</p>
                      </div>
                      {importFile && (
                        <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold">
                          Fichier chargé
                        </span>
                      )}
                    </label>
                  </div>

                  <div className="flex items-start gap-2.5 p-1">
                    <input
                      type="checkbox"
                      id="import-update-existing"
                      checked={importUpdateExisting}
                      onChange={(e) => setImportUpdateExisting(e.target.checked)}
                      className="mt-1 cursor-pointer w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-800 accent-emerald-500"
                    />
                    <label htmlFor="import-update-existing" className="cursor-pointer font-medium leading-relaxed">
                      Mettre à jour les produits existants
                      <span className="block text-[10px] text-slate-500 font-light mt-0.5">
                        Les produits existants qui correspondent par ID ou SKU seront mis à jour. Les produits qui n&apos;existent pas seront ignorés.
                      </span>
                    </label>
                  </div>

                  <div className="border-t border-slate-800/40 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsAdvancedOptionsOpen(!isAdvancedOptionsOpen)}
                      className="text-[10px] text-emerald-400 font-bold hover:underline cursor-pointer uppercase tracking-wider"
                    >
                      {isAdvancedOptionsOpen ? 'Masquer les options avancées' : 'Afficher les options avancées'}
                    </button>

                    {isAdvancedOptionsOpen && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Séparateur de colonnes</label>
                          <select
                            value={importDelimiter}
                            onChange={(e) => setImportDelimiter(e.target.value)}
                            className={`w-full border rounded-xl px-3 py-2 transition outline-none cursor-pointer ${
                              adminTheme === 'light'
                                ? 'bg-white border-slate-200 text-slate-800'
                                : 'bg-slate-950 border-slate-800 text-slate-200'
                            }`}
                          >
                            <option value="auto">Détection automatique</option>
                            <option value=",">Virgule (,)</option>
                            <option value=";">Point-virgule (;)</option>
                            <option value="&#9;">Tabulation</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`rounded-xl border p-3 ${adminTheme === 'light' ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800 bg-slate-950/30'}`}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Historique des imports</span>
                      <span className="text-[10px] text-slate-400">Audit partagé</span>
                    </div>
                    {importHistory.length === 0 ? (
                      <p className="text-[10px] text-slate-400">Aucun import catalogue enregistré.</p>
                    ) : (
                      <div className="space-y-2">
                        {importHistory.map(item => (
                          <div key={item.id} className="flex items-start justify-between gap-3 text-[10px]">
                            <p className="min-w-0 flex-1 leading-relaxed text-slate-500">{item.details}</p>
                            <time className="shrink-0 font-mono text-slate-400">{new Date(item.date).toLocaleDateString('fr-FR')}</time>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Mapping */}
            {importStep === 2 && (
              <div className="space-y-4 text-xs animate-fade-in">
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-extrabold font-sans">Map CSV fields to products</h4>
                  <p className="text-slate-500 font-light">Select fields from your CSV file to map against products fields, or to ignore during import.</p>
                </div>

                {/* Profiles Bar */}
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  adminTheme === 'light' ? 'bg-slate-50 border-slate-200/80 shadow-sm' : 'bg-slate-950/45 border-slate-800'
                }`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Profils de Mappage :</span>
                    {Object.keys(savedProfiles).length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <select
                          onChange={(e) => handleLoadProfile(e.target.value)}
                          defaultValue=""
                          className={`text-xs border rounded-lg px-2.5 py-1 outline-none cursor-pointer ${
                            adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-700 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          <option value="" disabled>Charger...</option>
                          {Object.keys(savedProfiles).map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const activeOpt = document.querySelector('select')?.value;
                            if (activeOpt) {
                              handleDeleteProfile(activeOpt);
                              showToast("Profil supprimé.", 'success');
                            }
                          }}
                          className={`text-[9px] font-bold uppercase transition hover:text-rose-500 ${
                            adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          Supprimer
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">Aucun profil enregistré</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nom du profil (ex: Shopify)"
                      value={profileNameInput}
                      onChange={e => setProfileNameInput(e.target.value)}
                      className={`text-xs border rounded-lg px-2.5 py-1.5 outline-none w-36 ${
                        adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveProfile(profileNameInput)}
                      className="px-3 py-1.5 bg-emerald-500 text-white font-black text-[9px] uppercase rounded-lg hover:bg-emerald-400 cursor-pointer transition shadow-sm"
                    >
                      Sauver
                    </button>
                  </div>
                </div>

                <div className={`border rounded-2xl overflow-hidden ${
                  adminTheme === 'light' ? 'border-slate-100 bg-white' : 'border-slate-800 bg-slate-950/10'
                }`}>
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className={`text-[9px] uppercase tracking-wider font-extrabold border-b ${
                        adminTheme === 'light' ? 'bg-slate-50 text-slate-600 border-slate-100' : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}>
                        <th className="p-3 w-1/2">Column name</th>
                        <th className="p-3 w-1/2">Map to field</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/10">
                      {csvHeaders.map((header) => {
                        const previewVal = csvPreviewRow[csvHeaders.indexOf(header)] || '';
                        const mappedVal = columnMappings[header] || '';
                        return (
                          <tr key={header} className="hover:bg-slate-800/5 transition">
                            <td className="p-3 space-y-1">
                              <span className="font-bold block">{header}</span>
                              {previewVal && (
                                <span className="text-[10px] text-slate-500 font-mono block">
                                  Sample: {previewVal.length > 50 ? `${previewVal.slice(0, 50)}...` : previewVal}
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <select
                                value={mappedVal || 'ignore'}
                                onChange={(e) => setColumnMappings(prev => ({ ...prev, [header]: e.target.value }))}
                                className={`w-full border rounded-xl px-3 py-1.5 transition outline-none cursor-pointer font-sans ${
                                  adminTheme === 'light'
                                    ? 'bg-white border-slate-200 text-slate-800'
                                    : 'bg-slate-950 border-slate-800 text-slate-200'
                                }`}
                              >
                                <option value="ignore">Ignore</option>
                                <option value="id">ID</option>
                                <option value="title">Titre Français</option>
                                <option value="vendor">Marque / Fournisseur</option>
                                <option value="price">Prix (DH)</option>
                                <option value="comparePrice">Prix Comp. (DH)</option>
                                <option value="stock">Stock</option>
                                <option value="sku">SKU</option>
                                <option value="buyingCost">Coût d&apos;achat (DH)</option>
                                <option value="category">Catégorie</option>
                                <option value="categories">Catégories</option>
                                <option value="description">Description</option>
                                <option value="ingredients">Ingrédients</option>
                                <option value="usage">Conseils d&apos;utilisation</option>
                                <option value="image">Image URL</option>
                                <option value="tags">Tags</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Step 3: Validation & Preview */}
            {importStep === 3 && (() => {
              const filteredRows = rowValidations.filter(val => {
                if (validationFilter === 'errors') return Object.keys(val.errors).length > 0;
                if (validationFilter === 'warnings') return Object.keys(val.warnings).length > 0;
                return true;
              });
              
              const totalErrors = rowValidations.filter(v => Object.keys(v.errors).length > 0).length;
              const totalWarnings = rowValidations.filter(v => Object.keys(v.warnings).length > 0).length;
              const totalValids = rowValidations.length - totalErrors;
              
              return (
                <div className="space-y-4 text-xs animate-fade-in">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-extrabold font-sans">Validation & Aperçu des Produits</h4>
                    <p className="text-slate-500 font-light">Veuillez vérifier les anomalies avant d&apos;importer.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className={`p-3 rounded-2xl border text-center ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200/80 shadow-sm' : 'bg-slate-950 border-slate-800'
                    }`}>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Valides / Total</span>
                      <strong className="text-sm font-mono text-emerald-500 font-black">{totalValids} / {rowValidations.length}</strong>
                    </div>
                    <div className={`p-3 rounded-2xl border text-center ${
                      totalErrors > 0 
                        ? (adminTheme === 'light' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-950/20 border-rose-900/40 text-rose-400 font-black')
                        : (adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800')
                    }`}>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Erreurs</span>
                      <strong className="text-sm font-mono font-black">{totalErrors}</strong>
                    </div>
                    <div className={`p-3 rounded-2xl border text-center ${
                      totalWarnings > 0
                        ? (adminTheme === 'light' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-950/20 border-amber-900/40 text-amber-400')
                        : (adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800')
                    }`}>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Avertissements</span>
                      <strong className="text-sm font-mono font-black">{totalWarnings}</strong>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[9px] uppercase text-slate-400 tracking-wider">Filtrer l&apos;aperçu :</span>
                      <select
                        value={validationFilter}
                        onChange={(e) => setValidationFilter(e.target.value as any)}
                        className={`text-xs border rounded-lg px-2.5 py-1.5 outline-none cursor-pointer ${
                          adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-700 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <option value="all">Toutes les lignes ({rowValidations.length})</option>
                        <option value="errors">Uniquement avec erreurs ({totalErrors})</option>
                        <option value="warnings">Uniquement avec avertissements ({totalWarnings})</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="ignore-errors-check"
                        checked={ignoreRowsWithErrors}
                        onChange={(e) => setIgnoreRowsWithErrors(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-800 accent-emerald-500 cursor-pointer"
                      />
                      <label htmlFor="ignore-errors-check" className="cursor-pointer font-extrabold text-[11px]">
                        Ignorer les lignes erronées à l&apos;importation
                      </label>
                      {(totalErrors > 0 || totalWarnings > 0) && (
                        <button
                          type="button"
                          onClick={downloadImportErrors}
                          className="ml-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wide text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Fichier d&apos;erreurs
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={`border rounded-2xl overflow-hidden max-h-[320px] overflow-y-auto ${
                    adminTheme === 'light' ? 'border-slate-100 bg-white' : 'border-slate-800 bg-slate-950/10'
                  }`}>
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className={`text-[9px] uppercase tracking-wider font-extrabold border-b ${
                          adminTheme === 'light' ? 'bg-slate-50 text-slate-500 border-slate-100' : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}>
                          <th className="p-2.5 w-12 text-center">Ligne</th>
                          <th className="p-2.5 w-12 text-center">Statut</th>
                          <th className="p-2.5">Titre</th>
                          <th className="p-2.5">SKU</th>
                          <th className="p-2.5">Prix</th>
                          <th className="p-2.5">Stock</th>
                          <th className="p-2.5">Catégorie</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/10 font-sans">
                        {filteredRows.slice(0, 100).map((val) => {
                          const hasErrors = Object.keys(val.errors).length > 0;
                          const hasWarnings = Object.keys(val.warnings).length > 0;
                          const rowNum = val.rowIdx + 2;
                          
                          return (
                            <tr key={val.rowIdx} className={`hover:bg-slate-800/5 transition ${hasErrors && !ignoreRowsWithErrors ? 'bg-rose-500/[0.02]' : ''}`}>
                              <td className="p-2.5 font-mono text-center text-slate-400">{rowNum}</td>
                              <td className="p-2.5 text-center">
                                {hasErrors ? (
                                  <span className="text-rose-500 font-extrabold block text-center">X</span>
                                ) : hasWarnings ? (
                                  <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto" />
                                ) : (
                                  <span className="text-emerald-500 font-extrabold text-center block">✓</span>
                                )}
                              </td>
                              
                              <td className={`p-2.5 ${val.errors.title ? 'bg-rose-500/10 text-rose-600 font-bold border border-rose-500/20 rounded-lg' : ''}`}>
                                <span className="font-semibold block truncate max-w-[150px]" title={val.mappedProduct.title}>{val.mappedProduct.title || '—'}</span>
                                {val.errors.title && <span className="text-[8.5px] block font-light leading-none mt-0.5">{val.errors.title}</span>}
                              </td>
                              
                              <td className={`p-2.5 font-mono ${val.errors.sku ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-lg' : val.warnings.sku ? 'bg-amber-500/5 text-amber-600 border border-amber-500/15 rounded-lg' : ''}`}>
                                <span>{val.mappedProduct.sku || '—'}</span>
                                {val.errors.sku && <span className="text-[8.5px] block font-light leading-none mt-0.5">{val.errors.sku}</span>}
                                {val.warnings.sku && <span className="text-[8.5px] block font-light leading-none mt-0.5">{val.warnings.sku}</span>}
                              </td>

                              <td className={`p-2.5 font-mono ${val.errors.price ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-lg' : ''}`}>
                                <span>{val.mappedProduct.price !== undefined ? `${val.mappedProduct.price} DH` : '—'}</span>
                                {val.errors.price && <span className="text-[8.5px] block font-light leading-none mt-0.5">{val.errors.price}</span>}
                              </td>

                              <td className={`p-2.5 font-mono ${val.errors.stock ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-lg' : ''}`}>
                                <span>{val.mappedProduct.stock !== undefined ? val.mappedProduct.stock : '—'}</span>
                                {val.errors.stock && <span className="text-[8.5px] block font-light leading-none mt-0.5">{val.errors.stock}</span>}
                              </td>

                              <td className={`p-2.5 uppercase font-mono ${val.warnings.category ? 'bg-amber-500/5 text-amber-600 border border-amber-500/15 rounded-lg' : ''}`}>
                                <span>{val.mappedProduct.category || '—'}</span>
                                {val.warnings.category && <span className="text-[8.5px] block font-light leading-none mt-0.5">{val.warnings.category}</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filteredRows.length > 100 && (
                      <div className={`p-3 text-center border-t font-bold text-[10px] text-slate-500 ${
                        adminTheme === 'light' ? 'bg-slate-50' : 'bg-slate-900/55'
                      }`}>
                        Affichage des 100 premières lignes sur un total de {filteredRows.length} lignes.
                      </div>
                    )}
                    {filteredRows.length === 0 && (
                      <div className="p-8 text-center text-slate-500 italic">Aucune ligne ne correspond au filtre actif.</div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Step 4: Loading Progress */}
            {importStep === 4 && (
              <div className="space-y-6 py-8 text-center text-xs">
                <div className="space-y-2">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                  <h4 className="text-sm font-extrabold">Importation des produits en cours...</h4>
                  <p className="text-slate-500 font-light">Veuillez patienter pendant que les produits sont importés.</p>
                </div>
                
                <div className="max-w-md mx-auto space-y-1.5">
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                    adminTheme === 'light' ? 'bg-slate-100' : 'bg-slate-950'
                  }`}>
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                  <span className="font-mono text-[9px] text-slate-500">{importProgress}% complété</span>
                </div>
              </div>
            )}

            {/* Step 5: Done */}
            {importStep === 5 && (
              <div className="space-y-5 py-6 text-center text-xs animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <span className="text-lg">✓</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold">Importation terminée !</h4>
                  <p className="text-slate-400 font-light font-sans">Votre catalogue produits a été mis à jour avec succès.</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className={`inline-block px-5 py-2.5 rounded-2xl border font-mono font-bold ${
                    adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/30 border-slate-800'
                  }`}>
                    {importedCount} produit(s) importé(s) / mis à jour.
                  </div>
                  {importMessage && (
                    <p className="text-amber-500 font-bold text-[11px] mt-1 max-w-md mx-auto leading-relaxed">
                      ⚠️ {importMessage}
                    </p>
                  )}
                  {importResult && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-xl text-left">
                      {[
                        ['Nouveaux', importResult.created, 'text-emerald-600'],
                        ['Mis à jour', importResult.updated, 'text-sky-600'],
                        ['Ignorés', importResult.skipped, 'text-slate-500'],
                        ['Erreurs', importResult.validationErrors, importResult.validationErrors > 0 ? 'text-rose-600' : 'text-slate-500'],
                      ].map(([label, value, color]) => (
                        <div key={String(label)} className={`rounded-xl border px-3 py-2 bg-white/70 dark:bg-slate-950/30 ${adminTheme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
                          <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">{label}</p>
                          <p className={`text-base font-black font-mono ${color}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer buttons */}
          <div className={`p-4 border-t flex justify-end gap-2 text-xs ${
            adminTheme === 'light' ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800 bg-slate-950/10'
          }`}>
            {importStep === 1 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportFile(null);
                    setImportError('');
                    setImportResult(null);
                  }}
                  className={`px-4 py-2 border font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    adminTheme === 'light'
                      ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleContinueToMapping}
                  disabled={!importFile}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black uppercase rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuer
                </button>
              </>
            )}
            {importStep === 2 && (
              <>
                <button
                  type="button"
                  onClick={() => setImportStep(1)}
                  className={`px-4 py-2 border font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    adminTheme === 'light'
                      ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleValidateAndPreview}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black uppercase rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer animate-none"
                >
                  Continuer
                </button>
              </>
            )}
            {importStep === 3 && (() => {
              const totalErrors = rowValidations.filter(v => Object.keys(v.errors).length > 0).length;
              const isDisableImport = totalErrors > 0 && !ignoreRowsWithErrors;
              return (
                <>
                  <button
                    type="button"
                    onClick={() => setImportStep(2)}
                    className={`px-4 py-2 border font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      adminTheme === 'light'
                        ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={handleRunImporter}
                    disabled={isDisableImport}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black uppercase rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Lancer l&apos;importation
                  </button>
                </>
              );
            })()}
            {importStep === 5 && (
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportStep(1);
                  setImportFile(null);
                  setImportedCount(0);
                  setImportError('');
                  setImportMessage('');
                  setImportResult(null);
                }}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black uppercase rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer"
              >
                Fermer
              </button>
            )}
          </div>
        </div>
      </div>,
        document.body
      )}

      {/* Unified Custom Confirmation Modal (PORTAL TO DOCUMENT.BODY FOR VIEWPORT CENTERING) */}
      {isMounted && confirmDialog && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
            onClick={() => {
              if (confirmDialog.openedAt && Date.now() - confirmDialog.openedAt < 100) return;
              setConfirmDialog(null);
            }}
          />
          <div className={`relative z-10 w-full max-w-sm rounded-2xl border p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 ${
            adminTheme === 'light' 
              ? 'bg-white border-slate-200 text-slate-800' 
              : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 mt-0.5 ${
                confirmDialog.confirmStyle === 'danger'
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  : confirmDialog.confirmStyle === 'warning'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              }`}>
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-sm truncate">{confirmDialog.title}</h4>
                <p className="text-[11px] text-slate-500 font-light mt-1 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 text-[11px] font-bold uppercase tracking-wider pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className={`px-4 py-2 border rounded-xl cursor-pointer transition ${
                  adminTheme === 'light'
                    ? 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className={`px-4 py-2 text-white font-black rounded-xl shadow-md cursor-pointer transition-all duration-200 ${
                  confirmDialog.confirmStyle === 'danger'
                    ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 shadow-rose-500/10'
                    : confirmDialog.confirmStyle === 'warning'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-500/10'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/10'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* FLOATING GLASSMORPHIC BULK ACTIONS DOCK (PORTAL TO DOCUMENT.BODY) */}
      {isMounted && selectedProductIds.size > 0 && !isCatalogBulkMode && createPortal(
        <div className={`floating-bulk-bar active ${
          adminTheme === 'light' ? 'floating-bulk-bar-light' : 'floating-bulk-bar-dark'
        }`}>
          <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-300/80 dark:border-emerald-700/80 shadow-2xs">
            <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{selectedProductIds.size} {selectedProductIds.size > 1 ? 'sélectionnés' : 'sélectionné'}</span>
          </span>
          
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800" />
          
          {/* Direct Button 1: Supprimer */}
          <button
            type="button"
            onClick={() => handleApplyBulkAction('delete')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 border-0 outline-none"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
            <span>Supprimer</span>
          </button>

          {/* Direct Button 2: Publier */}
          <button
            type="button"
            onClick={() => handleApplyBulkAction('publish')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 border-0 outline-none"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span>Publier</span>
          </button>

          {/* Direct Button 3: Brouillon */}
          <button
            type="button"
            onClick={() => handleApplyBulkAction('draft')}
            className={`px-3.5 py-1.5 border font-bold text-xs rounded-xl active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 outline-none ${
              adminTheme === 'light'
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>Brouillon</span>
          </button>

          {/* Custom Popover: Catégorie */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFloatingCatPopoverOpen(prev => !prev)}
              className={`px-3.5 py-1.5 border font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 outline-none ${
                adminTheme === 'light'
                  ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <FolderPlus className="w-3.5 h-3.5 text-emerald-500" />
              <span>Catégorie</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isFloatingCatPopoverOpen ? 'rotate-180 text-emerald-500' : 'text-slate-400'}`} />
            </button>

            {isFloatingCatPopoverOpen && (
              <div className={`absolute bottom-full mb-3 right-0 w-52 rounded-2xl border p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
                adminTheme === 'light'
                  ? 'bg-white/95 border-slate-200/90 text-slate-800 backdrop-blur-xl'
                  : 'bg-slate-900/95 border-slate-800 text-slate-200 backdrop-blur-xl'
              }`}>
                <div className="px-2 py-1 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                  Assigner Catégorie
                </div>
                <div className="space-y-1">
                  {categoryOptions.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setIsFloatingCatPopoverOpen(false);
                        handleApplyBulkAction('categorize', cat);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-xl flex items-center justify-between transition cursor-pointer border-0 outline-none ${
                        adminTheme === 'light'
                          ? 'hover:bg-emerald-50 hover:text-emerald-700 text-slate-700'
                          : 'hover:bg-emerald-950/50 hover:text-emerald-400 text-slate-300'
                      }`}
                    >
                      <span>{cat.toUpperCase()}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800" />

          <button
            type="button"
            onClick={() => setIsCatalogBulkMode(true)}
            className="px-3.5 py-1.5 border font-bold text-xs rounded-xl active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 outline-none bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Table className="w-3.5 h-3.5 text-amber-500" />
            <span>Éditer</span>
          </button>

          {/* Dismiss */}
          <button
            type="button"
            onClick={() => {
              setSelectedProductIds(new Set());
              setBulkAction('');
            }}
            className="text-slate-400 hover:text-rose-500 transition p-1.5 cursor-pointer border-0 bg-transparent outline-none rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Désélectionner tout"
          >
            <X className="w-4 h-4" />
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
