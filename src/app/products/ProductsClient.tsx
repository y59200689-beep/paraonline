'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Product } from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';
import { ShopShell } from '@/components/ShopShell';
import { Search, SlidersHorizontal, Check, ArrowUpDown, X, AlertTriangle, Sparkles, Filter } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useUi } from '@/context/UiContext';

const CONCERNS = [
  { id: 'acne', labelFR: 'Acné & Imperfections', labelAR: 'حب الشباب والشوائب' },
  { id: 'spots', labelFR: 'Taches Brunes & Éclat', labelAR: 'البقع الداكنة والنضارة' },
  { id: 'dryness', labelFR: 'Sécheresse & Hydratation', labelAR: 'الجفاف والترطيب' },
  { id: 'wrinkles', labelFR: 'Rides & Anti-Âge', labelAR: 'التجاعيد ومكافحة الشيخوخة' },
  { id: 'redness', labelFR: 'Rougeurs & Peau Sensible', labelAR: 'الاحمرار والبشرة الحساسة' }
];

const BRANDS = [
  'Garnier',
  'Hada Labo Tokyo',
  'Bioderma',
  'Anua',
  'Skin1004',
  'Beauty of Joseon',
  'Solgar',
  'Embryolisse',
  'Vichy',
  'La Roche-Posay',
  'Mixa Bébé',
  'Maybelline',
  'Kérastase',
  'Foreo',
  'BeautyBlender'
];

const CATEGORIES = [
  { id: 'all', labelFR: 'Toutes catégories', labelAR: 'جميع الفئات' },
  { id: 'visage', labelFR: 'Visage & Peau', labelAR: 'الوجه والبشرة' },
  { id: 'solaire', labelFR: 'Protection Solaire', labelAR: 'واquiات الشمس' },
  { id: 'cheveux', labelFR: 'Soin Capillaire', labelAR: 'العناية بالشعر' },
  { id: 'kbeauty', labelFR: 'K-Beauty Coréenne', labelAR: 'الجمال الكوري' },
  { id: 'offers', labelFR: 'Offres & Coffrets', labelAR: 'العروض والمجموعات' }
];

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

export default function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const { language } = useTranslation();
  const { diagnostic } = useUi();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [sortOption, setSortOption] = useState('popular'); // popular, price-asc, price-desc, rating
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showOnlyMatches, setShowOnlyMatches] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const products = initialProducts;

  // Dynamic counts for filters
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach(cat => {
      if (cat.id === 'all') {
        counts[cat.id] = products.length;
      } else {
        counts[cat.id] = products.filter(p => p.category === cat.id || p.tags.includes(cat.id)).length;
      }
    });
    return counts;
  }, [products]);

  const concernCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CONCERNS.forEach(c => {
      counts[c.id] = products.filter(p => matchesConcern(p, c.id)).length;
    });
    return counts;
  }, [products]);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    BRANDS.forEach(brand => {
      counts[brand] = products.filter(p => p.vendor === brand).length;
    });
    return counts;
  }, [products]);

  // Sync initial query params if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat) setSelectedCategory(cat);
      const q = params.get('search');
      if (q) setSearchQuery(q);
    }
  }, []);

  // Scroll listener for sticky mobile header
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleConcernToggle = (concernId: string) => {
    setSelectedConcerns(prev =>
      prev.includes(concernId) ? prev.filter(c => c !== concernId) : [...prev, concernId]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrands([]);
    setSelectedConcerns([]);
    setMaxPrice(1500);
    setShowOnlyMatches(false);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) ||
        (p.nameFr || '').toLowerCase().includes(q) ||
        (p.vendor || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory || p.tags.includes(selectedCategory));
    }

    // Brands filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.vendor));
    }

    // Concerns filter
    if (selectedConcerns.length > 0) {
      result = result.filter(p => 
        selectedConcerns.every(concernId => matchesConcern(p, concernId))
      );
    }

    // Price filter
    result = result.filter(p => p.price <= maxPrice);

    // Diagnostic compatibility filter
    if (showOnlyMatches && diagnostic) {
      result = result.filter(p => {
        const score = getProductMatchScore(p, diagnostic);
        return score !== null && score >= 80;
      });
    }

    // Sorting
    if (sortOption === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedBrands, selectedConcerns, maxPrice, sortOption, showOnlyMatches, diagnostic]);

  const recommendations = useMemo(() => {
    return [...products]
      .filter(p => p.rating >= 4.7)
      .slice(0, 4);
  }, [products]);

  return (
    <ShopShell>
      {/* Sticky Mobile Sub-Header */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 px-4 py-3 flex items-center gap-3 shadow-md transition-all duration-300 transform lg:hidden ${
          isSticky ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder={language === 'FR' ? 'Rechercher...' : 'بحث...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none"
          />
        </div>
        {/* Filter Trigger Button */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="relative px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 text-xs font-bold shrink-0 cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5 text-primary" />
          <span>{language === 'FR' ? 'Filtrer' : 'تصفية'}</span>
          {(selectedCategory !== 'all' || selectedBrands.length > 0 || selectedConcerns.length > 0 || searchQuery || maxPrice < 1500 || showOnlyMatches) && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center">
              {selectedBrands.length + selectedConcerns.length + (selectedCategory !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0) + (maxPrice < 1500 ? 1 : 0) + (showOnlyMatches ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 py-12 select-none">
        
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
          
          {/* Desktop Filters Sidebar - 1/4 Width */}
          <aside className="hidden lg:block w-72 shrink-0 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl p-6 space-y-6 shadow-sm sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto pr-3 custom-sidebar-scroll">
            <style dangerouslySetInnerHTML={{__html: `
              .custom-sidebar-scroll::-webkit-scrollbar {
                width: 4px;
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

            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-900">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                {language === 'FR' ? 'Filtres de recherche' : 'خيارات التصفية'}
              </span>
              <button 
                onClick={clearFilters}
                className="text-[11px] font-bold text-primary hover:text-accent uppercase transition"
              >
                {language === 'FR' ? 'Réinitialiser' : 'إعادة تعيين'}
              </button>
            </div>

            {/* 1. Search Bar */}
            <div className="space-y-2 pb-4 border-b border-slate-100/60 dark:border-slate-900/60">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                {language === 'FR' ? 'Recherche rapide' : 'بحث سريع'}
              </span>
              <div className="relative mt-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder={language === 'FR' ? 'Saisir un mot-clé...' : 'اكتب للبحث...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:border-primary/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none transition"
                />
              </div>
            </div>

            {/* 2. Categories */}
            <div className="space-y-3 pb-4 border-b border-slate-100/60 dark:border-slate-900/60">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                {language === 'FR' ? 'Catégories' : 'الفئات'}
              </span>
              <div className="flex flex-col gap-1.5 mt-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      selectedCategory === cat.id
                        ? 'bg-primary/5 text-primary'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{language === 'FR' ? cat.labelFR : cat.labelAR}</span>
                      <span className="text-[9.5px] opacity-60 font-mono">({categoryCounts[cat.id] || 0})</span>
                    </span>
                    {selectedCategory === cat.id && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Skin Concerns */}
            <div className="space-y-3 pb-4 border-b border-slate-100/60 dark:border-slate-900/60">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                {language === 'FR' ? 'Préoccupations de Peau' : 'مشاكل البشرة'}
              </span>
              <div className="space-y-2 mt-2">
                {CONCERNS.map(c => {
                  const isChecked = selectedConcerns.includes(c.id);
                  return (
                    <label 
                      key={c.id}
                      className="flex items-center gap-3 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 select-none justify-between w-full"
                    >
                      <div className="flex items-center gap-2.5">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleConcernToggle(c.id)}
                          className="rounded border-slate-300 dark:border-slate-800 text-primary focus:ring-primary w-4 h-4"
                        />
                        <span>{language === 'FR' ? c.labelFR : c.labelAR}</span>
                      </div>
                      <span className="text-[9.5px] opacity-60 font-mono">({concernCounts[c.id] || 0})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. Brands */}
            <div className="space-y-3 pb-4 border-b border-slate-100/60 dark:border-slate-900/60">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                {language === 'FR' ? 'Marques' : 'العلامات التجارية'}
              </span>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 mt-2 custom-sidebar-scroll">
                {BRANDS.map(brand => {
                  const isChecked = selectedBrands.includes(brand);
                  return (
                    <label 
                      key={brand}
                      className="flex items-center gap-3 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 select-none justify-between w-full"
                    >
                      <div className="flex items-center gap-2.5">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleBrandToggle(brand)}
                          className="rounded border-slate-300 dark:border-slate-800 text-primary focus:ring-primary w-4 h-4"
                        />
                        <span>{brand}</span>
                      </div>
                      <span className="text-[9.5px] opacity-60 font-mono">({brandCounts[brand] || 0})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 5. Price Limit */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                {language === 'FR' ? 'Prix Maximum' : 'السعر الأقصى'}
              </span>
              <div className="space-y-3 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500">{language === 'FR' ? 'Limite' : 'الحد'}</span>
                  <span className="text-xs font-mono font-bold text-primary">{maxPrice} DH</span>
                </div>
                <input 
                  type="range"
                  min="30"
                  max="1500"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                />
              </div>
            </div>
          </aside>

          {/* Right Column: Grid and Toolbar */}
          <div className="flex-grow w-full min-w-0 space-y-6">
            
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
                        ? `Votre profil : Peau ${diagnostic.skinType === 'oily' ? 'Grasse' : diagnostic.skinType === 'dry' ? 'Sèche' : diagnostic.skinType === 'sensitive' ? 'Sensible' : 'Mixte'} • Cible : ${CONCERNS.find(c => c.id === diagnostic.concern)?.labelFR || diagnostic.concern}`
                        : `بشرتكِ: ${diagnostic.skinType === 'oily' ? 'دهنية' : diagnostic.skinType === 'dry' ? 'جافة' : diagnostic.skinType === 'sensitive' ? 'حساسة' : 'مختلطة'} • الهدف: ${CONCERNS.find(c => c.id === diagnostic.concern)?.labelAR || diagnostic.concern}`}
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

            {/* Quick-Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 mr-1.5">
                {language === 'FR' ? 'Accès rapide :' : 'وصول سريع:'}
              </span>
              
              {/* Reset / All Pill */}
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20'
                    : 'bg-white dark:bg-slate-950 border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {language === 'FR' ? 'Tous les produits' : 'جميع المنتجات'}
              </button>

              {/* Tag Pills */}
              {[
                { id: 'solaire', labelFR: 'Solaire ☀️', labelAR: 'واقي شمس' },
                { id: 'kbeauty', labelFR: 'K-Beauty 🇰🇷', labelAR: 'جمال كوري' },
                { id: 'visage', labelFR: 'Soin Visage 🧴', labelAR: 'عناية بالوجه' },
                { id: 'acne', labelFR: 'Anti-Acné 🌿', labelAR: 'حب الشباب', type: 'concern' },
                { id: 'spots', labelFR: 'Anti-Taches ✨', labelAR: 'تفتيح البقع', type: 'concern' },
                { id: 'wrinkles', labelFR: 'Anti-Âge 🧬', labelAR: 'مكافحة الشيخوخة', type: 'concern' },
                { id: 'Garnier', labelFR: 'Garnier', labelAR: 'Garnier', type: 'brand' },
                { id: 'Anua', labelFR: 'Anua', labelAR: 'Anua', type: 'brand' },
                { id: 'Skin1004', labelFR: 'Skin1004', labelAR: 'Skin1004', type: 'brand' },
                { id: 'Beauty of Joseon', labelFR: 'Joseon', labelAR: 'Joseon', type: 'brand' }
              ].map(pill => {
                let isActive = false;
                if (!pill.type) isActive = selectedCategory === pill.id;
                else if (pill.type === 'concern') isActive = selectedConcerns.includes(pill.id);
                else if (pill.type === 'brand') isActive = selectedBrands.includes(pill.id);

                const handlePillClick = () => {
                  if (!pill.type) {
                    setSelectedCategory(pill.id);
                  } else if (pill.type === 'concern') {
                    handleConcernToggle(pill.id);
                  } else if (pill.type === 'brand') {
                    handleBrandToggle(pill.id);
                  }
                };

                return (
                  <button
                    key={pill.id}
                    onClick={handlePillClick}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20'
                        : 'bg-white dark:bg-slate-950 border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {language === 'FR' ? pill.labelFR : pill.labelAR}
                  </button>
                );
              })}
            </div>

            {/* Toolbar: Sorting & Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-slate-500">
                {filteredProducts.length === 1 
                  ? (language === 'FR' ? '1 produit disponible' : 'منتج واحد متوفر')
                  : (language === 'FR' ? `${filteredProducts.length} produits disponibles` : `${filteredProducts.length} منتجات متوفرة`)}
              </span>

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
                    <option value="popular">{language === 'FR' ? 'Trier par : Popularité' : 'الترتيب حسب: الأكثر شعبية'}</option>
                    <option value="price-asc">{language === 'FR' ? 'Prix : Croissant' : 'السعر: من الأقل إلى الأكثر'}</option>
                    <option value="price-desc">{language === 'FR' ? 'Prix : Décroissant' : 'السعر: من الأكثر إلى الأقل'}</option>
                    <option value="rating">{language === 'FR' ? 'Trier par : Note Client' : 'الترتيب حسب: تقييم العملاء'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filter Tags */}
            {(selectedCategory !== 'all' || selectedBrands.length > 0 || selectedConcerns.length > 0 || searchQuery || maxPrice < 1500) && (
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
                    {CATEGORIES.find(c => c.id === selectedCategory)?.labelFR}
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
                    {CONCERNS.find(c => c.id === concernId)?.labelFR}
                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => handleConcernToggle(concernId)} />
                  </span>
                ))}

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
                    {recommendations.map(product => (
                      <div key={product.id} className="w-full">
                        <ProductCard product={product} showMatchScore={true} searchQuery={searchQuery} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div 
                key={`${selectedCategory}-${selectedBrands.join(',')}-${selectedConcerns.join(',')}-${searchQuery}-${maxPrice}-${showOnlyMatches}-${sortOption}`}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
              >
                {filteredProducts.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="w-full animate-fade-in-up-stagger"
                    style={{ animationDelay: `${Math.min(11, index) * 35}ms` }}
                  >
                    <ProductCard product={product} showMatchScore={true} searchQuery={searchQuery} />
                  </div>
                ))}
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
                  {CATEGORIES.map(cat => (
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
                  {CONCERNS.map(c => {
                    const isChecked = selectedConcerns.includes(c.id);
                    return (
                      <label 
                        key={c.id}
                        className="flex items-center gap-3 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400 select-none"
                      >
                        <input 
                          type="checkbox"
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

              {/* 4. Mobile Brands */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  {language === 'FR' ? 'Marques' : 'العلامات التجارية'}
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                  {BRANDS.map(brand => {
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

              {/* 5. Mobile Price */}
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
