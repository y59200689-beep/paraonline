'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Product } from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';
import { ShopShell } from '@/components/ShopShell';
import { Search, SlidersHorizontal, Check, ArrowUpDown, X, AlertTriangle, Sparkles, Loader2, ChevronLeft, ChevronRight, RotateCcw, Tags, HeartPulse, CircleDollarSign, FlaskConical } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useUi } from '@/context/UiContext';

const CONCERNS = [
  { id: 'acne', labelFR: 'Acné & Imperfections', labelAR: 'حب الشباب والشوائب' },
  { id: 'spots', labelFR: 'Taches Brunes & Éclat', labelAR: 'البقع الداكنة والنضارة' },
  { id: 'dryness', labelFR: 'Sécheresse & Hydratation', labelAR: 'الجفاف والترطيب' },
  { id: 'wrinkles', labelFR: 'Rides & Anti-Âge', labelAR: 'التجاعيد ومكافحة الشيخوخة' },
  { id: 'redness', labelFR: 'Rougeurs & Peau Sensible', labelAR: 'الاحمرار والبشرة الحساسة' }
];

const CATEGORIES = [
  { id: 'all', labelFR: 'Toutes catégories', labelAR: 'جميع الفئات' },
  { id: 'visage', labelFR: 'Visage & Peau', labelAR: 'الوجه والبشرة' },
  { id: 'solaire', labelFR: 'Protection Solaire', labelAR: 'واquiات الشمس' },
  { id: 'cheveux', labelFR: 'Soin Capillaire', labelAR: 'العناية بالشعر' },
  { id: 'kbeauty', labelFR: 'K-Beauty Coréenne', labelAR: 'الجمال الكوري' },
  { id: 'offers', labelFR: 'Offres & Coffrets', labelAR: 'العروض والمجموعات' }
];

const INGREDIENTS = [
  { label: 'Niacinamide', query: 'niacinamide' },
  { label: 'Acide hyaluronique', query: 'acide hyaluronique' },
  { label: 'Rétinol', query: 'retinol' },
  { label: 'Vitamine C', query: 'vitamine c' },
  { label: 'Acide salicylique', query: 'acide salicylique' },
  { label: 'Centella asiatica', query: 'centella asiatica' },
  { label: 'Acide tranexamique', query: 'acide tranexamique' },
  { label: 'Squalane', query: 'squalane' },
];

type CatalogPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type CatalogFacets = {
  total: number;
  categories: Array<{ id: string; count: number }>;
  brands: Array<{ name: string; count: number }>;
  concerns?: Record<string, number>;
};

const categoryLabelFromId = (id: string) => id
  .split(/[-_\s]+/)
  .filter(Boolean)
  .map(part => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

const productCategoryIds = (product: Product) => {
  const categories = Array.isArray(product.categories) && product.categories.length > 0
    ? product.categories
    : [product.category];

  return Array.from(new Set(
    categories
      .map(category => String(category || '').trim().toLowerCase())
      .filter(Boolean)
  ));
};

const getProductMatchScore = (product: Product, diagnostic: any) => {
  if (!diagnostic) return null;
  const { skinType, concern } = diagnostic;
  let score = 76; // Premium base compatibility

  const searchField = `${product.title} ${product.description} ${product.ingredients} ${product.tags.join(' ')}`.toLowerCase();

  // 1. Target skin concerns matching
  if (concern === 'acne') {
    if (searchField.includes('acné') || searchField.includes('imperfection') || searchField.includes('salicylique') || searchField.includes('mousse') || searchField.includes('purifi') || searchField.includes('nettoy')) {
      score += 16;
    }
  } else if (concern === 'spots') {
    if (searchField.includes('tache') || searchField.includes('bright') || searchField.includes('éclat') || searchField.includes('vitamine c') || searchField.includes('tranexamique') || searchField.includes('niacinamide')) {
      score += 18;
    }
  } else if (concern === 'wrinkles') {
    if (searchField.includes('age') || searchField.includes('ridule') || searchField.includes('anti-age') || searchField.includes('retinol') || searchField.includes('collagene') || searchField.includes('fermeté')) {
      score += 15;
    }
  } else if (concern === 'dryness') {
    if (searchField.includes('hydrat') || searchField.includes('hyaluronique') || searchField.includes('sec') || searchField.includes('sèche') || searchField.includes('squalane')) {
      score += 17;
    }
  }

  // 2. Target skin type compatibility
  if (skinType === 'oily') {
    if (searchField.includes('gel') || searchField.includes('fluide') || searchField.includes('léger') || searchField.includes('sans gras') || searchField.includes('matifi')) {
      score += 5;
    } else if (searchField.includes('riche') || searchField.includes('huile de soin') || searchField.includes('crème onctueuse')) {
      score -= 8;
    }
  } else if (skinType === 'dry') {
    if (searchField.includes('crème') || searchField.includes('nourris') || searchField.includes('intense') || searchField.includes('hyaluronique') || searchField.includes('lotion hydratante')) {
      score += 5;
    } else if (searchField.includes('asséchant') || searchField.includes('purifiant fort')) {
      score -= 6;
    }
  } else if (skinType === 'sensitive') {
    if (searchField.includes('centella') || searchField.includes('probiotic') || searchField.includes('apais') || searchField.includes('sensible') || searchField.includes('douceur')) {
      score += 5;
    } else if (searchField.includes('acide fort') || searchField.includes('peeling')) {
      score -= 8;
    }
  }

  return Math.max(68, Math.min(99, score));
};

export default function ProductsClient({
  initialProducts,
  initialPagination,
  catalogFacets,
  initialCategory,
  initialBrands = [],
}: {
  initialProducts: Product[];
  initialPagination: CatalogPagination;
  catalogFacets: CatalogFacets;
  initialCategory: string;
  initialBrands?: string[];
}) {
  const { language } = useTranslation();
  const { diagnostic } = useUi();
  const { settings } = useSettings();

  const customCategories = settings.customCategories || [];
  const customConcerns = settings.customConcerns || [];

  const CATEGORIES_LIST = useMemo(() => {
    const categoryCountsById = new Map(
      catalogFacets.categories.map(category => [category.id, category.count])
    );
    const byId = new Map<string, { id: string; labelFR: string; labelAR: string }>();
    CATEGORIES.forEach(category => {
      if (category.id === 'all' || (categoryCountsById.get(category.id) || 0) > 0) {
        byId.set(category.id, category);
      }
    });

    customCategories.forEach((category: any) => {
      if (!category?.id) return;
      const id = String(category.id).trim().toLowerCase();
      if ((categoryCountsById.get(id) || 0) === 0) return;
      byId.set(id, {
        id,
        labelFR: category.labelFr || categoryLabelFromId(id),
        labelAR: category.labelAr || category.labelFr || categoryLabelFromId(id),
      });
    });

    catalogFacets.categories.forEach(category => {
      const id = category.id;
        if (byId.has(id)) return;
        byId.set(id, {
          id,
          labelFR: categoryLabelFromId(id),
          labelAR: categoryLabelFromId(id),
        });
    });

    const allCategory = byId.get('all') || { id: 'all', labelFR: 'Toutes catégories', labelAR: 'جميع الفئات' };
    const rest = Array.from(byId.values())
      .filter(category => category.id !== 'all')
      .sort((a, b) => a.labelFR.localeCompare(b.labelFR));

    return [allCategory, ...rest];
  }, [customCategories, catalogFacets.categories]);

  const CONCERNS_LIST = useMemo(() => {
    if (customConcerns.length > 0) {
      return customConcerns.map((c: any) => ({ id: c.id, labelFR: c.labelFr, labelAR: c.labelAr }));
    }
    return CONCERNS;
  }, [customConcerns]);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrands);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [ingredientQuery, setIngredientQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(1500);
  const [sortOption, setSortOption] = useState('alphabetical'); // alphabetical, price-asc, price-desc, rating
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showOnlyMatches, setShowOnlyMatches] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [pagination, setPagination] = useState<CatalogPagination>(initialPagination);
  const [currentPage, setCurrentPage] = useState(initialPagination.page || 1);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const didHydrate = useRef(false);

  const pageSize = initialPagination.limit || 50;
  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    selectedBrands.length +
    selectedConcerns.length +
    (ingredientQuery.trim() ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0) +
    (maxPrice < 1500 ? 1 : 0) +
    (showOnlyMatches ? 1 : 0);

  const displayedCategories = useMemo(() => {
    if (selectedCategory === 'all') return CATEGORIES_LIST;

    const selected = CATEGORIES_LIST.find(category => category.id === selectedCategory);
    if (!selected) return CATEGORIES_LIST;

    return [selected, ...CATEGORIES_LIST.filter(category => category.id !== selectedCategory)];
  }, [CATEGORIES_LIST, selectedCategory]);

  const brandsList = useMemo(() => {
    return catalogFacets.brands.map(brand => brand.name);
  }, [catalogFacets.brands]);

  // Dynamic counts for filters
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES_LIST.forEach(cat => {
      if (cat.id === 'all') {
        counts[cat.id] = catalogFacets.total || pagination.total;
      } else {
        counts[cat.id] = catalogFacets.categories.find(category => category.id === cat.id)?.count || 0;
      }
    });
    return counts;
  }, [catalogFacets, CATEGORIES_LIST, pagination.total]);

  const concernCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CONCERNS_LIST.forEach((c: any) => {
      counts[c.id] = catalogFacets.concerns?.[c.id] || 0;
    });
    return counts;
  }, [CONCERNS_LIST, catalogFacets.concerns]);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    catalogFacets.brands.forEach(brand => {
      counts[brand.name] = brand.count;
    });
    return counts;
  }, [catalogFacets.brands]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedBrands, selectedConcerns, ingredientQuery, maxPrice, sortOption, showOnlyMatches]);

  useEffect(() => {
    const controller = new AbortController();

    const loadPage = async () => {
      if (!didHydrate.current) {
        didHydrate.current = true;
        if (
          currentPage === initialPagination.page &&
          searchQuery.trim() === '' &&
          selectedCategory === initialCategory &&
          selectedBrands.join(',') === initialBrands.join(',') &&
          selectedConcerns.length === 0 &&
          ingredientQuery.trim() === '' &&
          maxPrice === 1500 &&
          sortOption === 'alphabetical'
        ) {
          return;
        }
      }

      setIsPageLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(currentPage));
        params.set('limit', String(pageSize));
        params.set('sort', sortOption);
        params.set('maxPrice', String(maxPrice));
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        if (selectedBrands.length > 0) params.set('vendors', selectedBrands.join(','));
        if (selectedConcerns.length === 1) params.set('concern', selectedConcerns[0]);
        if (ingredientQuery.trim()) params.set('ingredient', ingredientQuery.trim());

        const response = await fetch(`/api/products?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const data = await response.json();

        if (!data.success) throw new Error(data.error || 'Failed to load products');

        setProducts(data.products || []);
        setPagination(data.pagination || { total: 0, page: currentPage, limit: pageSize, totalPages: 1 });
      } catch (error: any) {
        if (error?.name !== 'AbortError') {
          console.error('Failed to load product page:', error);
          setProducts([]);
          setPagination(prev => ({ ...prev, total: 0, totalPages: 1 }));
        }
      } finally {
        if (!controller.signal.aborted) setIsPageLoading(false);
      }
    };

    loadPage();
    return () => controller.abort();
  }, [currentPage, pageSize, searchQuery, selectedCategory, selectedBrands, selectedConcerns, ingredientQuery, maxPrice, sortOption]);

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleConcernToggle = (concernId: string) => {
    setSelectedConcerns([concernId]);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrands([]);
    setSelectedConcerns([]);
    setIngredientQuery('');
    setMaxPrice(1500);
    setShowOnlyMatches(false);
    setCurrentPage(1);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Diagnostic compatibility filter
    if (showOnlyMatches && diagnostic) {
      result = result.filter(p => {
        const score = getProductMatchScore(p, diagnostic);
        return score !== null && score >= 80;
      });
    }

    return result;
  }, [products, showOnlyMatches, diagnostic]);

  const recommendations = useMemo(() => {
    return [...products]
      .filter(p => p.rating >= 4.7)
      .slice(0, 4);
  }, [products]);

  const totalResults = showOnlyMatches ? filteredProducts.length : pagination.total;
  const pageStart = pagination.total > 0 ? ((pagination.page - 1) * pagination.limit) + 1 : 0;
  const pageEnd = Math.min(pagination.page * pagination.limit, pagination.total);
  const visiblePages = useMemo(() => {
    const totalPages = Math.max(1, pagination.totalPages || 1);
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    return Array.from({ length: Math.min(5, totalPages) }, (_, index) => start + index)
      .filter(page => page >= 1 && page <= totalPages);
  }, [currentPage, pagination.totalPages]);

  const goToPage = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, pagination.totalPages || 1));
    setCurrentPage(nextPage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <ShopShell>
      <main className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 pt-20 pb-12 lg:py-12 select-none">
        
        {/* Editorial Double-Bezel Header Card */}
        <div className="rounded-[2rem] p-1.5 bg-slate-900/5 dark:bg-white/5 border border-slate-200/40 dark:border-slate-800/40 mb-12">
          <div className="rounded-[calc(2rem-0.375rem)] bg-slate-950 text-white min-h-[200px] relative overflow-hidden flex flex-col justify-center px-8 sm:px-12 py-10">
            {/* Ambient gradients */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 left-10 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] font-sans">
                {language === 'FR' ? 'Boutique Officielle' : 'المتجر الرسمي'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight text-white leading-none">
                {language === 'FR' ? "L'Herboristerie Clinique" : 'الصيدلية السريرية'}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm font-light leading-relaxed">
                {language === 'FR' 
                  ? 'Découvrez notre collection de soins dermatologiques et coréens formulés pour restaurer la vitalité naturelle de votre barrière cutanée.'
                  : 'اكتشفي مجموعتنا من مستحضرات العناية الكورية والطبية المصممة لترميم وتغذية الحاجز الطبيعي لبشرتكِ.'}
              </p>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar Filters & Grid */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-[300px] shrink-0 sticky top-24 max-h-[calc(100vh-116px)] overflow-y-auto custom-sidebar-scroll">
            <style dangerouslySetInnerHTML={{__html: `
              .custom-sidebar-scroll::-webkit-scrollbar {
                width: 6px;
              }
              .custom-sidebar-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-sidebar-scroll::-webkit-scrollbar-thumb {
                background: #e2e8f0;
                border-radius: 9999px;
              }
              .dark .custom-sidebar-scroll::-webkit-scrollbar-thumb {
                background: #334155;
                border-radius: 9999px;
              }
              .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
                background: #cbd5e1;
              }
              .dark .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
                background: #475569;
              }
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(16px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .animate-fade-in-up-stagger {
                opacity: 0;
                animation: fadeInUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
            `}} />

            <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.07)] dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white shadow-sm shadow-primary/20">
                    <SlidersHorizontal className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {language === 'FR' ? 'Filtres' : 'التصفية'}
                    </h2>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {activeFilterCount > 0
                        ? `${activeFilterCount} ${language === 'FR' ? 'actif' : 'نشط'}${activeFilterCount > 1 && language === 'FR' ? 's' : ''}`
                        : language === 'FR' ? 'Affinez le catalogue' : 'خصصي الكتالوج'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={activeFilterCount === 0}
                  aria-label={language === 'FR' ? 'Réinitialiser les filtres' : 'إعادة تعيين التصفية'}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-primary disabled:cursor-not-allowed disabled:opacity-35 dark:text-slate-400 dark:hover:bg-slate-900"
                  title={language === 'FR' ? 'Réinitialiser les filtres' : 'إعادة تعيين'}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5 p-5">
                <div className="space-y-2">
                  <label htmlFor="catalog-filter-search" className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    {language === 'FR' ? 'Rechercher' : 'بحث'}
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="catalog-filter-search"
                      type="search"
                      placeholder={language === 'FR' ? 'Nom, marque, référence' : 'اسم، علامة، مرجع'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 w-full rounded-md border border-slate-200 bg-slate-50/70 pl-9 pr-9 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-950"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label={language === 'FR' ? 'Effacer la recherche' : 'مسح البحث'}
                        className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <section className="border-t border-slate-100 pt-5 dark:border-slate-800">
                  <div className="mb-2.5 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    <Tags className="h-3.5 w-3.5 text-primary" />
                    {language === 'FR' ? 'Catégories' : 'الفئات'}
                  </div>
                  <div className="max-h-64 space-y-1 overflow-y-auto pr-1 custom-sidebar-scroll">
                    {displayedCategories.map(cat => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`group flex min-h-9 w-full items-center justify-between rounded-md px-2.5 text-left text-xs font-semibold transition ${
                            isSelected
                              ? 'bg-primary text-white shadow-sm shadow-primary/20'
                              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                          }`}
                        >
                          <span className="min-w-0 truncate">{language === 'FR' ? cat.labelFR : cat.labelAR}</span>
                          <span className={`ml-3 flex shrink-0 items-center gap-1.5 text-[10px] font-bold tabular-nums ${isSelected ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
                            {categoryCounts[cat.id] || 0}
                            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="border-t border-slate-100 pt-5 dark:border-slate-800">
                  <div className="mb-2.5 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    <HeartPulse className="h-3.5 w-3.5 text-primary" />
                    {language === 'FR' ? 'Préoccupations' : 'مشاكل البشرة'}
                  </div>
                  <div className="space-y-1">
                    {CONCERNS_LIST.map((c: any) => {
                      const isChecked = selectedConcerns.includes(c.id);
                      return (
                        <label key={c.id} className="group flex min-h-9 cursor-pointer items-center justify-between rounded-md px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">
                          <span className="flex min-w-0 items-center gap-2.5">
                            <input
                              type="radio"
                              name="catalog-concern"
                              checked={isChecked}
                              onChange={() => handleConcernToggle(c.id)}
                              className="h-4 w-4 shrink-0 border-slate-300 text-primary focus:ring-primary/25 dark:border-slate-700"
                            />
                            <span className="truncate">{language === 'FR' ? c.labelFR : c.labelAR}</span>
                          </span>
                          <span className="ml-3 shrink-0 text-[10px] font-bold tabular-nums text-slate-400 dark:text-slate-500">{concernCounts[c.id] || 0}</span>
                        </label>
                      );
                    })}
                  </div>
                </section>

                <section className="border-t border-slate-100 pt-5 dark:border-slate-800">
                  <div className="mb-2.5 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    <FlaskConical className="h-3.5 w-3.5 text-primary" />
                    {language === 'FR' ? 'Ingrédients' : 'المكونات'}
                  </div>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={ingredientQuery}
                      onChange={(event) => setIngredientQuery(event.target.value)}
                      placeholder={language === 'FR' ? 'Rechercher un ingrédient' : 'ابحث عن مكوّن'}
                      className="h-10 w-full rounded-md border border-slate-200 bg-slate-50/70 pl-8 pr-8 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-950"
                    />
                    {ingredientQuery && (
                      <button
                        type="button"
                        onClick={() => setIngredientQuery('')}
                        aria-label={language === 'FR' ? 'Effacer l’ingrédient' : 'مسح المكوّن'}
                        className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {INGREDIENTS.map(ingredient => (
                      <button
                        key={ingredient.query}
                        type="button"
                        onClick={() => setIngredientQuery(current => current.toLocaleLowerCase() === ingredient.query ? '' : ingredient.query)}
                        className={`rounded-md border px-2 py-1 text-[10px] font-semibold transition ${
                          ingredientQuery.toLocaleLowerCase() === ingredient.query
                            ? 'border-primary bg-primary text-white shadow-sm shadow-primary/20'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-primary/35 hover:text-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
                        }`}
                      >
                        {ingredient.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] leading-relaxed text-slate-400 dark:text-slate-500">
                    {language === 'FR' ? 'Recherche dans les ingrédients importés des fiches produits.' : 'البحث داخل مكوّنات المنتجات المستوردة.'}
                  </p>
                </section>

                <section className="border-t border-slate-100 pt-5 dark:border-slate-800">
                  <div className="mb-2.5 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    <span>{language === 'FR' ? 'Marques' : 'العلامات التجارية'}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] tabular-nums text-slate-500 dark:bg-slate-900 dark:text-slate-400">{brandsList.length}</span>
                  </div>
                  <div className="max-h-44 space-y-1 overflow-y-auto pr-1 custom-sidebar-scroll">
                    {brandsList.map(brand => {
                      const isChecked = selectedBrands.includes(brand);
                      return (
                        <label key={brand} className="group flex min-h-9 cursor-pointer items-center justify-between rounded-md px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">
                          <span className="flex min-w-0 items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleBrandToggle(brand)}
                              className="h-4 w-4 shrink-0 rounded border-slate-300 text-primary focus:ring-primary/25 dark:border-slate-700"
                            />
                            <span className="truncate">{brand}</span>
                          </span>
                          <span className="ml-3 shrink-0 text-[10px] font-bold tabular-nums text-slate-400 dark:text-slate-500">{brandCounts[brand] || 0}</span>
                        </label>
                      );
                    })}
                  </div>
                </section>

                <section className="border-t border-slate-100 pt-5 dark:border-slate-800">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      <CircleDollarSign className="h-3.5 w-3.5 text-primary" />
                      {language === 'FR' ? 'Budget maximum' : 'الحد الأقصى للسعر'}
                    </div>
                    <output className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-extrabold tabular-nums text-primary">{maxPrice} DH</output>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="1500"
                    step="10"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded bg-slate-200 accent-primary dark:bg-slate-800"
                    aria-label={language === 'FR' ? 'Prix maximum' : 'أقصى سعر'}
                  />
                  <div className="mt-2 flex justify-between text-[10px] font-medium tabular-nums text-slate-400 dark:text-slate-500">
                    <span>30 DH</span>
                    <span>1 500 DH</span>
                  </div>
                </section>
              </div>
            </div>
          </aside>

          {/* Right Column: Grid and Toolbar */}
          <div className="flex-grow w-full min-w-0 space-y-6">

            {/* Mobile-only static search bar (replaces removed sticky sub-header) */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="relative flex-grow">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'FR' ? 'Rechercher un produit...' : 'ابحثي عن منتج...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/5 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="relative px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                <span>{language === 'FR' ? 'Filtrer' : 'تصفية'}</span>
                {(selectedCategory !== 'all' || selectedBrands.length > 0 || selectedConcerns.length > 0 || ingredientQuery.trim() || searchQuery || maxPrice < 1500 || showOnlyMatches) && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center">
                    {selectedBrands.length + selectedConcerns.length + (ingredientQuery.trim() ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0) + (maxPrice < 1500 ? 1 : 0) + (showOnlyMatches ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Skin Diagnostic Profile Banner */}
            {diagnostic && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-500/20 dark:border-teal-500/30 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_20px_rgba(13,148,136,0.03)]">
                {/* Ambient sparkle graphics */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
                
                <div className="flex items-start gap-3.5 z-10">
                  <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
                    <Sparkles className="w-5 h-5 fill-current text-white animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5 leading-none mb-1">
                      {language === 'FR' ? 'Diagnostic de Peau Actif' : 'تحليل البشرة مفعل'}
                      <span className="px-2 py-0.5 rounded-full bg-teal-500 text-white text-[9px] font-black uppercase tracking-widest leading-none">
                        AI Matches
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {language === 'FR' 
                        ? `Votre profil : Peau ${diagnostic.skinType === 'oily' ? 'Grasse' : diagnostic.skinType === 'dry' ? 'Sèche' : diagnostic.skinType === 'sensitive' ? 'Sensible' : 'Mixte'} • Cible : ${CONCERNS_LIST.find((c: any) => c.id === diagnostic.concern)?.labelFR || diagnostic.concern}`
                        : `بشرتكِ: ${diagnostic.skinType === 'oily' ? 'دهنية' : diagnostic.skinType === 'dry' ? 'جافة' : diagnostic.skinType === 'sensitive' ? 'حساسة' : 'مختلطة'} • الهدف: ${CONCERNS_LIST.find((c: any) => c.id === diagnostic.concern)?.labelAR || diagnostic.concern}`}
                    </p>
                  </div>
                </div>

                {/* Match Toggle Switch */}
                <div className="flex items-center gap-3 z-10 shrink-0 self-start md:self-auto pt-2 md:pt-0">
                  <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                    {language === 'FR' ? 'Afficher uniquement les produits compatibles' : 'عرض المنتجات المتوافقة فقط'}
                  </span>
                  <button
                    onClick={() => setShowOnlyMatches(!showOnlyMatches)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      showOnlyMatches ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-205 ease-in-out ${
                        showOnlyMatches ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Toolbar: Sorting & Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 block">
                {totalResults === 1 
                  ? (language === 'FR' ? '1 produit disponible' : 'منتج واحد متوفر')
                  : (language === 'FR' ? `${totalResults} produits disponibles` : `${totalResults} منتجات متوفرة`)}
                </span>
                {pagination.total > 0 && !showOnlyMatches && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {language === 'FR'
                      ? `Lot ${pageStart}-${pageEnd} sur ${pagination.total}`
                      : `الدفعة ${pageStart}-${pageEnd} من ${pagination.total}`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-slate-700 dark:text-slate-300 cursor-pointer bg-white dark:bg-slate-900"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                  {language === 'FR' ? 'Filtrer' : 'تصفية'}
                </button>

                <div className="relative flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary/50 text-slate-700 dark:text-slate-300 text-xs rounded-xl px-3 py-2 outline-none cursor-pointer font-bold select-none"
                  >
                    <option value="alphabetical">{language === 'FR' ? 'Trier par : Nom A à Z' : 'الترتيب حسب: الاسم من أ إلى ي'}</option>
                    <option value="price-asc">{language === 'FR' ? 'Prix : Croissant' : 'السعر: من الأقل إلى الأكثر'}</option>
                    <option value="price-desc">{language === 'FR' ? 'Prix : Décroissant' : 'السعر: من الأكثر إلى الأقل'}</option>
                    <option value="rating">{language === 'FR' ? 'Trier par : Note Client' : 'الترتيب حسب: تقييم العملاء'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filter Tags */}
            {(selectedCategory !== 'all' || selectedBrands.length > 0 || selectedConcerns.length > 0 || ingredientQuery.trim() || searchQuery || maxPrice < 1500) && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{language === 'FR' ? 'Filtres actifs :' : 'التصفيات النشطة:'}</span>
                
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600">
                    &quot;{searchQuery}&quot;
                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => setSearchQuery('')} />
                  </span>
                )}

                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600">
                    {CATEGORIES_LIST.find((c: any) => c.id === selectedCategory)?.labelFR}
                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                  </span>
                )}

                {selectedBrands.map(brand => (
                  <span key={brand} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600">
                    {brand}
                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => handleBrandToggle(brand)} />
                  </span>
                ))}

                {selectedConcerns.map(concernId => (
                  <span key={concernId} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600">
                    {CONCERNS_LIST.find((c: any) => c.id === concernId)?.labelFR}
                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => handleConcernToggle(concernId)} />
                  </span>
                ))}

                {ingredientQuery.trim() && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600">
                    {ingredientQuery.trim()}
                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => setIngredientQuery('')} />
                  </span>
                )}

                {maxPrice < 1500 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600">
                    Max {maxPrice} DH
                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => setMaxPrice(1500)} />
                  </span>
                )}

                <button 
                  onClick={clearFilters}
                  className="text-[11px] font-extrabold text-primary hover:text-accent uppercase tracking-wider px-2 py-1 transition cursor-pointer"
                >
                  {language === 'FR' ? 'Effacer tout' : 'مسح الكل'}
                </button>
              </div>
            )}

            {/* Products Grid */}
            <div className="relative min-h-[420px]">
            {isPageLoading && (
              <div className="absolute inset-0 z-20 rounded-3xl bg-white/70 dark:bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-24">
                <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-600 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  {language === 'FR' ? 'Chargement du lot...' : 'تحميل الدفعة...'}
                </div>
              </div>
            )}
            {filteredProducts.length === 0 ? (
              <div className="space-y-12">
                <div className="text-center py-16 bg-white dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
                    {language === 'FR' ? 'Aucun produit ne correspond à ces critères' : 'لم يتم العثور على أي منتج يطابق هذه المعايير'}
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-primary hover:bg-accent text-white text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
                  >
                    {language === 'FR' ? 'Réinitialiser les filtres' : 'إعادة تعيين التصنيفات'}
                  </button>
                </div>

                {/* Best Sellers Recommendations */}
                <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-900">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 font-sans tracking-tight">
                        {language === 'FR' ? 'Nos Meilleurs Best-Sellers' : 'أفضل منتجاتنا مبيعاً'}
                      </h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {language === 'FR' ? 'Recommandations pour vous' : 'مقترحات مخصصة لكِ'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                    {recommendations.map((product, idx) => (
                      <div key={product.id} className="w-full">
                        <ProductCard product={product} showMatchScore={true} searchQuery={searchQuery} priority={idx < 2} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div 
                key={`${currentPage}-${selectedCategory}-${selectedBrands.join(',')}-${selectedConcerns.join(',')}-${searchQuery}-${maxPrice}-${showOnlyMatches}-${sortOption}`}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
              >
                {filteredProducts.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="w-full h-full animate-fade-in-up-stagger"
                    style={{
                      animationDelay: `${Math.min(11, index) * 35}ms`,
                      contentVisibility: 'auto',
                      containIntrinsicSize: '340px 520px',
                    }}
                  >
                    <ProductCard product={product} showMatchScore={true} searchQuery={searchQuery} priority={index < 4} />
                  </div>
                ))}
              </div>
            )}
            </div>

            {pagination.totalPages > 1 && !showOnlyMatches && (
              <div className="rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 shadow-sm dark:border-slate-900 dark:bg-slate-950">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {language === 'FR'
                      ? `Page ${pagination.page} / ${pagination.totalPages} - 50 produits par page`
                      : `الصفحة ${pagination.page} / ${pagination.totalPages}`}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1 || isPageLoading}
                      className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-600 transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {visiblePages.map(page => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => goToPage(page)}
                        disabled={isPageLoading}
                        className={`h-9 min-w-9 rounded-xl border px-3 text-xs font-black transition ${
                          page === currentPage
                            ? 'border-primary bg-primary text-white shadow-md shadow-primary/15'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= pagination.totalPages || isPageLoading}
                      className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-600 transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- MOBILE FILTER DRAWER SHEET --- */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-[2px] z-50 lg:hidden flex justify-end animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm h-full bg-white dark:bg-slate-950 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6 overflow-y-auto flex-1 pr-1 pb-4">
              <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-900">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  {language === 'FR' ? 'Filtrer les produits' : 'تصفية المنتجات'}
                </span>
                <button 
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 1. Mobile Search */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  {language === 'FR' ? 'Recherche rapide' : 'بحث سريع'}
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder={language === 'FR' ? 'Saisir un mot-clé...' : 'اكتب للبحث...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:border-primary/50 text-slate-800 dark:text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none transition"
                  />
                </div>
              </div>

              {/* 2. Mobile Categories */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  {language === 'FR' ? 'Catégories' : 'الفئات'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {displayedCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                        selectedCategory === cat.id
                          ? 'bg-primary/5 text-primary border border-primary/20'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-transparent'
                      }`}
                    >
                      {language === 'FR' ? cat.labelFR : cat.labelAR}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Mobile Concerns */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  {language === 'FR' ? 'Préoccupations' : 'مشاكل البشرة'}
                </label>
                <div className="space-y-2">
                  {CONCERNS_LIST.map((c: any) => {
                    const isChecked = selectedConcerns.includes(c.id);
                    return (
                      <label 
                        key={c.id}
                        className="flex items-center gap-3 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400 select-none"
                      >
                        <input 
                          type="radio"
                          name="catalog-mobile-concern"
                          checked={isChecked}
                          onChange={() => handleConcernToggle(c.id)}
                          className="rounded border-slate-300 dark:border-slate-800 text-primary focus:ring-primary w-4 h-4"
                        />
                        <span>{language === 'FR' ? c.labelFR : c.labelAR}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 4. Mobile Ingredients */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-primary" />
                  {language === 'FR' ? 'Ingrédients' : 'المكونات'}
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={ingredientQuery}
                    onChange={(event) => setIngredientQuery(event.target.value)}
                    placeholder={language === 'FR' ? 'Rechercher un ingrédient' : 'ابحث عن مكوّن'}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:border-primary/50 text-slate-800 dark:text-slate-100 text-xs rounded-xl pl-9 pr-9 py-2.5 outline-none transition"
                  />
                  {ingredientQuery && (
                    <button
                      type="button"
                      onClick={() => setIngredientQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                      aria-label={language === 'FR' ? 'Effacer l’ingrédient' : 'مسح المكوّن'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {INGREDIENTS.map(ingredient => (
                    <button
                      key={ingredient.query}
                      type="button"
                      onClick={() => setIngredientQuery(current => current.toLocaleLowerCase() === ingredient.query ? '' : ingredient.query)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition ${
                        ingredientQuery.toLocaleLowerCase() === ingredient.query
                          ? 'bg-primary border-primary text-white'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {ingredient.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Mobile Brands */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  {language === 'FR' ? 'Marques' : 'العلامات التجارية'}
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                  {brandsList.map(brand => {
                    const isChecked = selectedBrands.includes(brand);
                    return (
                      <label 
                        key={brand}
                        className="flex items-center gap-3 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400 select-none"
                      >
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleBrandToggle(brand)}
                          className="rounded border-slate-300 dark:border-slate-800 text-primary focus:ring-primary w-4 h-4"
                        />
                        <span>{brand}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 6. Mobile Price */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    {language === 'FR' ? 'Prix Maximum' : 'السعر الأقصى'}
                  </label>
                  <span className="text-xs font-mono font-bold text-primary">{maxPrice} DH</span>
                </div>
                <input 
                  type="range"
                  min="30"
                  max="1500"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none h-1.5"
                />
              </div>
            </div>

            {/* Bottom Sticky Action buttons */}
            <div className="border-t pt-4 border-slate-100 dark:border-slate-900 flex gap-3 mt-4">
              <button 
                onClick={() => { clearFilters(); setMobileFilterOpen(false); }}
                className="flex-1 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                {language === 'FR' ? 'Effacer' : 'مسح'}
              </button>
              <button 
                onClick={() => setMobileFilterOpen(false)}
                className="flex-grow py-3 bg-primary hover:bg-accent text-white font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                {language === 'FR' ? 'Appliquer' : 'تطبيق'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ShopShell>
  );
}
